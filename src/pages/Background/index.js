const Sentiment = require('sentiment');

const sentiment = new Sentiment();
const extras = [
  'scam',
  'drainer',
  'revoke',
  'hacked',
  'phishing',
  'exploit',
  'rug',
  'stolen',
];
// normal words scored from -5 to 5, we assign -25 to put emphasis on the words in 'extras'
const EXTRAS_SCORE = -25;
// website scores under this bound are reported as unsafe
const OVERALL_UPPER_BOUND = -10;
// tweets scored under this bound qualify to be the "See why" tweet
const HIGHLIGHT_UPPER_BOUND = -2;

const TWITTER_ENDPOINT = 'https://api.twitter.com/2/tweets/search/recent';

const getScore = (tweet) => {
  const result = sentiment.analyze(tweet, {
    extras: extras.reduce((acc, curr) => ((acc[curr] = EXTRAS_SCORE), acc), {}),
  });
  return result.score;
};

const getTweets = async (keyword, next_token, level = 1) => {
  const url = new URL(TWITTER_ENDPOINT);

  // get all tweets starting from 24H ago local time
  let today = new Date();
  const offset = today.getTimezoneOffset();
  today = new Date(today.getTime() - offset * 60 * 1000);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // exclude `-🎉` from query (Premint entry confirmation tweets use it and causes spam)
  url.searchParams.append('query', `${keyword} -is:retweet -🎉 lang:en`);
  url.searchParams.append('max_results', 100); // 100 is limit per query
  url.searchParams.append('sort_order', 'relevancy');
  url.searchParams.append('start_time', yesterday.toISOString());
  url.searchParams.append('tweet.fields', 'author_id,public_metrics');
  if (next_token) url.searchParams.append('next_token', next_token);

  const headers = new Headers();
  headers.append(
    'Authorization',
    'Bearer INSERT_BEARER_HERE'
  );

  const requestOptions = {
    method: 'GET',
    headers,
    redirect: 'follow',
  };

  try {
    const response = await fetch(url, requestOptions);
    const result = await response.json();
    let tweets = result.data ?? [];
    if (result.meta.next_token && level < 5)
      // recursively get up to 5 levels (500) tweets
      tweets = tweets.concat(
        await getTweets(keyword, result.meta.next_token, ++level)
      );

    // remove tweets from same users/same text (prevent spam)
    return tweets.reduce((unique, o) => {
      if (
        !unique.some(
          (obj) => obj.author_id === o.author_id || obj.text === o.text
        )
      ) {
        unique.push(o);
      }
      return unique;
    }, []);
  } catch (e) {
    console.log('Error fetching tweets: ' + e);
  }
};

const alertUnsafe = async (keyword, tabId) => {
  const tweets = await getTweets(keyword);
  let score = 0;
  let highlight = tweets[0];
  for (let tweet of tweets) {
    const tweetScore = getScore(tweet.text);
    if (
      tweetScore < HIGHLIGHT_UPPER_BOUND &&
      tweet.public_metrics.like_count > highlight.public_metrics.like_count
    )
      // get the most liked tweet that has a score < the set highlight upper bound
      highlight = tweet;
    score += tweetScore;
  }

  console.log(keyword + ': ' + score);
  if (score < OVERALL_UPPER_BOUND) {
    chrome.tabs.sendMessage(tabId, { type: 'ALERT', highlight: highlight.id });
    return true;
  }

  return false;
};

async function getTab() {
  let queryOptions = { active: true, lastFocusedWindow: true };
  let [tab] = await chrome.tabs.query(queryOptions);

  return tab;
}

chrome.runtime.onMessage.addListener(async (obj, sender, response) => {
  const tab = await getTab();

  switch (obj.type) {
    case 'CONNECT':
      const { hostname } = new URL(tab.url);
      const keywords = hostname.split('.');
      // ex. ["app", "uniswap", "org"] => ["uniswap", "org"]
      if (keywords.length == 3) keywords.shift();

      // check full hostname (ex. 'yearn finance') for impersonation
      if (await alertUnsafe(keywords.join(' '), tab.id)) return;

      // check website's scraped Twitter tag or domain name if no Twitter
      // was found (ex. '@Uniswap' or 'uniswap')
      chrome.tabs.sendMessage(
        tab.id,
        { type: 'TWITTER' },
        async function (response) {
          await alertUnsafe(
            response.twitter ? response.twitter : keywords[0],
            tab.id
          );
        }
      );
      break;
    case 'APPROVAL':
      let name, image;

      try {
        const contractResponse = await fetch(
          'https://api.looksrare.org/api/v1/collections?address=' + obj.contract
        );
        const tokenResponse = await fetch(
          'https://api.looksrare.org/api/v1/tokens?collection=' +
            obj.contract +
            '&tokenId=1'
        );
        const contractRes = await contractResponse.json();
        const tokenRes = await tokenResponse.json();
        (name = contractRes.data.name), (image = tokenRes.data.imageURI);
      } catch (e) {
        console.log('Failed to fetch metadata:' + e);
      }

      chrome.tabs.sendMessage(tab.id, {
        type: 'APPROVAL_ALERT',
        name,
        image,
      });
  }
});

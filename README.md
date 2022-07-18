# Sentry
<img src="https://cdn.discordapp.com/attachments/720708383002591253/998666315613085726/unknown.png" width="800">

Sentry is an open-sourced Google Chrome extension that uses Tweet sentiment and transaction data analysis to alert users of malicious smart contracts, exploited protocols, impersonated NFT mints, and more.

## Local Development
To run the codebase locally, run the following commands:
```
// clone the repository
git clone https://github.com/kevinz420/sentry.git

// go into the root directory
cd sentry

// install dependencies
npm install

// build project
npm run start (development) / npm run build (production)
```

## Project Overview
### Motivation
Phishing sites and hacked protocols are a huge issue in the Web3 sphere, resulting in the loss of billions of dollars in assets. Seemingly no protocols are safe, as even the most established names (ex. Uniswap, Etherscan, Premint) have had incidents in the recent past. Sentry seeks to use crowdsourced information to inform unknowing users of an unsafe contract and monitor outgoing Ethereum RPC requests for unsafe function signatures (ex. setApprovalForAll) in order to mitigate the effects of phishing attacks, all in a lightweight, unintrusive manner that does not take away from overall user experience.

### Primary Features
- Twitter Sentiment Analysis
  - Query Twitter for a list of recent Tweets mentioning the protocol
  - Utilize the AFINN-165 wordlist and Emoji Sentiment Ranking to perform analysis on these Tweets and determine an overall reputation score
- Function Signature Monitoring
  - Pick up outgoing Ethereum RPC requests that are potentially dangerous
  - Send a notification alert that specifies the exact asset being targeted by the transaction
- Lightweight Notifications
   - Injects notifications into the native website DOM to create an unintrusive alert process that does not take away from overall user experience

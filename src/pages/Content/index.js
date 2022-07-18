// monkey patching `window.ethereum` to wrap outgoing RPC requests
(() => {
  var th = document.getElementsByTagName('body')[0];
  var s = document.createElement('script');
  s.setAttribute('type', 'text/javascript');
  s.setAttribute('src', chrome.runtime.getURL('script.bundle.js'));
  th.appendChild(s);
})();

// new wrapped requests will emit events when called
document.addEventListener('requestAccounts', () =>
  chrome.runtime.sendMessage({ type: 'CONNECT' })
);

document.addEventListener('setApproval', (e) =>
  chrome.runtime.sendMessage({ type: 'APPROVAL', contract: e.detail.contract })
);

// main functionality below
chrome.runtime.onMessage.addListener(async (obj, sender, response) => {
  switch (obj.type) {
    // Twitter sentiment indicates unsafe website, create toast notifcation
    case 'ALERT':
      let div = document.createElement('div');
      document.body.appendChild(div);
      let shadow = div.attachShadow({ mode: 'open' });

      shadow.innerHTML = `<div id="toast-warning" role="alert">
            <div class="logo-container">
              <svg aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
              </svg>
              <span>Warning icon</span>
            </div>
            <div class="msg">Smart contract potentially unsafe. <b class="hyper" onclick="window.open('https://twitter.com/user/status/${obj.highlight}', '_blank');">See why.</b></div>
            <button type="button" aria-label="Close" onclick="return this.parentNode.remove();">
              <span>Close</span>
              <svg aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
              </svg>
            </button>
          </div>`;

      var link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = chrome.runtime.getURL('content.styles.css');
      shadow.appendChild(link);
      break
    // scrape twitter URL from website (if exists)
    case 'TWITTER':
      if (!document.body.innerHTML.includes('twitter.com')) {
        response({ twitter: undefined });
        return;
      }

      const loc = document.body.innerHTML.split('twitter.com/')[1];
      const idx = loc.indexOf('"');
      response({ twitter: loc.substring(0, idx) });
      break
    // transaction called sendApprovalForAll, create toast notifcation
    case 'APPROVAL_ALERT':
      let d = document.createElement('div');
      document.body.appendChild(d);
      let s = d.attachShadow({ mode: 'open' });
      s.innerHTML = `
      <div id="toast-warning" role="alert">
        <div id="container">
          <img src="${obj.image ?? chrome.runtime.getURL('default.png')}" />
          <div class="msg">
            <div class="title">Set Approval For All</div>
            <div class="description">This transaction is requesting permission to manage <b>${obj.name} NFTs</b> you own. Please verify that this is the expected behavior.</div>
          </div>
          <button type="button" data-dismiss-target="#toast-message-cta" aria-label="Close" onclick="return this.parentNode.parentNode.remove();">
            <span>Close</span>
            <svg aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
            </svg>
          </button>
        </div>
      </div>`;

      let l = document.createElement('link');
      l.rel = 'stylesheet';
      l.href = chrome.runtime.getURL('content.styles.css');
      s.appendChild(l);
  }
});

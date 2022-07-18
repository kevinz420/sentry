const req = window.ethereum.request;
const send = window.ethereum.send;
const sendAsync = window.ethereum.sendAsync;
const enable = window.ethereum.enable;

// all `setApprovalForAll` function signatures prefixed with this
const SET_APPROVAL_FOR_ALL = '0xa22cb465';

window.ethereum.request = async function (args) {
  if (args.method == 'eth_requestAccounts') {
    let event = new CustomEvent('requestAccounts');
    document.dispatchEvent(event);
  } else if (
    args.method == 'eth_sendTransaction' &&
    args.params[0].data.startsWith(SET_APPROVAL_FOR_ALL)
  ) {
    let event = new CustomEvent('setApproval', {
      detail: { contract: args.params[0].to },
    });
    document.dispatchEvent(event);
  }

  return await req(args);
};

window.ethereum.send = async function (methodOrPayload, paramsOrCallback) {
  if (methodOrPayload == 'eth_requestAccounts') {
    let event = new CustomEvent('requestAccounts');
    document.dispatchEvent(event);
  } else if (
    methodOrPayload == 'eth_sendTransaction' &&
    paramsOrCallback[0].data.startsWith(SET_APPROVAL_FOR_ALL)
  ) {
    let event = new CustomEvent('setApproval', {
      detail: { contract: paramsOrCallback[0].to },
    });
    document.dispatchEvent(event);
  }
  return await send(methodOrPayload, paramsOrCallback);
};

window.ethereum.sendAsync = async function (payload, callback) {
  if (payload.method == 'eth_requestAccounts') {
    let event = new CustomEvent('requestAccounts');
    document.dispatchEvent(event);
  } else if (
    payload.method == 'eth_sendTransaction' &&
    payload.params[0].data.startsWith(SET_APPROVAL_FOR_ALL)
  ) {
    let event = new CustomEvent('setApproval', {
      detail: { contract: payload.params[0].to },
    });
    document.dispatchEvent(event);
  }
  return await sendAsync(payload, callback);
};

window.ethereum.enable = async function (args) {
  let event = new CustomEvent('requestAccounts');
  document.dispatchEvent(event);
  return await enable(args);
};

let timer; // global for overriding timeout
const delay = 500; // ms

chrome.webRequest.onCompleted.addListener(
  request => {
    // we don't care about anything but GETs
    if (request.method === 'GET') {
      // sendMessage({ type: 'log', data: request }); // logging

      clearTimeout(timer);
      timer = setTimeout(sendMessage, delay, { type: 'run' });
    }
  },
  { urls: ['*://*.linkedin.com/*'] }
);

function sendMessage(messageToSend) {
  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    lastTabId = tabs[0].id;
    chrome.tabs.sendMessage(lastTabId, messageToSend);
  });
}

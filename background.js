
/* *********************************************************
* Enable/Disable Chrome extension based on .pt ending link *
************************************************************/
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    const updatedUrl = changeInfo.url || tab.url; // Fallback to tab.url if changeInfo.url is undefined
  
    if (updatedUrl && updatedUrl.includes('.pt')) {
      chrome.action.enable(tabId);
    } else {
      chrome.action.disable(tabId);
    }
  });
  
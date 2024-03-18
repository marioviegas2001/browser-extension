// Define an array of allowed domains
const allowedDomains = ["www.publico.pt"];

// Listen for changes in the active tab
chrome.tabs.onActivated.addListener(function(activeInfo) {
    // Get information about the activated tab
    chrome.tabs.get(activeInfo.tabId, function(tab) {
        if (tab && isAllowedDomain(tab.url)) {
            console.log("Current tab:", tab);
            chrome.action.enable(tab.id);
        } else {
            chrome.action.disable(tab.id);
            console.log("Not on an allowed domain.");
        }
    });
});

// Listen for changes in the reloaded tabs
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  if (changeInfo.status === "complete" && !isAllowedDomain(tab.url)) {
      chrome.action.disable(tabId);
  }
});

// Function to check if a given URL belongs to an allowed domain
function isAllowedDomain(url) {
    const domain = new URL(url).hostname;
    console.log("Domain:", domain);
    return allowedDomains.includes(domain);
}
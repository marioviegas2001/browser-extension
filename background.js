/* *********************************************************
* Receive data from content.js and send it to popup.js     *
************************************************************/
let extractedData = null;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'extractedContent') {
    extractedData = message.data;
  } else if (message.action === 'getExtractedData') {
    // Send the extracted data to the popup script
    sendResponse({ data: extractedData });
  }
});

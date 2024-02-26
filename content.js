// Find all h1 and p elements and retrieve their text content
const headings = Array.from(document.querySelectorAll('h1')).map(h => h.textContent);
const paragraphs = Array.from(document.querySelectorAll('p')).map(p => p.textContent);

// Send the extracted text content back to the background script
chrome.runtime.sendMessage({
  action: 'extractedContent',
  data: {
    headings: headings,
    paragraphs: paragraphs
  }
});
// Define the JSON data within the extension's code
const websiteSelectors = {
  "www.publico.pt": {
    "titleSelector": ".headline",
    "descriptionSelector": ".story__blurb p",
    "articleContentSelector": ".story__body"
  }
  //Add more websites and their respective selectors
};

// Extract selectors based on current website domain
const currentWebsite = window.location.hostname;
const selectors = websiteSelectors[currentWebsite];
if (selectors) {
  // Extract title
  const title = document.querySelector(selectors.titleSelector)?.textContent.trim() || '';

  // Extract description
  const descriptionElement = document.querySelector(selectors.descriptionSelector);
  const description = descriptionElement ? descriptionElement.textContent.trim() : '';

  // Extract article content
  const storyBodyElement = document.querySelector(selectors.articleContentSelector);
  const articleContent = storyBodyElement ? storyBodyElement.innerHTML : '';

  // Send the extracted information back to the background script
  chrome.runtime.sendMessage({
    action: 'extractedContent',
    data: {
      title: title,
      description: description,
      articleContent: articleContent
    }
  });
} else {
  console.log('Selectors for current website not found.');
}

// Extract title
const title = document.querySelector('.headline').textContent.trim();

// Extract description
const descriptionElement = document.querySelector('.story__blurb p');
const description = descriptionElement ? descriptionElement.textContent.trim() : '';

// Extract article content
const storyBodyElement = document.querySelector('.story__body');
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
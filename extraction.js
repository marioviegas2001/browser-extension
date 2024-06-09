// extraction.js

function extractNewsArticleData(jsonData, displayVariables) {
    const {
      headline, description, dateCreated, dateModified, datePublished, articleSection,
      articleBody, author, keywords, url, publisher
    } = jsonData;
  
    displayVariables.headlineToDisplay = headline || displayVariables.headlineToDisplay;
    displayVariables.descriptionToDisplay = description || displayVariables.descriptionToDisplay;
    displayVariables.datePublishedToDisplay = datePublished || displayVariables.datePublishedToDisplay;
    displayVariables.dateModifiedToDisplay = dateModified || displayVariables.dateModifiedToDisplay;
    displayVariables.dateCreatedToDisplay = dateCreated || displayVariables.datePublishedToDisplay;
    displayVariables.articleSectionToDisplay = articleSection || displayVariables.articleSectionToDisplay;
    displayVariables.articleContentToDisplay = articleBody || displayVariables.articleContentToDisplay;
    displayVariables.authorToDisplay = author || displayVariables.authorToDisplay;
    displayVariables.keywordsToDisplay = keywords || displayVariables.keywordsToDisplay;
    displayVariables.urlToDisplay = url || displayVariables.urlToDisplay;
    displayVariables.publisherToDisplay = publisher?.name || displayVariables.publisherToDisplay;
  }
  
  function fetchAndExtractSelectors(selectors, displayVariables) {
    const currentWebsite = window.location.hostname;
    const websiteSelectors = selectors[currentWebsite];
    let containerElement = '';
  
    if (!displayVariables.headlineToDisplay && websiteSelectors) {
      displayVariables.headlineToDisplay = document.querySelector(websiteSelectors.titleSelector)?.textContent.trim() || '';
    }
  
    if (!displayVariables.descriptionToDisplay && websiteSelectors) {
      const descriptionElement = document.querySelector(websiteSelectors.descriptionSelector);
      displayVariables.descriptionToDisplay = descriptionElement ? descriptionElement.textContent.trim() : '';
    }
  
    if (!displayVariables.articleContentToDisplay && websiteSelectors) {
      const storyBodyElement = document.querySelector(websiteSelectors.articleContentSelector);
      displayVariables.articleContentToDisplay = storyBodyElement ? storyBodyElement.innerHTML : '';
    }
  
    if (websiteSelectors) {
      containerElement = document.querySelector(websiteSelectors.containerSelector);
      const headerImages = document.querySelectorAll(websiteSelectors.containerSelector + ' img');
      const articleImages = document.querySelectorAll(websiteSelectors.articleContentSelector + ' img');
      displayVariables.imagesInArticle = headerImages.length + articleImages.length;
    }
  
    return { containerElement, websiteSelectors };
  }
  
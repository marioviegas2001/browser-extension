// main.js

// Initialize variables to store extracted data
let displayVariables = {
  headlineToDisplay: '',
  descriptionToDisplay: '',
  articleContentToDisplay: '',
  datePublishedToDisplay: '',
  dateModifiedToDisplay: '',
  dateCreatedToDisplay: '',
  articleSectionToDisplay: '',
  authorToDisplay: [],
  keywordsToDisplay: [],
  urlToDisplay: '',
  publisherToDisplay: '',
  imagesInArticle: 0
};

// Main script execution starts here
(async function main() {
  const scriptTags = document.querySelectorAll('script');

  for (let scriptTag of scriptTags) {
    const scriptContent = scriptTag.textContent.trim();

    if (scriptContent.startsWith('{')) {
      try {
        const jsonData = JSON.parse(scriptContent);

        if (jsonData['@type'] === 'NewsArticle') {
          console.log('Extracted JSON-LD:', jsonData);
          extractNewsArticleData(jsonData, displayVariables);
          break;
        }
      } catch (error) {
        // Ignore JSON parsing errors for non-NewsArticle scripts
      }
    }
  }

  try {
    const selectorsResponse = await fetch(chrome.runtime.getURL('selectors.json'));
    const selectors = await selectorsResponse.json();

    const { containerElement } = fetchAndExtractSelectors(selectors, displayVariables);

    const authors = displayVariables.authorToDisplay.map(person => person.name);
    const data = {
      url: displayVariables.urlToDisplay,
      title: displayVariables.headlineToDisplay,
      author: authors,
      published_date: displayVariables.datePublishedToDisplay,
      created_date: displayVariables.dateCreatedToDisplay,
      modified_date: displayVariables.dateModifiedToDisplay,
      keywords: displayVariables.keywordsToDisplay,
      source: displayVariables.publisherToDisplay
    };

    console.log('Headline:', displayVariables.headlineToDisplay);
    console.log('Description:', displayVariables.descriptionToDisplay);
    console.log('Date Published:', displayVariables.datePublishedToDisplay);
    console.log('Date Modified:', displayVariables.dateModifiedToDisplay);
    console.log('Date Created:', displayVariables.dateCreatedToDisplay);
    console.log('Article Section:', displayVariables.articleSectionToDisplay);
    console.log('Article Body:', displayVariables.articleContentToDisplay);
    console.log('Author:', displayVariables.authorToDisplay);
    console.log('Keywords:', displayVariables.keywordsToDisplay);
    console.log('URL:', displayVariables.urlToDisplay);

    const cleanedText = removeHTMLTags(displayVariables.articleContentToDisplay).replace(/\bhttps?:\/\/\S+/gi, '');
    console.log('Cleaned text:', cleanedText);

    const summary = await summarizeArticle(cleanedText);
    const { wordCount, sentenceCount, syllableCount, readingTime, fk } = calculateReadabilityMetrics(cleanedText, displayVariables.imagesInArticle);

    containerElement.prepend(constructHTML(readingTime, fk, summary));

    try {
      const entities = await extractEntities(cleanedText);
      console.log('Extracted Entities:', entities);

      // Sort entities by confidence and select the top 5
      const topEntities = entities.sort((a, b) => b.confidence - a.confidence).slice(0, 5);

      // Add top 5 entities to data (only the name)
      data.entities = topEntities.map(entity => entity.spot);

      postExtractedData(data);

      const articleToChange = document.querySelector(selectors[window.location.hostname].articleContentSelector);
      highlightEntitiesInHTML(entities, articleToChange);
      addTooltips(entities);
    } catch (error) {
      console.error('Error extracting entities:', error);
    }
  } catch (error) {
    console.error('Error fetching selectors or processing data:', error);
  }
})();

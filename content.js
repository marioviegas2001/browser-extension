// Initialize variables to store extracted data
let headlineToDisplay = '';
let descriptionToDisplay = '';
let articleContentToDisplay = '';
let datePublishedToDisplay = '';
let dateModifiedToDisplay = '';
let dateCreatedToDisplay = '';
let articleSectionToDisplay = '';
let authorToDisplay = [];
let keywordsToDisplay = [];
let urlToDisplay = '';
let publisherToDisplay = '';
let imagesInArticle = 0;

// Function to remove HTML tags from a string
function removeHTMLTags(text) {
  if (window.location.hostname === "www.publico.pt") {
    text = text.replace(/<section class="stack stack--learn-more stack-social-tools">.*?<\/section>/gis, '');
  }
  return text.replace(/<[^>]*>/g, ' '); // Replace HTML tags with an empty string
}

// Function to count sentences in a text
function countSentences(text) {
  const sentences = text.match(/[^.!?]*[.!?]/g);
  return sentences ? sentences.length : 0;
}

// Function to count syllables in a Portuguese word
function countSyllables(word) {
  // Check if the word contains digits or punctuation typical in numbers
  if (/\d/.test(word)) {
    return 0;
  }

  // Match all vowel clusters (including diphthongs and trithongs)
  const vowels = word.match(/[aeiouáéíóúâêîôûãõàèìòù]+/gi);

  // If no vowels are found, return 1 syllable (It's an entity name or acronym)
  if (!vowels) return 1;

  // Handle specific cases where certain digraphs should count as single syllables
  const digraphs = /lh|nh|ch|gu|qu/gi;
  const separated = word.split(digraphs);

  // Count the number of vowel clusters, adjusted for digraphs
  let syllableCount = separated.reduce((acc, part) => {
    const vowelClusters = part.match(/[aeiouáéíóúâêîôûãõàèìòù]+/gi);
    return acc + (vowelClusters ? vowelClusters.length : 0);
  }, 0);

  // Handle specific cases of hiatus for 'a', 'i', and 'u'
  const hiatoA = word.match(/a[íìî]/gi) || [];
  const hiatoI = word.match(/(?<![gq])i[aeiouáéíóúâêîôûãõàèìòù]/gi) || [];
  const hiatoU = word.match(/(?<![gq])u[aeiouáéíóúâêîôûãõàèìòù]/gi) || [];

  const hiatoCount = hiatoI.length + hiatoU.length + hiatoA.length;
  syllableCount += hiatoCount;

  return syllableCount;
}

// Function to extract data from NewsArticle JSON-LD
function extractNewsArticleData(jsonData) {
  const {
    headline, description, dateCreated, dateModified, datePublished, articleSection,
    articleBody, author, keywords, url, publisher
  } = jsonData;

  headlineToDisplay = headline || headlineToDisplay;
  descriptionToDisplay = description || descriptionToDisplay;
  datePublishedToDisplay = datePublished || datePublishedToDisplay;
  dateModifiedToDisplay = dateModified || dateModifiedToDisplay;
  dateCreatedToDisplay = dateCreated || datePublishedToDisplay; // dateCreated is equivalent to datePublished if not available
  articleSectionToDisplay = articleSection || articleSectionToDisplay;
  articleContentToDisplay = articleBody || articleContentToDisplay;
  authorToDisplay = author || authorToDisplay;
  keywordsToDisplay = keywords || keywordsToDisplay;
  urlToDisplay = url || urlToDisplay;
  publisherToDisplay = publisher?.name || publisherToDisplay;
}

// Function to fetch and extract data using selectors
function fetchAndExtractSelectors(selectors) {
  const currentWebsite = window.location.hostname;
  const websiteSelectors = selectors[currentWebsite];
  let containerElement = '';

  if (!headlineToDisplay && websiteSelectors) {
    headlineToDisplay = document.querySelector(websiteSelectors.titleSelector)?.textContent.trim() || '';
  }

  if (!descriptionToDisplay && websiteSelectors) {
    const descriptionElement = document.querySelector(websiteSelectors.descriptionSelector);
    descriptionToDisplay = descriptionElement ? descriptionElement.textContent.trim() : '';
  }

  if (!articleContentToDisplay && websiteSelectors) {
    const storyBodyElement = document.querySelector(websiteSelectors.articleContentSelector);
    articleContentToDisplay = storyBodyElement ? storyBodyElement.innerHTML : '';
  }

  if (websiteSelectors) {
    containerElement = document.querySelector(websiteSelectors.containerSelector);

    const headerImages = document.querySelectorAll(websiteSelectors.containerSelector + ' img');
    const articleImages = document.querySelectorAll(websiteSelectors.articleContentSelector + ' img');
    imagesInArticle = headerImages.length + articleImages.length;
  }

  return { containerElement, websiteSelectors };
}

// Function to post extracted data to the server
function postExtractedData(data) {
  fetch("http://localhost:8080/articles", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
  .then((response) => {
    if (response.ok) {
      console.log("Article saved successfully!");
    } else {
      console.error("Failed to save article:", response.statusText);
    }
  })
  .catch((error) => {
    console.error("Error saving article:", error);
  });
}

// Function to calculate readability metrics
function calculateReadabilityMetrics(cleanedText) {
  const words = cleanedText.trim().split(/\s+/);
  const wordCount = words.length;
  const sentenceCount = countSentences(cleanedText);
  const syllableCount = words.reduce((total, word) => total + countSyllables(word), 0);
  const readingTime = Math.ceil(wordCount / 238 + (imagesInArticle * 0.083));

  let fk = 0.883 * (wordCount / sentenceCount) + 17.347 * (syllableCount / wordCount) - 41.239;
  fk = Math.round(fk);

  return { wordCount, sentenceCount, syllableCount, readingTime, fk };
}

// Function to extract entities using Dandelion API
async function extractEntities(text) {
  const apiKey = '0472965430784b599bdae78299fbeb28';
  const minConfidence = 0.75;
  const chunkSize = 1000; // Define the chunk size based on the API's limitations
  const chunks = [];

  // Split text into chunks
  for (let i = 0; i < text.length; i += chunkSize) {
    chunks.push(text.slice(i, i + chunkSize));
  }

  const entityResults = [];

  for (const chunk of chunks) {
    const apiUrl = `https://api.dandelion.eu/datatxt/nex/v1/?html_fragment=${encodeURIComponent(chunk)}&lang=pt&token=${apiKey}&min_confidence=${minConfidence}&include=abstract,image`;

    try {
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const data = await response.json();
      entityResults.push(...data.annotations);
    } catch (error) {
      console.error('Error extracting entities:', error);
    }
  }

  return entityResults;
}


// Function to highlight entities and create links to Wikipedia pages
function highlightEntitiesInHTML(entities, htmlElement) {
  // Iterate through the entities
  entities.forEach(entity => {
    // Get the entity name and Wikipedia URI
    const entityName = entity.spot;
    const wikipediaURI = entity.uri;

    // Create a regular expression to match the entity name in the HTML content
    //const regex = new RegExp(`(?:^|\\s)(${entityName})(?=[\\s,.!?"]|$)`, 'gi');
    const regex = new RegExp(`(?:^|\\s)(${entityName})`, 'gi');


    // Find all occurrences of the entity name in the HTML content
    const matches = htmlElement.textContent.match(regex);

    // If matches are found, replace each occurrence with a link to the Wikipedia page
    if (matches) {
      htmlElement.innerHTML = htmlElement.innerHTML.replace(regex, ` <a href="${wikipediaURI}" class="entity-link" target="_blank">${entityName}</a>`);
    }
  });
}

// Function to add tooltips to highlighted elements
function addTooltips(entities) {
  entities.forEach(entity => {
    const entityValue = entity.spot;
    const entityAbstract = entity.abstract || 'No abstract available';
    const entityImage = entity.image.thumbnail || '';

    // Select all highlighted elements that match the entity value
    const highlightedElements = document.querySelectorAll(`.entity-link`);

    highlightedElements.forEach(element => {
      if (element.textContent.trim() === entityValue) {
        const tooltip = document.createElement('span');
        tooltip.className = 'tooltip';
        // Add image to tooltip if available
        const tooltipContent = `
          ${entityImage ? `<img src="${entityImage}" alt="${entityValue}" class="tooltip-image">` : ''}
          <p>${entityAbstract}</p>
        `;
        tooltip.innerHTML = tooltipContent;
        element.appendChild(tooltip);
      }
    });
  });
}
// Main script execution starts here
(async function main() {
  const scriptTags = document.querySelectorAll('script');

  for (let scriptTag of scriptTags) {
    const scriptContent = scriptTag.textContent.trim();

    if (scriptContent.startsWith('{')) { // Basic check for JSON-like content
      try {
        const jsonData = JSON.parse(scriptContent);

        if (jsonData['@type'] === 'NewsArticle') {
          console.log('Extracted JSON-LD:', jsonData);
          extractNewsArticleData(jsonData);
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

    const { containerElement } = fetchAndExtractSelectors(selectors);

    const authors = authorToDisplay.map(person => person.name);
    const data = {
      url: urlToDisplay,
      title: headlineToDisplay,
      author: authors,
      published_date: datePublishedToDisplay,
      created_date: dateCreatedToDisplay,
      modified_date: dateModifiedToDisplay,
      keywords: keywordsToDisplay,
      source: publisherToDisplay
    };

    postExtractedData(data);

    console.log('Headline:', headlineToDisplay);
    console.log('Description:', descriptionToDisplay);
    console.log('Date Published:', datePublishedToDisplay);
    console.log('Date Modified:', dateModifiedToDisplay);
    console.log('Date Created:', dateCreatedToDisplay);
    console.log('Article Section:', articleSectionToDisplay);
    console.log('Article Body:', articleContentToDisplay);
    console.log('Author:', authorToDisplay);
    console.log('Keywords:', keywordsToDisplay);
    console.log('URL:', urlToDisplay);

    const cleanedText = removeHTMLTags(articleContentToDisplay).replace(/\bhttps?:\/\/\S+/gi, '');
    console.log('Cleaned text:', cleanedText);

    const { wordCount, sentenceCount, syllableCount, readingTime, fk } = calculateReadabilityMetrics(cleanedText);

    // Display readability metrics
    console.log('Word count:', wordCount);
    console.log('Sentence count:', sentenceCount);
    console.log('Syllable count:', syllableCount);
    console.log('Reading time:', readingTime);
    console.log('Flash-Kinkaid Grade Level:', fk);
    
    containerElement.prepend(constructHTML(readingTime, fk));

    // Proceed with entity extraction
    try {
      const entities = await extractEntities(cleanedText);
      console.log('Extracted Entities:', entities);

      // Get the HTML element containing the article content
      const articleToChange = document.querySelector(selectors[window.location.hostname].articleContentSelector);

      // Highlight entities in the HTML content
      highlightEntitiesInHTML(entities, articleToChange);
      // Add tooltips to the highlighted elements
      addTooltips(entities);
    } catch (error) {
      console.error('Error extracting entities:', error);
    }
  } catch (error) {
    console.error('Error fetching selectors or processing data:', error);
  }
})();

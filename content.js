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

// Main script execution starts here
(function main() {
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

  fetch(chrome.runtime.getURL('selectors.json'))
    .then(response => response.json())
    .then(selectors => {
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

      console.log('Word count:', wordCount);
      console.log('Sentence count:', sentenceCount);
      console.log('Syllable count:', syllableCount);
      console.log('Reading time:', readingTime);
      console.log('Flash-Kinkaid Grade Level:', fk);

      containerElement.prepend(constructHTML(readingTime, fk));
    })
    .catch(error => {
      console.error('Error fetching selectors:', error);
    });
})();

// Define the JSON data within the extension's code
const websiteSelectors = {
  "www.publico.pt": {
    "titleSelector": ".headline",
    "descriptionSelector": ".story__blurb p",
    "articleContentSelector": ".story__body"
  }
};

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

// Find all script tags on the page
const scriptTags = document.querySelectorAll('script');
const currentWebsite = window.location.hostname;
const selectors = websiteSelectors[currentWebsite];


/* TAKES DATA FROM THE NEWSARTICLE SCRIPT IF IT EXISTS */
// Iterate over each script tag
for (let i = 0; i < scriptTags.length; i++) {
  const scriptTag = scriptTags[i];
  try {
    // Try parsing the content of the script tag as JSON
    const jsonData = JSON.parse(scriptTag.textContent.trim());
    
    // Check if the parsed JSON data is of type NewsArticle
    if (jsonData['@type'] === 'NewsArticle') {
      console.log('Extracted JSON-LD:', jsonData);
      
      // Extract and print specific fields from the JSON
      const { headline, 
        description, 
        dateCreated, 
        dateModified, 
        datePublished, 
        articleSection,
        articleBody,
        author, 
        keywords, 
        url} = jsonData;

      // Assign values from JSON-LD if available
      headlineToDisplay = headline || headlineToDisplay;
      descriptionToDisplay = description || descriptionToDisplay;
      datePublishedToDisplay = datePublished || datePublishedToDisplay;
      dateModifiedToDisplay = dateModified || dateModifiedToDisplay;
      dateCreatedToDisplay = dateCreated || datePublishedToDisplay; // Assuming dateCreated is equivalent to datePublished if not available
      articleSectionToDisplay = articleSection || articleSectionToDisplay;
      articleContentToDisplay = articleBody || articleContentToDisplay;
      authorToDisplay = author || authorToDisplay;
      keywordsToDisplay = keywords || keywordsToDisplay;
      urlToDisplay = url || urlToDisplay;
      
      break;
    }
  } catch (error) {
    // If parsing as JSON fails, continue to the next script tag
    console.error('Error parsing JSON:', error);
  }
}

/* TAKES DATA FROM THE MANUALLY MADE JSON IN CASE DATA IS MISSING*/
if (!headlineToDisplay && selectors) {
  // Extract title
  headlineToDisplay = document.querySelector(selectors.titleSelector)?.textContent.trim() || '';
}
if (!descriptionToDisplay && selectors) {
  // Extract lead
  const descriptionElement = document.querySelector(selectors.descriptionSelector);
  descriptionToDisplay = descriptionElement ? descriptionElement.textContent.trim() : '';
}

if (!articleContentToDisplay && selectors) {
   // Extract article content
   const storyBodyElement = document.querySelector(selectors.articleContentSelector);
   articleContentToDisplay = storyBodyElement ? storyBodyElement.innerHTML : '';
}


// Log the extracted data
/* console.log('Headline:', headlineToDisplay );
console.log('Description:', descriptionToDisplay);
console.log('Date Published:', datePublishedToDisplay );
console.log('Date Modified:', dateModifiedToDisplay);
console.log('Date Created:', dateCreatedToDisplay);
console.log('articleSection:', articleSectionToDisplay);
console.log('articleBody:', articleContentToDisplay );
console.log('author:', authorToDisplay);
console.log('keywords:', keywordsToDisplay);
console.log('url:', urlToDisplay ); */

// Function to remove HTML tags from a string
function removeHTMLTags(text) {
  return text.replace(/<[^>]*>/g, ''); // Replace HTML tags with an empty string
}

// Remove HTML tags and links from articleContentToDisplay
const cleanedText = removeHTMLTags(articleContentToDisplay)
  .replace(/\bhttps?:\/\/\S+/gi, ''); // Remove links starting with http or https

// Split the cleaned text into words
const words = cleanedText.trim().split(/\s+/);

// Count the number of words
const wordCount = words.length;

console.log('words:', words);
console.log('Word Count:', wordCount );
const readingTime = Math.ceil(wordCount / 238);

// Create a new div container
const containerDiv = document.createElement('div');
containerDiv.classList.add('word-count-container'); // Add the CSS class to the container

// Create an h1 element for the header
const headerElement = document.createElement('h1');
headerElement.textContent = 'News Analysis';

// Create a new element for the word count
const readingTimeElement = document.createElement('div');
readingTimeElement.textContent = `Estimated reading time: ${readingTime}min`;

// Append the header and word count elements to the container
containerDiv.appendChild(headerElement);
containerDiv.appendChild(readingTimeElement);

// Find the .story__body div
const storyBodyDiv = document.querySelector('.story__header');

// Append the word count element to the .headline div
storyBodyDiv.prepend(containerDiv);

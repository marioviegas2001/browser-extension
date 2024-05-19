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

// Find all script tags on the page
const scriptTags = document.querySelectorAll('script');

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
        url,
        publisher} = jsonData;

      // Assign values from JSON if available
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
      publisherToDisplay = publisher["name"] || publisherToDisplay;
      console.log("publisherToDisplay", publisherToDisplay);
      
      break;
    }
  } catch (error) {
    console.error('Error parsing JSON:', error);
  }
}

/* TAKES DATA FROM THE MANUALLY MADE JSON IN CASE DATA IS MISSING*/
// Fetch the selectors data from selectors.json
fetch(chrome.runtime.getURL('selectors.json'))
  .then(response => response.json())
  .then(selectors => {
    const currentWebsite = window.location.hostname;
    const websiteSelectors = selectors[currentWebsite];
    let containerElement = '';

    if (!headlineToDisplay && websiteSelectors) {
      // Extract title
      headlineToDisplay = document.querySelector(websiteSelectors.titleSelector)?.textContent.trim() || '';
    }

    if (!descriptionToDisplay && websiteSelectors) {
      // Extract description
      const descriptionElement = document.querySelector(websiteSelectors.descriptionSelector);
      descriptionToDisplay = descriptionElement ? descriptionElement.textContent.trim() : '';
    }

    if (!articleContentToDisplay  && websiteSelectors) {
      // Extract article content
      const storyBodyElement = document.querySelector(websiteSelectors.articleContentSelector);
      articleContentToDisplay = storyBodyElement ? storyBodyElement.innerHTML : '';
    }

    if (websiteSelectors) {
      //Select the place to display the main container
      containerElement = document.querySelector(websiteSelectors.containerSelector);

      // Extract the number of images in the whole article
      const headerImages = document.querySelectorAll(websiteSelectors.containerSelector + ' img');
      const articleImages = document.querySelectorAll(websiteSelectors.articleContentSelector + ' img');
      imagesInArticle = headerImages.length + articleImages.length;
    }

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

    // Log the extracted data
    console.log('Headline:', headlineToDisplay );
    console.log('Description:', descriptionToDisplay);
    console.log('Date Published:', datePublishedToDisplay );
    console.log('Date Modified:', dateModifiedToDisplay);
    console.log('Date Created:', dateCreatedToDisplay);
    console.log('articleSection:', articleSectionToDisplay);
    console.log('articleBody:', articleContentToDisplay );
    console.log('author:', authorToDisplay);
    console.log('keywords:', keywordsToDisplay);
    console.log('url:', urlToDisplay );
    

    // Function to remove HTML tags from a string
    function removeHTMLTags(text) {
      if (currentWebsite == "www.publico.pt") {
        text = text.replace(/<section class="stack stack--learn-more stack-social-tools">.*?<\/section>/gis, '');
      }
      return text.replace(/<[^>]*>/g, ' '); // Replace HTML tags with an empty string
    }
    
    // Function to count sentences
    function countSentences(text) {
      // Using regex to count sentence-ending punctuation marks
      const sentences = text.match(/[^.!?]*[.!?]/g);
      return sentences ? sentences.length : 0;
    }
    
    // Function to count syllables in a Portuguese word
    // MAKE SURE TO CHECK THE SYLLABLE COUNTING RULES DEEPER
    function countSyllables(word) {
      // Check if the word contains digits or punctuation typical in numbers
      if (/\d/.test(word)) {
        return 0;
      }
    
      // Match all vowel clusters (including diphthongs and trithongs)
      const vowels = word.match(/[aeiouáéíóúâêîôûãõàèìòù]+/gi);
    
      // If no vowels are found, return 1 syllable (I'ts an entity name or acronym)
      if (!vowels) return 1;
    
      // Handle specific cases where certain digraphs should count as single syllables
      const digraphs = /lh|nh|ch|gu|qu/gi;
      const separated = word.split(digraphs);
    
      // Count the number of vowel clusters, adjusted for digraphs
      let syllableCount = separated.reduce((acc, part) => {
        const vowelClusters = part.match(/[aeiouáéíóúâêîôûãõàèìòù]+/gi);
        return acc + (vowelClusters ? vowelClusters.length : 0);
      }, 0);
    
      // Handle specific cases of hiatus for 'a', 'i' and 'u'
      const hiatoA = word.match(/a[íìî]/gi) || [];
      const hiatoI = word.match(/(?<![gq])i[aeiouáéíóúâêîôûãõàèìòù]/gi) || [];
      const hiatoU = word.match(/(?<![gq])u[aeiouáéíóúâêîôûãõàèìòù]/gi) || [];
    
      const hiatoCount = hiatoI.length + hiatoU.length+ hiatoA.length;
      syllableCount += hiatoCount;
    
      return syllableCount;
    }


    // Remove HTML tags and links from articleContentToDisplay
    const cleanedText = removeHTMLTags(articleContentToDisplay).replace(/\bhttps?:\/\/\S+/gi, '');
    
    console.log('Cleaned text:', cleanedText);
    
    // Split the cleaned text into words
    const words = cleanedText.trim().split(/\s+/);
    console.log('Words:', words);
    
    // Count the number of words in the article
    const wordCount = words.length;
    
    // Count the number of sentences in the article
    const sentenceCount = countSentences(cleanedText);
    
    // Count the total number of syllables in the article
    const syllableCount = words.reduce((total, word) => total + countSyllables(word), 0);
    // Calculate the reading time
    const readingTime = Math.ceil(wordCount / 238 + (imagesInArticle * 0.083));

    //Calculate Flash-Kinkaid Grade Level - PT version
    const fk = 0.883 * (wordCount / sentenceCount) + 17.347 * (syllableCount / wordCount) - 41.239;
    
    console.log('Word count:', wordCount);
    console.log('Sentence count:', sentenceCount);
    console.log('Syllable count:', syllableCount);
    console.log('Flash-Kinkaid Grade Level:', fk);
    
    // Function to construct the HTML to display the word count
    containerDiv = constructHTML(readingTime);

    // Append the word count element to the .headline div
    containerElement.prepend(containerDiv);

  })
  .catch(error => {
    console.error('Error fetching selectors:', error);
  });




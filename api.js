// api.js

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
  
  async function cleanArticleContent(htmlContent) {
    const url = 'http://localhost:8080/clean';
    const headers = {
        'Content-Type': 'application/json'
    };
    const data = {
        html_content: htmlContent
    };
  
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(data)
        });
  
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
  
        const result = await response.json();
        console.log('Cleaned text:', result.cleaned_text);
        console.log('Cleaned html:', result.cleaned_html);
        const cleanedText = result.cleaned_text;
        const cleanedHTML = result.cleaned_html;
        return {cleanedText, cleanedHTML};
    } catch (error) {
        console.error('Error cleaning article content:', error);
    }
  }

  async function summarizeArticle(articleText) {
    const url = 'http://localhost:8080/summarize';
    const headers = {
        'Content-Type': 'application/json'
    };
    const data = {
        article_text: articleText
    };
  
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(data)
        });
  
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
  
        const result = await response.json();
        console.log('Summary:', result.summary);
        return result.summary;
    } catch (error) {
        console.error('Error summarizing article:', error);
    }
  }

  async function categorizeArticle(articleText) {
    const url = 'http://localhost:8080/categorize_article';
    const headers = {
        'Content-Type': 'application/json'
    };
    const data = {
        article_text: articleText
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();
        console.log('Category:', result.category);
        return result.category;
    } catch (error) {
        console.error('Error categorizing article:', error);
    }
}


  async function analyzeSources(cleanedText) {
    const url = 'http://localhost:8080/analyze_sources';
    const headers = {
        'Content-Type': 'application/json'
    };
    const data = {
        article: cleanedText
    };
  
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(data)
        });
  
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
  
        const result = await response.json();
        console.log('Credible sources count:', result.sources_count);
        console.log('Score:', result.score);
        return result.sources_count;
    } catch (error) {
        console.error('Error analyzing sources:', error);
    }
  }

  async function getLateralReadingQuestions(cleanedText) {
    const url = 'http://localhost:8080/lateral_reading_questions';
    const headers = {
        'Content-Type': 'application/json'
    };
    const data = {
        article: cleanedText
    };
  
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(data)
        });
  
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
  
        const result = await response.json();
        console.log('Lateral Reading Questions:', result.lateral_reading_questions);
        return result.lateral_reading_questions;
    } catch (error) {
        console.error('Error getting lateral reading questions:', error);
    }
}

async function analyzeLanguage(cleanedText) {
  const url = 'http://localhost:8080/analyze_language';
  const headers = {
      'Content-Type': 'application/json'
  };
  const data = {
    article: cleanedText
  };

  try {
      const response = await fetch(url, {
          method: 'POST',
          headers: headers,
          body: JSON.stringify(data)
      });

      if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Language Analysis:', result.language_analysis_report);
      return result.language_analysis_report;
  } catch (error) {
      console.error('Error analyzing language:', error);
  }
}


  
  async function extractEntities(text) {
    const apiKey = CONFIG.DANDELION_API_KEY;
    const minConfidence = 0.75;
    const chunkSize = 1000; // Define the chunk size based on the API's limitations
    const chunks = [];
  
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
  
chrome.runtime.sendMessage({ action: 'getExtractedData' }, (response) => {
  if (response && response.data) {
    const extractedData = response.data;
    const textFromHTML = document.getElementById('textFromHTML');
    let htmlContent = '<h2>Extracted Headings:</h2>';
    extractedData.headings.forEach((heading) => {
      htmlContent += `<p>${heading}</p>`;
    });

    htmlContent += '<h2>Extracted Paragraphs:</h2>';
    extractedData.paragraphs.forEach((paragraph) => {
      htmlContent += `<p>${paragraph}</p>`;
    });

    // Set the HTML content to the div
    textFromHTML.innerHTML = htmlContent;
  } else {
    textFromHTML.innerHTML = '<h2>No data available</h2>';
  }
});
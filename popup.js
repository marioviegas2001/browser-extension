chrome.runtime.sendMessage({ action: 'getExtractedData' }, (response) => {
  if (response && response.data) {
    const extractedData = response.data;
    const textFromHTML = document.getElementById('textFromHTML');
    let htmlContent = '<h2>Title</h2>';
    htmlContent += `<p>${extractedData.title}</p>`;

    htmlContent += '<h2>Description:</h2>';
    htmlContent += `<p>${extractedData.description}</p>`;

    htmlContent += '<h2>Article:</h2>';
    htmlContent += `<p>${extractedData.articleContent}</p>`;
    

    // Set the HTML content to the div
    textFromHTML.innerHTML = htmlContent;
  } else {
    textFromHTML.innerHTML = '<h2>No data available</h2>';
  }
});
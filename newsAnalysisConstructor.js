function constructHTML(readingTime) {
    const containerDiv = document.createElement('div');
    containerDiv.classList.add('news-analysis-container');
  
    const headerElement = document.createElement('h1');
    headerElement.textContent = 'News Analysis';
    headerElement.classList.add('container-header');
  
    const readingTimeElement = document.createElement('div');
    readingTimeElement.classList.add('reading-time');

    const readingTimeTitle = document.createElement('span');
    readingTimeTitle.textContent = `Estimated reading time: `;
    readingTimeTitle.classList.add('reading-time-title');

    const readingTimeMetric = document.createElement('span');
    readingTimeMetric.textContent = `${readingTime} min`;
    readingTimeMetric.classList.add('reading-time-metric');
  
    containerDiv.appendChild(headerElement);
    containerDiv.appendChild(readingTimeElement);
    readingTimeElement.appendChild(readingTimeTitle);
    readingTimeElement.appendChild(readingTimeMetric);
  
    return containerDiv;
  }
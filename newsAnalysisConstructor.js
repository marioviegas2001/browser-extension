function createMainContainer() {
  const containerDiv = document.createElement('div');
  containerDiv.classList.add('news-analysis-container');

  const headerElement = document.createElement('h1');
  headerElement.textContent = 'News Analysis';
  headerElement.classList.add('container-header');

  const contentDiv = document.createElement('div');
  contentDiv.classList.add('container-content');

  const contentDiv2 = document.createElement('div');
  contentDiv2.classList.add('container-summary');

  containerDiv.appendChild(headerElement);
  containerDiv.appendChild(contentDiv);
  containerDiv.appendChild(contentDiv2);

  return { containerDiv, contentDiv, contentDiv2 };
}

function createReadingTimeContainer(readingTime) {
  const readingTimeElement = document.createElement('div');
  readingTimeElement.classList.add('reading-time');

  const readingTimeTitle = document.createElement('span');
  readingTimeTitle.textContent = 'Estimated reading time: ';
  readingTimeTitle.classList.add('reading-time-title');

  const readingTimeMetric = document.createElement('span');
  readingTimeMetric.textContent = `${readingTime} min`;
  readingTimeMetric.classList.add('reading-time-metric');

  readingTimeElement.appendChild(readingTimeTitle);
  readingTimeElement.appendChild(readingTimeMetric);

  return readingTimeElement;
}

function createReadingGradeLevelContainer(readingGradeLevel) {
  const readingGradeLevelElement = document.createElement('div');
  readingGradeLevelElement.classList.add('reading-grade-level');

  const readingGradeLevelTitle = document.createElement('span');
  readingGradeLevelTitle.textContent = 'Estimated reading grade level: ';
  readingGradeLevelTitle.classList.add('reading-grade-level-title');

  const readingGradeLevelMetric = document.createElement('span');
  readingGradeLevelMetric.textContent = `${readingGradeLevel}`;
  readingGradeLevelMetric.classList.add('reading-grade-level-metric');

  readingGradeLevelElement.appendChild(readingGradeLevelTitle);
  readingGradeLevelElement.appendChild(readingGradeLevelMetric);

  return readingGradeLevelElement;
}

function createSummaryContainer(summary) {
  const summaryContainer = document.createElement('div');
  summaryContainer.classList.add('summary-container');

  const summaryHeader = document.createElement('h2');
  summaryHeader.textContent = 'Summary';
  summaryHeader.classList.add('summary-header');

  const summaryContent = document.createElement('div');
  summaryContent.textContent = summary;
  summaryContent.classList.add('summary-content');

  summaryContainer.appendChild(summaryHeader);
  summaryContainer.appendChild(summaryContent);

  return summaryContainer;
}

function constructHTML(readingTime, readingGradeLevel, summary) {
  const { containerDiv, contentDiv, contentDiv2 } = createMainContainer();
  const readingTimeElement = createReadingTimeContainer(readingTime);
  const readingGradeLevelElement = createReadingGradeLevelContainer(readingGradeLevel);
  const summaryContainer = createSummaryContainer(summary);

  contentDiv.appendChild(readingTimeElement);
  contentDiv.appendChild(readingGradeLevelElement);
  contentDiv2.appendChild(summaryContainer);

  return containerDiv;
}

function createMainContainer() {
  const containerDiv = document.createElement('div');
  containerDiv.classList.add('news-analysis-container');

  const headerElement = document.createElement('h1');
  headerElement.textContent = 'News Analysis';
  headerElement.classList.add('container-header');

  const contentDiv = document.createElement('div');
  contentDiv.classList.add('container-content');

  containerDiv.appendChild(headerElement);
  containerDiv.appendChild(contentDiv);

  return { containerDiv, contentDiv };
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

function constructHTML(readingTime, readingGradeLevel) {
  const { containerDiv, contentDiv } = createMainContainer();
  const readingTimeElement = createReadingTimeContainer(readingTime);
  const readingGradeLevelElement = createReadingGradeLevelContainer(readingGradeLevel);

  contentDiv.appendChild(readingTimeElement);
  contentDiv.appendChild(readingGradeLevelElement);

  return containerDiv;
}

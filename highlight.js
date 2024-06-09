// highlight.js

function highlightEntitiesInHTML(entities, htmlElement) {
    entities.forEach(entity => {
      const entityName = entity.spot;
      const wikipediaURI = entity.uri;
      const regex = new RegExp(`(?:^|\\s)(${entityName})`, 'gi');
      const matches = htmlElement.textContent.match(regex);
  
      if (matches) {
        htmlElement.innerHTML = htmlElement.innerHTML.replace(regex, ` <a href="${wikipediaURI}" class="entity-link" target="_blank">${entityName}</a>`);
      }
    });
  }
  
  function addTooltips(entities) {
    entities.forEach(entity => {
      const entityValue = entity.spot;
      const entityAbstract = entity.abstract || 'No abstract available';
      const entityImage = entity.image.thumbnail || '';
  
      const highlightedElements = document.querySelectorAll(`.entity-link`);
      highlightedElements.forEach(element => {
        if (element.textContent.trim() === entityValue) {
          const tooltip = document.createElement('span');
          tooltip.className = 'tooltip';
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
  
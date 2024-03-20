// Function to handle saving the current page
function savePage() {
  // Get the current tab
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      // Get the URL and title of the current tab
      const url = tabs[0].url;
      const title = tabs[0].title;
      // Save the URL and title to local storage or send them to your server
      // For example, you can use chrome.storage.local to save data locally
      chrome.storage.local.get('savedPagesMap', function(data) {
          const savedPagesMap = data.savedPagesMap || {};
          savedPagesMap[url] = { url: url, title: title };
          chrome.storage.local.set({ 'savedPagesMap': savedPagesMap }, function() {
              console.log('Page saved:', title);
              // Update the saved pages display
              displaySavedPages();
          });
      });
  });
}

// Function to handle cleaning all saved data from local storage
function clearSavedData() {
  // Ask for confirmation before clearing all saved data
  if (confirm('Are you sure you want to delete all saved news?')) {
      // Clear all saved data from local storage
      chrome.storage.local.remove('savedPagesMap', function() {
          console.log('All saved data cleared');
          // Update the saved pages display
          displaySavedPages();
      });
  }
}

// Function to handle displaying saved pages
function displaySavedPages() {
  // Retrieve saved pages from local storage
  chrome.storage.local.get('savedPagesMap', function(data) {
      const savedPagesMap = data.savedPagesMap || {};
      console.log('Saved Articles:', savedPagesMap);
      // Get the container to display saved pages
      const savedPagesContainer = document.getElementById('savedPages');
      // Clear the container
      savedPagesContainer.innerHTML = '';

      // Check if there are no saved pages
      if (Object.keys(savedPagesMap).length === 0) {
        savedPagesContainer.textContent = 'Nothing to show yet. Save some news!';
        return;
      }
      // Loop through the saved pages map and create a component for each one
      Object.values(savedPagesMap).forEach(function(page) {
          const pageComponent = document.createElement('div');
          pageComponent.classList.add('saved-page');

          // Create a span for the page title
          const titleSpan = document.createElement('span');
          titleSpan.textContent = page.title;

          // Create a button to delete the saved page
          const deleteButton = document.createElement('button');
          deleteButton.textContent = 'Delete';
          deleteButton.classList.add('delete-button');

          // Add click event listener to delete the saved page
          deleteButton.addEventListener('click', function() {
              // Remove the page from the savedPagesMap
              delete savedPagesMap[page.url];
              // Update the savedPagesMap in local storage
              chrome.storage.local.set({ 'savedPagesMap': savedPagesMap }, function() {
                  // Update the displayed saved pages
                  displaySavedPages();
              });
          });

          // Append title span and delete button to the page component
          pageComponent.appendChild(titleSpan);
          pageComponent.appendChild(deleteButton);

          // Open the saved page in a new tab when clicked on the title
          titleSpan.addEventListener('click', function() {
              chrome.tabs.create({ url: page.url });
          });

          // Determine the domain and assign a class based on it
          const domain = new URL(page.url).hostname;
          if (domain === 'www.publico.pt') {
              pageComponent.classList.add('publico-domain');
          } else if (domain === 'expresso.pt') {
              pageComponent.classList.add('expresso-domain');
          }

          // Append the page component to the saved pages container
          savedPagesContainer.appendChild(pageComponent);
      });
  });
}


// Add event listeners to the buttons
document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('saveButton').addEventListener('click', savePage);
  document.getElementById('clearButton').addEventListener('click', clearSavedData);
  // Display saved pages when popup is opened
  displaySavedPages();
});

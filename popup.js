// Function to handle saving the current page
function savePage() {
  // Get the current tab
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      // Get the URL and title of the current tab
      const url = tabs[0].url;
      const title = tabs[0].title;
      // Save the URL and title to local storage or send them to your server
      // For example, you can use chrome.storage.local to save data locally
      chrome.storage.local.get('savedPages', function(data) {
          const savedPages = data.savedPages || [];
          savedPages.push({ url: url, title: title });
          chrome.storage.local.set({ 'savedPages': savedPages }, function() {
              console.log('Page saved:', title);
              // Update the saved pages display
              displaySavedPages();
          });
      });
  });
}

// Function to handle cleaning all saved data from local storage
function clearSavedData() {
  // Clear all saved data from local storage
  chrome.storage.local.remove('savedPages', function() {
      console.log('All saved data cleared');
      // Update the saved pages display
      displaySavedPages();
  });
}

// Function to handle displaying saved pages
function displaySavedPages() {
  // Retrieve saved pages from local storage
  chrome.storage.local.get('savedPages', function(data) {
      const savedPages = data.savedPages || [];
      console.log('Saved pages:', savedPages);
      // Get the container to display saved pages
      const savedPagesContainer = document.getElementById('savedPages');
      // Clear the container
      savedPagesContainer.innerHTML = '';
      // Loop through saved pages and create a component for each one
      savedPages.forEach(function(page) {
          const pageComponent = document.createElement('div');
          pageComponent.classList.add('saved-page');
          pageComponent.textContent = page.title;
          // Open the saved page in a new tab when clicked
          pageComponent.addEventListener('click', function() {
              chrome.tabs.create({ url: page.url });
          });

          // Determine the domain and assign a class based on it
          const domain = new URL(page.url).hostname;
          if (domain === 'www.publico.pt') {
              pageComponent.classList.add('publico-domain');
          } else if (domain === 'expresso.pt') {
              pageComponent.classList.add('expresso-domain');
          }

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

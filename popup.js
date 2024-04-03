/******************************************************************************************************
 *
 *  Function to save the current page to the local storage(user), Arquivo.pt and external DB(Postgres).
 *
 * - 1. Get the current tab
 * - 2. Get the URL and title of the current tab
 * - 3. Open a new tab with the savepagenow URL (Arquivo.pt)
 * - 4. Make a POST request to save the article
 * - 5. Use chrome.storage.local to save data locally
 * - 6. Update the saved pages display
 *
 *****************************************************************************************************/
function savePage() {
  // 1 - Get the current tab
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    // 2 - Get the URL and title of the current tab
    const url = tabs[0].url;
    const title = tabs[0].title;

    //3 - Open a new tab with the savepagenow URL (Arquivo.pt)
    const savePageURL = `https://arquivo.pt/services/savepagenow?url=${encodeURIComponent(
      url
    )}`;
    chrome.tabs.create({ url: savePageURL });

    // 4 - Make a PUT request to increment the saved count on the article
    fetch(`http://localhost:8080/articles/${encodeURIComponent(
      url
    )}/increment`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      }
    })
      .then((response) => {
        if (response.ok) {
          console.log("Article saved count incremented!");
        } else {
          console.error("Failed to increment saved count:", response.statusText);
        }
      })
      .catch((error) => {
        console.error("Error incrementing saved count:", error);
      });

    // 5 - Use chrome.storage.local to save data locally
    chrome.storage.local.get("savedPagesMap", function (data) {
      const savedPagesMap = data.savedPagesMap || {};
      savedPagesMap[url] = { url: url, title: title };
      chrome.storage.local.set({ savedPagesMap: savedPagesMap }, function () {
        console.log("Page saved:", title);
        // 6 - Update the saved pages display
        displaySavedPages();
      });
    });
  });
}


/******************************************************************
*
*  Function to handle cleaning all saved data from local storage
*
* - 1. Ask for confirmation before clearing all saved data
* - 2. Clear all saved data from local storage
* - 3. Update the saved pages display
*
******************************************************************/
function clearSavedData() {
  // 1 - Ask for confirmation before clearing all saved data
  if (confirm("Are you sure you want to delete all saved news?")) {
    // 2 - Clear all saved data from local storage
    chrome.storage.local.remove("savedPagesMap", function () {
      console.log("All saved data cleared");
      // 3 - Update the saved pages display
      displaySavedPages();
    });
  }
}


/****************************************************************************
*
*  Function to display saved pages
*
*  - 1. Retrieve saved pages from local storage
*  - 2. Get the container to display saved pages
*  - 3. Check if there are no saved pages
*  - 4. Loop through the saved pages map and create a component for each one
*  - 5. Add click event listener to delete the saved page
*  - 6. Delete the saved page from the savedPagesMap
*  - 7. Update the saved pages
*  - 8. Append title span and delete button to the page component
*  - 9. Open the saved page in a new tab when clicked on the title
*  - 10. Determine the domain and assign a class based on it
*  - 11. Append the page component to the saved pages container
*
****************************************************************************/
function displaySavedPages() {
  // 1 - Retrieve saved pages from local storage
  chrome.storage.local.get("savedPagesMap", function (data) {
    const savedPagesMap = data.savedPagesMap || {};
    console.log("Saved Articles:", savedPagesMap);
    
    // 2 - Get the container to display saved pages
    const savedPagesContainer = document.getElementById("savedPages");
    savedPagesContainer.innerHTML = "";

    // 3 - Check if there are no saved pages
    if (Object.keys(savedPagesMap).length === 0) {
      savedPagesContainer.textContent = "Nothing to show yet. Save some news!";
      return;
    }

    // 4 - Loop through the saved pages map and create a component for each one
    Object.values(savedPagesMap).forEach(function (page) {

      const pageComponent = document.createElement("div");
      pageComponent.classList.add("saved-page");

     
      const titleSpan = document.createElement("span");
      titleSpan.textContent = page.title;

      const deleteButton = document.createElement("button");
      deleteButton.textContent = "Delete";
      deleteButton.classList.add("delete-button");

      // 5 - Add click event listener to delete the saved page
      deleteButton.addEventListener("click", function () {

        // 6 - Delete the saved page from the savedPagesMap
        delete savedPagesMap[page.url];
        
        // 7 - Update the saved pages
        chrome.storage.local.set({ savedPagesMap: savedPagesMap }, function () {
          displaySavedPages();
        });
      });

      // 8 - Append title span and delete button to the page component
      pageComponent.appendChild(titleSpan);
      pageComponent.appendChild(deleteButton);

      // 9 - Open the saved page in a new tab when clicked on the title
      titleSpan.addEventListener("click", function () {
        chrome.tabs.create({ url: page.url });
      });

      // 10 - Determine the domain and assign a class based on it (different styles for different domains)
      const domain = new URL(page.url).hostname;
      if (domain === "www.publico.pt") {
        pageComponent.classList.add("publico-domain");
      } else if (domain === "expresso.pt") {
        pageComponent.classList.add("expresso-domain");
      }

      // 11 - Append the page component to the saved pages container
      savedPagesContainer.appendChild(pageComponent);
    });
  });
}


/***************************************
*
*  Add event listeners to the buttons
*
***************************************/
document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("saveButton").addEventListener("click", savePage);
  document.getElementById("clearButton").addEventListener("click", clearSavedData);
  displaySavedPages();
});

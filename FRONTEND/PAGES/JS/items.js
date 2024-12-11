// Access token for API authentication
const accessToken = () => localStorage.getItem('accessToken');

// Get the necessary DOM elements
const itemListContainer = document.getElementById('item-list');
const nextButton = document.getElementById('next-button');
const backButton = document.getElementById('back-button');
const categoryDropdown = document.getElementById('category-dropdown');

// Variables to handle pagination and filtering
let currentPage = 1;
const itemsPerPage = 8;
let totalItems = 0;
let allItems = [];
let categories = [];

// Make API request function
async function makeApiRequest(url, method, data = null, accessToken = null) {
  const headers = {
    'Content-Type': 'application/json'
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const response = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : null
  });

  if (!response.ok) {
    throw new Error(`API request failed with status code ${response.status}`);
  }

  return await response.json();
}

// Fetch categories
// Fetch categories
async function fetchCategories() {
  try {
    const response = await fetch(`http://18.117.164.164:4001/api/v1/item_categories/get_items?page_size=30`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${accessToken()}`, // Using token for authentication
      }
    });
    if (!response.ok) {
      throw new Error("Failed to fetch categories");
    }
    const { data } = await response.json();
    populateCategoryDropdown(data.data);
  } catch (error) {
    console.error("Error fetching categories:", error.message);
  }
}

// Populate category dropdown
function populateCategoryDropdown(categories) {
  const categoryDropdown = document.getElementById('category-dropdown');

  // Add "All" option
  const allOption = document.createElement('option');
  allOption.value = 'ALL';
  allOption.textContent = 'All Categories';
  categoryDropdown.appendChild(allOption);

  // Add category options
  categories.forEach(category => {
    const option = document.createElement('option');
    option.value = category._id; // Use the category ID as the value
    option.textContent = category.item_name; // Display name of the category
    categoryDropdown.appendChild(option);
  });

  // Add event listener for category selection
  categoryDropdown.addEventListener('change', filterItemsByCategory);
}

// Filter items by category
// function filterItemsByCategory() {
//   const selectedCategory = categoryDropdown.value;
//   console.log(selectedCategory);
//   console.log(allItems.slice(0, 3));

//   // Filter items based on selected category
//   let filteredItems = selectedCategory === 'ALL'
//     ? allItems
//     : allItems.filter(item => item.item_id === selectedCategory);
  
//   console.log(filteredItems);
//   // Reset to first page after filtering
//   currentPage = 1;

//   // Display filtered items
//   displayItemsForCurrentPage(filteredItems);
//   updatePaginationButtons(filteredItems);
// }
async function filterItemsByCategory() {
  const selectedCategory = categoryDropdown.value;
  console.log(selectedCategory);
  console.log(allItems.slice(0, 3));
  try {
    // If "All Categories" is selected, reset to all items
    if (selectedCategory === 'ALL') {
      displayItemsForCurrentPage(allItems);
      updatePaginationButtons(allItems);
      return;
    }

    // Fetch filtered items for the selected category
    const apiUrl = `http://18.117.164.164:4001/api/v1/listing/get_listings?item_id=${selectedCategory}`;
    const response = await makeApiRequest(apiUrl, 'GET', null, accessToken());

    if (response && response.status === 'SUCCESS' && response.data) {
      // Update UI with filtered items
      const filteredItems = response.data.filter(item => !item.is_deleted); // Exclude deleted items
      displayItemsForCurrentPage(filteredItems);
      updatePaginationButtons(filteredItems);
    } else {
      console.error('No items found for the selected category.');
      itemListContainer.innerHTML = '<p>No items found in this category.</p>';
    }
  } catch (error) {
    console.error('Error fetching items for category:', error.message);
    itemListContainer.innerHTML = '<p>Failed to load items. Please try again later.</p>';
  }
}

// Fetch all non-deleted items across all pages
async function fetchAllItems() {
  try {
    let page = 1;
    let fetchedItems = [];
    let hasMoreItems = true;

    while (hasMoreItems) {
      const apiUrl = `http://18.117.164.164:4001/api/v1/listing/get_listings?page=${page}&page_size=${itemsPerPage}`;
      const response = await makeApiRequest(apiUrl, 'GET', null, accessToken());

      if (response && response.status === 'SUCCESS' && response.data) {
        // Filter out deleted items
        const nonDeletedItems = response.data.filter(item => !item.is_deleted);
        
        // Add non-deleted items to the collection
        fetchedItems.push(...nonDeletedItems);

        // Check if we've fetched all items
        if (nonDeletedItems.length < itemsPerPage) {
          hasMoreItems = false;
        }

        page++;
      } else {
        // No more items or error occurred
        hasMoreItems = false;
      }
    }

    return fetchedItems;
  } catch (error) {
    console.error('Error fetching all items:', error);
    return [];
  }
}

// Display items for the current page
function displayItemsForCurrentPage(items) {
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const pageItems = items.slice(startIndex, endIndex);

  itemListContainer.innerHTML = '';

  if (pageItems.length === 0) {
    itemListContainer.innerHTML = '<p>No items found in this category.</p>';
    return;
  }

  pageItems.forEach(item => {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'item';
    itemDiv.innerHTML = `
      <div class="item-title">${item.title}</div>
      <div class="item-status">Status: ${item.status}</div>
      <div class="item-price">Price: $${item.price}</div>
    `;

    itemDiv.addEventListener('click', () => {
      window.location.href = `../HTML/available_listings.html?itemId=${item._id}`;
    });
    renderItemActions(item, itemDiv);
    itemListContainer.appendChild(itemDiv);
  });
}

// Update pagination buttons
function updatePaginationButtons(items) {
  totalItems = items.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Show/hide buttons based on current page
  backButton.style.display = currentPage > 1 ? 'block' : 'none';
  nextButton.style.display = currentPage < totalPages ? 'block' : 'none';

  // Disable buttons if needed
  backButton.disabled = currentPage <= 1;
  nextButton.disabled = currentPage >= totalPages;
}

// Main rendering function
async function renderItems() {
  try {
    // Fetch all non-deleted items
    allItems = await fetchAllItems();

    // Fetch categories
    await fetchCategories();

    if (allItems.length > 0) {
      // Display items for current page
      displayItemsForCurrentPage(allItems);

      // Update pagination buttons
      updatePaginationButtons(allItems);
    } else {
      itemListContainer.innerHTML = '<p>No items available.</p>';
      hideAllButtons();
    }
  } catch (error) {
    console.error('Error rendering items:', error);
    itemListContainer.innerHTML = '<p>Failed to load items. Please try again later.</p>';
    hideAllButtons();
  }
}

function logout() {
  // Clear all items from local storage
  localStorage.clear();

  // Redirect to index.html
  window.location.href = '../HTML/index.html';
}

// Event listener for the logout link
document.getElementById('logout-link').addEventListener('click', (event) => {
  event.preventDefault(); // Prevent the default link behavior
  logout(); // Call the logout function
});

// Hide all pagination buttons
function hideAllButtons() {
  nextButton.style.display = 'none';
  backButton.style.display = 'none';
}

// Save the current page to localStorage
function saveCurrentPageToLocalStorage() {
  localStorage.setItem('currentPage', currentPage);
}

// Load the current page from localStorage
function loadCurrentPageFromLocalStorage() {
  const page = parseInt(localStorage.getItem('currentPage'), 10);
  return page > 0 ? page : 1; // Default to page 1 if not found or invalid
}

// Update the event listeners to save the page to localStorage
// Event listener for the "Next" button
nextButton.addEventListener('click', () => {
  const selectedCategory = categoryDropdown.value;
  const filteredItems = selectedCategory === 'ALL' 
    ? allItems 
    : allItems.filter(item => item.item_name === selectedCategory);

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  if (currentPage < totalPages) {
    currentPage++;
    saveCurrentPageToLocalStorage();
    displayItemsForCurrentPage(filteredItems);
    updatePaginationButtons(filteredItems);
  }
});

// Event listener for the "Back" button
backButton.addEventListener('click', () => {
  const selectedCategory = categoryDropdown.value;
  const filteredItems = selectedCategory === 'ALL' 
    ? allItems 
    : allItems.filter(item => item.item_name === selectedCategory);

  if (currentPage > 1) {
    currentPage--;
    saveCurrentPageToLocalStorage();
    displayItemsForCurrentPage(filteredItems);
    updatePaginationButtons(filteredItems);
  }
});

document.getElementById('profileid').addEventListener('click', () => {
  const dropdown = document.querySelector('.dropdown');
  dropdown.classList.toggle('show'); // Toggle the dropdown visibility
});

// On initial load
currentPage = loadCurrentPageFromLocalStorage();
// Initial page load
renderItems();
// Get the necessary DOM elements
const itemListContainer = document.getElementById('item-list');
const nextButton = document.getElementById('next-button');
const backButton = document.getElementById('back-button');

// Variables to handle pagination
let currentPage = 1;
const itemsPerPage = 6;
let totalItems = 0;

// Access token for API authentication
const accessToken = () => "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNjc0MGMxZTRlZDYyNmYxMTM3MjhmYjNmIiwidXNlcl90eXBlIjoiU1RVREVOVCIsInRva2VuX3R5cGUiOiJiZWFyZXIiLCJpYXQiOjE3MzI4Mzc4NTQsImV4cCI6MTczMjkyNDI1NH0.hG0bEzD5K4eJU4wi35ckWA13rpCf_3S_3xAAmWcc6uA";
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

// Fetch all non-deleted items across all pages
async function fetchAllItems() {
  try {
    let page = 1;
    let allItems = [];
    let hasMoreItems = true;

    while (hasMoreItems) {
      const apiUrl = `http://18.117.164.164:4001/api/v1/listing/get_listings?page=${page}&page_size=${itemsPerPage}`;
      const response = await makeApiRequest(apiUrl, 'GET', null, accessToken());

      if (response && response.status === 'SUCCESS' && response.data) {
        // Filter out deleted items
        const nonDeletedItems = response.data.filter(item => !item.is_deleted);
        
        // Add non-deleted items to the collection
        allItems.push(...nonDeletedItems);

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

    return allItems;
  } catch (error) {
    console.error('Error fetching all items:', error);
    return [];
  }
}

// Display items for the current page
function displayItemsForCurrentPage(allItems) {
  // Calculate start and end indices for the current page
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const pageItems = allItems.slice(startIndex, endIndex);

  // Clear current items
  itemListContainer.innerHTML = '';

  // Display items for current page
  pageItems.forEach(item => {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'item';
    itemDiv.innerHTML = `
      <h2>${item.title}</h2>
      <p><strong>Price:</strong> $${item.price}</p>
      <p><strong>Status:</strong> ${item.status}</p>
    `;

    // Make each item clickable and redirect to the details page
    itemDiv.addEventListener('click', () => {
      window.location.href = `../HTML/item_details.html?itemId=${item._id}`;
    });

    renderItemActions(item, itemDiv); // Add update/delete buttons if applicable
    itemListContainer.appendChild(itemDiv);
  });
}

// Update pagination buttons
function updatePaginationButtons(allItems) {
  totalItems = allItems.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Show/hide buttons based on current page
  backButton.style.display = currentPage > 1 ? 'block' : 'none';
  nextButton.style.display = currentPage < totalPages ? 'block' : 'none';
}

// Main rendering function
async function renderItems() {
  try {
    // Fetch all non-deleted items
    const allItems = await fetchAllItems();

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

// Hide all pagination buttons
function hideAllButtons() {
  nextButton.style.display = 'none';
  backButton.style.display = 'none';
}

// Event listener for the "Next" button
nextButton.addEventListener('click', () => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  if (currentPage < totalPages) {
    currentPage++;
    renderItems();
  }
});

// Event listener for the "Back" button
backButton.addEventListener('click', () => {
  if (currentPage > 1) {
    currentPage--;
    renderItems();
  }
});

// Initial page load
renderItems();
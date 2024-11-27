// Get the necessary DOM elements
const itemListContainer = document.getElementById('item-list');
const nextButton = document.getElementById('next-button');
const backButton = document.getElementById('back-button');

// Variables to handle pagination
let currentPage = 1; // Start from the first page
const itemsPerPage = 6; // Adjust based on API response

// Access token for API authentication
const accessToken = () => "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNjc0MGMxZTRlZDYyNmYxMTM3MjhmYjNmIiwidXNlcl90eXBlIjoiU1RVREVOVCIsInRva2VuX3R5cGUiOiJiZWFyZXIiLCJpYXQiOjE3MzI2NDYzNDksImV4cCI6MTczMjczMjc0OX0.JIbl6hCJWj3W-zz323ei8aSZGyZHzcK7eam5o65mAgs";

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

// Fetch items with pagination after filtering out deleted items
async function fetchItems(page = 1) {
  try {
    const apiUrl = `http://18.117.164.164:4001/api/v1/listing/get_listings?page=${page}&page_size=${itemsPerPage}`;
    const response = await makeApiRequest(apiUrl, 'GET', null, accessToken());

    if (response && response.status === 'SUCCESS' && response.data) {
      // Filter out deleted items
      const filteredItems = response.data.filter(item => !item.is_deleted);

      // Ensure we display exactly itemsPerPage items after filtering
      const availableItems = [];
      let nextPage = page;

      while (availableItems.length < itemsPerPage && response.data.length > 0) {
        // Add valid items to the availableItems array
        availableItems.push(...filteredItems.slice(0, itemsPerPage - availableItems.length));

        // If we still need more items, fetch the next page
        if (availableItems.length < itemsPerPage) {
          nextPage++;
          const nextResponse = await makeApiRequest(
            `http://18.117.164.164:4001/api/v1/listing/get_listings?page=${nextPage}&page_size=${itemsPerPage}`,
            'GET',
            null,
            accessToken()
          );

          if (nextResponse && nextResponse.status === 'SUCCESS' && nextResponse.data) {
            response.data = nextResponse.data;
            filteredItems.push(...response.data.filter(item => !item.is_deleted));
          } else {
            break; // Stop if no more data is returned
          }
        }
      }

      if (availableItems.length > 0) {
        displayItems(availableItems);
        updatePaginationButtons(filteredItems.length + availableItems.length);
      } else {
        itemListContainer.innerHTML = '<p>No items available.</p>';
        hideAllButtons();
      }
    } else {
      console.error('Unexpected API response:', response);
      itemListContainer.innerHTML = '<p>Failed to load items. Please try again later.</p>';
      hideAllButtons();
    }
  } catch (error) {
    console.error('Error fetching items:', error);
    itemListContainer.innerHTML = '<p>Failed to load items. Please try again later.</p>';
    hideAllButtons();
  }
}

// Display items on the page
function displayItems(items) {
  itemListContainer.innerHTML = ''; // Clear current items

  items.forEach(item => {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'item';
    itemDiv.innerHTML = `
      <h2>${item.description}</h2>
      <p><strong>Price:</strong> $${item.price}</p>
      <p><strong>Status:</strong> ${item.status}</p>
    `;

    // Make each item clickable and redirect to the details page
    itemDiv.addEventListener('click', () => {
      window.location.href = `item_details.html?itemId=${item._id}`;
    });
    renderItemActions(item, itemDiv); // Add update/delete buttons if applicable
    itemListContainer.appendChild(itemDiv);
  });
}

// Update pagination buttons based on the current page
function updatePaginationButtons(totalAvailableItems) {
  nextButton.style.display = 'block';
  backButton.style.display = 'block';

  if (currentPage === 1) {
    backButton.style.display = 'none'; // Hide Back button on the first page
  }

  if (totalAvailableItems < itemsPerPage) {
    nextButton.style.display = 'none'; // Hide Next button if no more items are available
  } else {
    nextButton.style.display = 'block'; // Show Next button if there are more items
  }
}

// Hide all pagination buttons
function hideAllButtons() {
  nextButton.style.display = 'none';
  backButton.style.display = 'none';
}

// Event listener for the "Next" button (pagination)
nextButton.addEventListener('click', () => {
  currentPage++;
  fetchItems(currentPage);
});

// Event listener for the "Back" button (pagination)
backButton.addEventListener('click', () => {
  if (currentPage > 1) {
    currentPage--;
    fetchItems(currentPage);
  }
});

// Fetch the first page of items on page load
fetchItems(currentPage);
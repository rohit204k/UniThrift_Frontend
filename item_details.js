// Access token for API authentication
// Access token for API authentication
const accessToken = () => "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNjc0MGMxZTRlZDYyNmYxMTM3MjhmYjNmIiwidXNlcl90eXBlIjoiU1RVREVOVCIsInRva2VuX3R5cGUiOiJiZWFyZXIiLCJpYXQiOjE3MzI2NDYzNDksImV4cCI6MTczMjczMjc0OX0.JIbl6hCJWj3W-zz323ei8aSZGyZHzcK7eam5o65mAgs";

// Get the necessary DOM elements
const itemDetailsContainer = document.getElementById('item-details');
const backButton = document.getElementById('back-button');

// Function to fetch item details based on the item ID
async function fetchItemDetails(itemId) {
  try {
    const apiUrl = `http://18.117.164.164:4001/api/v1/listing/get_listing/${itemId}`;
    console.log('Fetching details for itemId:', itemId);
    console.log('API URL:', apiUrl);

    const response = await makeApiRequest(apiUrl, 'GET', null, accessToken());

    console.log('API Response:', response);

    if (response && response.status === 'SUCCESS' && response.data) {
      displayItemDetails(response.data);
    } else if (response && response.status === 'FAIL' && response.errorData.errorCode === 404) {
      console.warn('Item not found:', response.errorData.message);
      itemDetailsContainer.innerHTML = '<p>Item not found. Please check the item ID and try again.</p>';
    } else {
      console.error('Unexpected response:', response);
      itemDetailsContainer.innerHTML = '<p>An unexpected error occurred. Please try again later.</p>';
    }
  } catch (error) {
    console.error('Error fetching item details:', error);
    itemDetailsContainer.innerHTML = '<p>Failed to load item details. Please try again later.</p>';
  }
}


// Function to display item details on the page
function displayItemDetails(item) {
  console.log('Displaying item details:', item);
  itemDetailsContainer.innerHTML = `
    <h2>${item.item_name}</h2>
    <p><strong>Description:</strong> ${item.description}</p>
    <p><strong>Price:</strong> $${item.price}</p>
    <p><strong>Status:</strong> ${item.status}</p>
    <p><strong>Seller ID:</strong> ${item.seller_id}</p>
  `;
}

// Function to make API requests
async function makeApiRequest(url, method, data = null, accessToken = null) {
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${accessToken}`
  };

  const response = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : null
  });

  if (!response.ok) {
    console.error('API request failed with status code:', response.status);
    throw new Error(`API request failed with status code ${response.status}`);
  }

  return await response.json();
}

// Function to handle back button action
if (backButton) {
  backButton.addEventListener('click', () => {
    window.history.back(); // Go back to the previous page
  });
} else {
  console.warn('Back button element not found.');
}

// Extract item ID from URL query parameter
const urlParams = new URLSearchParams(window.location.search);
const itemId = urlParams.get('itemId');

if (itemId) {
  fetchItemDetails(itemId); // Fetch the item details if itemId is available
} else {
  console.warn('No itemId found in URL query parameters.');
  itemDetailsContainer.innerHTML = '<p>Item not found.</p>';
}

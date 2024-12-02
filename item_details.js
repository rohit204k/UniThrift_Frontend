// Access token for API authentication
// const accessToken = () => "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNjc0MGMxZTRlZDYyNmYxMTM3MjhmYjNmIiwidXNlcl90eXBlIjoiU1RVREVOVCIsInRva2VuX3R5cGUiOiJiZWFyZXIiLCJpYXQiOjE3MzI4Mzc4NTQsImV4cCI6MTczMjkyNDI1NH0.hG0bEzD5K4eJU4wi35ckWA13rpCf_3S_3xAAmWcc6uA";
// const accessToken = () => localStorage.getItem('accessToken');
// Get the necessary DOM elements
const itemDetailsContainer = document.getElementById('item-details');
const backButton = document.getElementById('back-button');

async function fetchItemDetails(itemId) {
  try {
    const apiUrl = `http://18.117.164.164:4001/api/v1/listing/get_listing/${itemId}`;
    console.log('Fetching details for itemId:', itemId);
    console.log('API URL:', apiUrl);

    const response = await makeApiRequest(apiUrl, 'GET', null, accessToken());
    console.log('API Response:', response);

    if (response && response.status === 'SUCCESS' && response.data) {
      const imageUrls = await Promise.all(response.data.images.map(async (imageId) => {
        const imageApiUrl = `http://18.117.164.164:4001/api/v1/listing/image/generate_get_url?key=${imageId}`;
        const imageResponse = await makeApiRequest(imageApiUrl, 'GET', null, accessToken());
        return imageResponse.data.url;
      }));

      const itemData = { ...response.data, images: imageUrls };
      displayItemDetails(itemData);
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


function displayItemDetails(item) {
  console.log('Displaying item details:', item);

  let imageHtml = '';
  for (let i = 0; i < item.images.length; i++) {
    imageHtml += `<img src="${item.images[i]}" alt="Product Image ${i + 1}" class="product-image">`;
  }

  itemDetailsContainer.innerHTML = `
    <h2>${item.title}</h2>
    <p><strong>Category:</strong> ${item.item_name}</p>
    <p><strong>Description:</strong> ${item.description}</p>
    <p><strong>Price:</strong> $${item.price}</p>
    <p><strong>Status:</strong> ${item.status}</p>
    <div class="product-images">${imageHtml}</div>
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

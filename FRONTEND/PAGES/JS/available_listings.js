// Access token for API authentication

// Get the necessary DOM elements
const itemDetailsContainer = document.getElementById('item-details');
const backButton = document.getElementById('back-button');
const markInterestedButton = document.getElementById('mark-interested-button');
const interestedBuyersList = document.getElementById('interested-buyers-list');
const userId = localStorage.getItem('userId'); // Retrieve userId from local storage

async function fetchItemDetails(itemId) {
  try {
    const apiUrl = `http://18.117.164.164:4001/api/v1/listing/get_listing/${itemId}`;
    console.log('Fetching details for itemId:', itemId);
    console.log('API URL:', apiUrl);

    const response = await makeApiRequest(apiUrl, 'GET', null, accessToken());
    console.log('API Response:', response);

    if (response && response.status === 'SUCCESS' && response.data) {
      localStorage.setItem('currentItemId', itemId);
      localStorage.setItem('sellerId', response.data.seller_id);

      const imageUrls = await Promise.all(response.data.images.map(async (imageId) => {
        const imageApiUrl = `http://18.117.164.164:4001/api/v1/listing/image/generate_get_url?key=${imageId}`;
        const imageResponse = await makeApiRequest(imageApiUrl, 'GET', null, accessToken());
        return imageResponse.data.url;
      }));

      const itemData = { ...response.data, images: imageUrls };
      displayItemDetails(itemData);
      await fetchListingInteractions(itemId); // Fetch interactions after displaying item details

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

async function fetchListingInteractions(itemId) {
  try {
    const apiUrl = `http://18.117.164.164:4001/api/v1/queueing/get_listing_interactions/${itemId}`;
    const response = await makeApiRequest(apiUrl, 'GET', null, accessToken());
    
    if (response && response.status === 'SUCCESS') {
      displayInteractions(response.data);
    } else {
      console.error('Failed to fetch interactions:', response);
      itemDetailsContainer.innerHTML += '<p>Failed to load interactions. Please try again later.</p>';
    }
  } catch (error) {
    console.error('Error fetching listing interactions:', error);
    itemDetailsContainer.innerHTML += '<p>Failed to load interactions. Please try again later.</p>';
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

  const sellerId = localStorage.getItem('sellerId');
  console.log('User ID:', userId);
  console.log('Seller ID:', sellerId);
  
  // Show/hide mark interested button
  if (sellerId === userId) {
    markInterestedButton.style.display = 'none'; // Hide button if they are equal
  } else {
    markInterestedButton.style.display = 'inline-block'; // Show button if they are not equal
  }
}

function displayInteractions(data) {
  interestedBuyersList.innerHTML = ''; // Clear previous entries

  // Check if data is empty
  if (Array.isArray(data) && data.length === 0) {
    // No interested buyers, so simply return
    return; 
  } else if (Object.keys(data).length === 0) {
    // If data is an empty object, also return
    return; 
  }

  // Determine section title
  const sectionTitle = document.createElement('h3');

  // Check if the user is an interested buyer
  const isBuyer = Array.isArray(data) && data.some(interaction => interaction.buyer_id === userId);
  
  // Set the title based on user status
  sectionTitle.textContent = isBuyer ? 'Interested Buyers' : 'Interest Expressed';
  interestedBuyersList.parentElement.insertBefore(sectionTitle, interestedBuyersList);

  if (Array.isArray(data)) {
    // Display all interested buyers
    data.forEach(interaction => {
      const { buyer_id, buyer_name, comments, status } = interaction;

      const buyerDiv = document.createElement('div');
      buyerDiv.innerHTML = `
        <p><strong>Buyer Name:</strong> ${buyer_name}</p>
        <p><strong>Comments:</strong> ${comments}</p>
        <p><strong>Status:</strong> ${status}</p>
      `;
      interestedBuyersList.appendChild(buyerDiv);
    });
  } else {
    // Handle single entry for the current user
    const { comments, status, seller_name, seller_email, seller_phone } = data;

    const singleUserDiv = document.createElement('div');
    singleUserDiv.innerHTML = `
      <p><strong>Your Comments:</strong> ${comments}</p>
      <p><strong>Status:</strong> ${status}</p>
    `;

    // Check if the current user's status is SHARE_DETAILS
    if (status === "SHARE_DETAILS") {
      singleUserDiv.innerHTML += `
        <h4>Seller Information</h4>
        <p><strong>Name:</strong> ${seller_name || 'N/A'}</p>
        <p><strong>Email:</strong> ${seller_email || 'N/A'}</p>
        <p><strong>Phone:</strong> ${seller_phone || 'N/A'}</p>
      `;
    }

    interestedBuyersList.appendChild(singleUserDiv);
  }

  // Change the mark interested button text and disable it if the user is marked as interested or is the seller
  if (isBuyer) {
    markInterestedButton.textContent = 'Marked as Interested';
    markInterestedButton.disabled = true; // Disable the button
  } else if (localStorage.getItem('sellerId') === userId) {
    markInterestedButton.textContent = 'Marked as Interested';
    markInterestedButton.disabled = true; // Disable the button for sellers
  } else {
    markInterestedButton.textContent = 'Mark as Interested'; // Reset button text if conditions not met
    markInterestedButton.disabled = false; // Enable button if user is not interested and not the seller
  }
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
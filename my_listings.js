
// Function to fetch the access token (replace with dynamic token retrieval if necessary)
// const accessToken = () => "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNjc0MGMxZTRlZDYyNmYxMTM3MjhmYjNmIiwidXNlcl90eXBlIjoiU1RVREVOVCIsInRva2VuX3R5cGUiOiJiZWFyZXIiLCJpYXQiOjE3MzI4Mzc4NTQsImV4cCI6MTczMjkyNDI1NH0.hG0bEzD5K4eJU4wi35ckWA13rpCf_3S_3xAAmWcc6uA";
const accessToken = () => localStorage.getItem('accessToken');
// Get the necessary DOM elements
const myListingsContainer = document.getElementById('my-listings-container');

// Utility function to parse JWT and extract user information
function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    console.error('Error parsing JWT:', e);
    return null;
  }
}

// Make API request function
async function makeApiRequest(url, method, data = null, token = null) {
  try {
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };

    const response = await fetch(url, {
      method,
      headers,
      body: data ? JSON.stringify(data) : null
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('API Error:', error);
      throw new Error(`API request failed with status code ${response.status}: ${error.message}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Network or API Error:', error);
    throw error;
  }
}

// Fetch the user's own listings
async function fetchUserListings() {
  try {
    const apiUrl = `http://18.117.164.164:4001/api/v1/listing/get_user_listings`;
    const token = accessToken(); // Get the token

    if (!token) {
      throw new Error('Access token is missing or invalid.');
    }

    const response = await makeApiRequest(apiUrl, 'GET', null, token);

    if (response && response.status === 'SUCCESS' && response.data) {
      // Filter out deleted items
      const userListings = response.data.filter(item => !item.is_deleted);
      displayUserListings(userListings);
    } else {
      myListingsContainer.innerHTML = '<p>Failed to fetch your listings. Please try again later.</p>';
    }
  } catch (error) {
    console.error('Error fetching user listings:', error);
    myListingsContainer.innerHTML = '<p>Failed to fetch your listings. Please try again later.</p>';
  }
}

// Display the user's own listings
function displayUserListings(listings) {
  myListingsContainer.innerHTML = '';

  if (listings.length > 0) {
    listings.forEach(item => {
      const itemDiv = document.createElement('div');
      itemDiv.className = 'item';
      itemDiv.innerHTML = `
          <div class="item-title">${item.title}</div>
          <div class="item-status">Status: ${item.status}</div>
          <div class="item-price">Price: $${item.price}</div>
      `;

      // Make each item clickable and redirect to the details page
      itemDiv.addEventListener('click', () => {
        window.location.href = `get_interested_listings_seller.html?listingID=${item._id}`;
      });

      renderItemActions(item, itemDiv); // Add update/delete buttons if applicable
      myListingsContainer.appendChild(itemDiv);
    });
  } else {
    myListingsContainer.innerHTML = '<p>You have no listings to display.</p>';
  }
}

// Render update and delete buttons for the user’s listings
function renderItemActions(item, itemDiv) {
  // Extract user ID from the access token
  const userId = parseJwt(accessToken())?.user_id;

  // Check if the user is the owner of the item
  if (item.user_id === userId) {
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'actions';

    // Add update button
    const updateButton = document.createElement('button');
    updateButton.textContent = 'Update';
    updateButton.className = 'update-button';
    updateButton.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent item click event
      window.location.href = `update_listing.html?itemId=${item._id}`;
    });
    actionsDiv.appendChild(updateButton);

    // Add delete button
    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.className = 'delete-button';
    deleteButton.addEventListener('click', async (e) => {
      e.stopPropagation(); // Prevent item click event
      if (confirm('Are you sure you want to delete this listing?')) {
        try {
          const token = accessToken();
          await makeApiRequest(`http://18.117.164.164:4001/api/v1/listing/delete/${item._id}`, 'DELETE', null, token);
          // Refresh the listings after successful deletion
          fetchUserListings();
        } catch (error) {
          console.error('Error deleting item:', error);
          alert('Failed to delete the item. Please try again later.');
        }
      }
    });
    actionsDiv.appendChild(deleteButton);

    itemDiv.appendChild(actionsDiv);
  }
}

// Initial page load
fetchUserListings();

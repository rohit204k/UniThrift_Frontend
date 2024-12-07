// Get the container for displaying interested items
const interestedItemsContainer = document.getElementById('interested-items-container');

// Access token function
const accessToken = () => {
  const token = localStorage.getItem('accessToken');
  console.log("Access Token:", token); // Debug: Log the access token
  return token;
};

// Function to fetch the interested listings from the API
async function fetchInterestedListings(page = 1, pageSize = 10) {
  const apiUrl = `http://18.117.164.164:4001/api/v1/queueing/get_interested_listings?page=${page}&page_size=${pageSize}`;
  console.log("API URL:", apiUrl); // Debug: Log the API URL

  try {
    // Fetch data with access token authentication
    const response = await makeApiRequest(apiUrl, 'GET', null, accessToken());
    console.log("API Response:", response); // Debug: Log the API response

    if (response && response.status === 'SUCCESS' && response.data.length > 0) {
      displayInterestedListings(response.data);
    } else if (response && response.status === 'SUCCESS' && response.data.length === 0) {
      interestedItemsContainer.innerHTML = '<p>No interested items found.</p>';
    } else {
      console.error('Failed to fetch interested listings:', response);
      interestedItemsContainer.innerHTML = '<p>An error occurred while fetching interested items.</p>';
    }
  } catch (error) {
    console.error('Error fetching interested listings:', error);
    interestedItemsContainer.innerHTML = '<p>Failed to load interested items. Please try again later.</p>';
  }
}

// Function to make API requests
async function makeApiRequest(url, method, data = null, token = null) {
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
  console.log("Request Headers:", headers); // Debug: Log request headers

  const response = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : null,
  });

  if (!response.ok) {
    console.error('API request failed with status:', response.status);
    throw new Error(`API request failed with status ${response.status}`);
  }

  return await response.json();
}

// Function to display interested listings in the DOM
function displayInterestedListings(items) {
    interestedItemsContainer.innerHTML = items
      .map(
        (item) => `
        <div class="interested-item-container">
          <h2> ${item.title || 'N/A'}</h2>
          <p><strong>Comment:</strong> ${item.comments || 'No comments available.'}</p>
          <p><strong>Status:</strong> ${item.status || 'Unknown'}</p>
          <div class="interested-item-actions">
            <button class="view-button" onclick="viewDetails('${item.listing_id}')">View Details</button>
          </div>
        </div>
      `
      )
      .join('');
    console.log("Listings displayed successfully!"); // Debug: Confirm items displayed
  }
function viewDetails(listingId) {
// Redirect to the new page, passing the listing ID as a query parameter
window.location.href = `get_interested_listings.html?listing_id=${listingId}`;
}

function logout() {
  // Clear all items from local storage
  localStorage.clear();

  // Redirect to index.html
  window.location.href = 'index.html';
}

// Event listener for the logout link
document.getElementById('logout-link').addEventListener('click', (event) => {
  event.preventDefault(); // Prevent the default link behavior
  logout(); // Call the logout function
});

// Call the API to fetch interested listings
fetchInterestedListings();
/* <p><strong>Created At:</strong> ${new Date(item.created_at).toLocaleString()}</p>
<p><strong>Updated At:</strong> ${new Date(item.updated_at).toLocaleString()}</p>
<hr></hr> */
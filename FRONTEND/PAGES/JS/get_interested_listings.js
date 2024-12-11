const interestedListingsContainer = document.getElementById('interested-listings');
const accessToken = () => localStorage.getItem('accessToken');

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

async function fetchInterestedListings(listingId) {
  try {
    const apiUrl = `http://18.117.164.164:4001/api/v1/queueing/get_listing_interactions/${listingId}`;
    console.log('Fetching interested listings for listingId:', listingId);
    console.log('API URL:', apiUrl);

    const response = await makeApiRequest(apiUrl, 'GET', null, accessToken());
    console.log('API Response:', response);

    if (response && response.status === 'SUCCESS' && response.data) {
    //   // Fetch item details if needed
    //   await fetchItemDetails(response.data.listing_id);
      displayInterestedListings(response.data);
      // Call fetchItemDetails directly with the listing ID
      fetchItemDetails(response.data.listing_id); // Ensure fetchItemDetails is defined in item_details.js
    } else {
      console.error('Unexpected response:', response);
      interestedListingsContainer.innerHTML = '<p>An unexpected error occurred. Please try again later.</p>';
    }
  } catch (error) {
    console.error('Error fetching interested listings:', error);
    interestedListingsContainer.innerHTML = '<p>Failed to load interested listings. Please try again later.</p>';
  }
}

function displayInterestedListings(data) {
  console.log('Displaying interested listings:', data);
  
  interestedListingsContainer.innerHTML = `
    <h2>Interested Listing Details</h2>
    <p><strong>Comments:</strong> ${data.comments || 'No comments available.'}</p>
    <p><strong>Status:</strong> ${data.status || 'Unknown'}</p>
    
  `;
  if (data.status === "SHARE_DETAILS") {
    interestedListingsContainer.innerHTML += `
        <h3>Seller Information</h3>
        <p><strong>Name:</strong> ${data.seller_name || 'N/A'}</p>
        <p><strong>Email:</strong> ${data.seller_email || 'N/A'}</p>
        <p><strong>Phone:</strong> ${data.seller_phone || 'N/A'}</p>
    `;
}
}

// Extract listing ID from URL query parameter
const urlParam = new URLSearchParams(window.location.search);
const listingId = urlParam.get('listing_id');
console.log(listingId);

if (listingId) {
  fetchInterestedListings(listingId); // Fetch interested listings if listingId is available
} else {
  console.warn('No listing_id found in URL query parameters.');
  interestedListingsContainer.innerHTML = '<p>No interested listings found.</p>';
}



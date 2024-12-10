const interestedListingsContainer = document.getElementById('interested-listings');
const accessToken = () => localStorage.getItem('accessToken');

// Function to fetch interested listings based on the listing ID
async function fetchInterestedListings(listingId) {
  try {
    const apiUrl = `http://18.117.164.164:4001/api/v1/queueing/get_listing_interactions/${listingId}`;
    const response = await makeApiRequest(apiUrl, 'GET', null, accessToken());

    if (response && response.status === 'SUCCESS' && response.data) {
      displayInterestedListings(response.data);
      console.log(response.data)
      // Call fetchItemDetails directly with the listing ID
      console.log("listing id", listingId)
      fetchItemDetails(listingId); // Ensure fetchItemDetails is defined in item_details.js

    } else {
      interestedListingsContainer.innerHTML = '<p>No interested buyers found.</p>';
    }
  } catch (error) {
    console.error('Error fetching interested listings:', error);
    interestedListingsContainer.innerHTML = '<p>Failed to load interested listings. Please try again later.</p>';
  }
}

// Function to display the interested listings
function displayInterestedListings(listings) {
  interestedListingsContainer.innerHTML = ''; // Clear previous content

  listings.forEach(listing => {
    const listingDiv = document.createElement('div');
    listingDiv.className = 'listing';

    listingDiv.innerHTML = `
      <p><strong>Buyer Name:</strong> ${listing.buyer_name}</p>
      <p><strong>Status:</strong> ${listing.status}</p>
      <p><strong>Comments:</strong> ${listing.comments}</p>
      <div class="button-container">
        <button onclick="shareContact('${listing.buyer_id}')">SHARE CONTACT</button>
        <button onclick="rejectInterest('${listing.buyer_id}')">REJECT INTEREST</button>
        <button onclick="saleComplete('${listing.buyer_id}')">SALE COMPLETE</button>
      </div>
    `;

    interestedListingsContainer.appendChild(listingDiv);
  });
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

// Extract listingID from URL query parameter
const urlParam = new URLSearchParams(window.location.search);
const listingID = urlParam.get('listingID');

if (listingID) {
  fetchInterestedListings(listingID); // Fetch interested listings for the item
} else {
  console.warn('No listingID found in URL query parameters.');
  interestedListingsContainer.innerHTML = '<p>Listing not found.</p>';
}

// Placeholder functions for button actions
async function shareContact(buyerId) {
  console.log(`Sharing contact for buyer ID: ${buyerId}`);
  const apiUrl = 'http://18.117.164.164:4001/api/v1/queueing/share_contact';
  
  // Use the existing listingID from the global scope
  const requestBody = {
    listing_id: listingID,  // Using the listingID already defined
    buyer_id: buyerId
  };

  try {
    const response = await makeApiRequest(apiUrl, 'POST', requestBody, accessToken());

    if (response && response.status === 'SUCCESS') {
      console.log(response.data.message);
      alert(response.data.message); // Show success message
    } else {
      console.error('Failed to share contact:', response);
      alert('Failed to share contact. Please try again later.');
    }
  } catch (error) {
    console.error('Error sharing contact:', error);
    alert('An error occurred while sharing contact. Please try again later.');
  }
  // Implementation for sharing contact
}

async function rejectInterest(buyerId) {
  console.log(`Rejecting interest from buyer ID: ${buyerId}`);
  const apiUrl = 'http://18.117.164.164:4001/api/v1/queueing/reject_interest';

  // Prepare the request body using the existing listingID
  const requestBody = {
    listing_id: listingID,  // Use the listingID already defined
    buyer_id: buyerId
  };

  try {
    const response = await makeApiRequest(apiUrl, 'POST', requestBody, accessToken());

    if (response && response.status === 'SUCCESS') {
      console.log(response.data.message);
      alert(response.data.message); // Show success message
      // Optionally, you might want to refresh the listing or remove it from the UI
    } else {
      console.error('Failed to reject interest:', response);
      alert('Failed to reject interest. Please try again later.');
    }
  } catch (error) {
    console.error('Error rejecting interest:', error);
    alert('An error occurred while rejecting interest. Please try again later.');
  }
  // Implementation for rejecting interest
}

async function saleComplete(buyerId) {
  console.log(`Completing sale with buyer ID: ${buyerId}`);
  const apiUrl = 'http://18.117.164.164:4001/api/v1/queueing/mark_sale_complete';

  // Prepare the request body using the existing listingID
  const requestBody = {
    listing_id: listingID,  // Use the listingID already defined
    buyer_id: buyerId
  };

  try {
    const response = await makeApiRequest(apiUrl, 'PUT', requestBody, accessToken());

    if (response && response.status === 'SUCCESS') {
      console.log(response.data.message);
      alert(response.data.message); // Show success message
      // Optionally, refresh the interested listings or update the UI
    } else {
      console.error('Failed to complete sale:', response);
      alert('Failed to complete sale. Please try again later.');
    }
  } catch (error) {
    console.error('Error completing sale:', error);
    alert('An error occurred while completing the sale. Please try again later.');
  }
  // Implementation for completing the sale
}
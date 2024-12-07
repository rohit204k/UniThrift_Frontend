// Function to fetch the access token from local storage
const accessToken = () => localStorage.getItem('accessToken');

// Get the necessary DOM elements
const boughtItemsList = document.getElementById('bought-items-list');
const soldItemsList = document.getElementById('sold-items-list');
const boughtButton = document.getElementById('bought-button');
const soldButton = document.getElementById('sold-button');

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

// Function to fetch and display details of a specific item
async function fetchItemDetails(listingId) {
  try {
    const apiUrl = `http://18.117.164.164:4001/api/v1/history/get_listing_details/${listingId}`;
    const token = accessToken();

    if (!token) {
      throw new Error('Access token is missing or invalid.');
    }

    const response = await makeApiRequest(apiUrl, 'GET', null, token);
    
    if (response && response.status === 'SUCCESS' && response.data) {
      displayItemDetails(response.data);
    } else {
      console.error('Failed to fetch item details.');
    }
  } catch (error) {
    console.error('Error fetching item details:', error);
  }
}

// Function to display item details in a popup
function displayItemDetails(item) {
  const titleElement = document.getElementById('popup-title');
  const priceElement = document.getElementById('popup-price');
  const descriptionElement = document.getElementById('popup-description');
  const sellerNameElement = document.getElementById('seller-name');
  const buyerNameElement = document.getElementById('buyer-name'); // Ensure this ID matches the HTML
  const buyerCommentsElement = document.getElementById('buyer-comments');

  titleElement.textContent = item.title;
  priceElement.textContent = `Price: $${item.price}`;
  descriptionElement.textContent = item.description;
  sellerNameElement.textContent = item.seller_name;
  buyerNameElement.textContent = item.buyer_name; // Display buyer's name
  buyerCommentsElement.textContent = item.buyer_comments; // Display buyer comments

  document.getElementById('item-popup').style.display = 'flex'; // Show the popup
}

// Function to close the popup
function closePopup() {
  document.getElementById('item-popup').style.display = 'none';
}

// Update item display functions to include click events
function displayBoughtItems(items) {
  boughtItemsList.innerHTML = '';

  items.forEach(item => {
    const itemElement = document.createElement('div');
    itemElement.classList.add('item-card');

    const titleElement = document.createElement('h3');
    titleElement.textContent = item.title;

    const priceElement = document.createElement('p');
    priceElement.textContent = `Price: $${item.price}`;

    itemElement.appendChild(titleElement);
    itemElement.appendChild(priceElement);

    // Add click event listener
    itemElement.addEventListener('click', () => {
      fetchItemDetails(item._id); // Ensure item.id is valid
    });

    boughtItemsList.appendChild(itemElement);
  });
}

function displaySoldItems(items) {
  soldItemsList.innerHTML = '';

  items.forEach(item => {
    const itemElement = document.createElement('div');
    itemElement.classList.add('item-card');

    const titleElement = document.createElement('h3');
    titleElement.textContent = item.title;

    const priceElement = document.createElement('p');
    priceElement.textContent = `Price: $${item.price}`;

    itemElement.appendChild(titleElement);
    itemElement.appendChild(priceElement);

    // Add click event listener
    itemElement.addEventListener('click', () => {
      fetchItemDetails(item._id); // Ensure item.id is valid
    });

    soldItemsList.appendChild(itemElement);
  });
}

// Fetch and display bought items
async function fetchBoughtItems() {
  try {
    const apiUrl = 'http://18.117.164.164:4001/api/v1/history/get_purchased_listings';
    const token = accessToken();

    if (!token) {
      throw new Error('Access token is missing or invalid.');
    }

    const response = await makeApiRequest(apiUrl, 'GET', null, token);

    if (response && response.status === 'SUCCESS' && response.data) {
      displayBoughtItems(response.data);
      boughtItemsList.style.display = 'block';
      soldItemsList.style.display = 'none';
      boughtButton.classList.add('active');
      soldButton.classList.remove('active');
    } else {
      boughtItemsList.innerHTML = '<p>Failed to fetch your bought items. Please try again later.</p>';
    }
  } catch (error) {
    console.error('Error fetching bought items:', error);
    boughtItemsList.innerHTML = '<p>Failed to fetch your bought items. Please try again later.</p>';
  }
}

// Fetch and display sold items
async function fetchSoldItems() {
  try {
    const apiUrl = 'http://18.117.164.164:4001/api/v1/history/get_sold_listings';
    const token = accessToken();

    if (!token) {
      throw new Error('Access token is missing or invalid.');
    }

    const response = await makeApiRequest(apiUrl, 'GET', null, token);

    if (response && response.status === 'SUCCESS' && response.data) {
      displaySoldItems(response.data);
      soldItemsList.style.display = 'block';
      boughtItemsList.style.display = 'none';
      soldButton.classList.add('active');
      boughtButton.classList.remove('active');
    } else {
      soldItemsList.innerHTML = '<p>Failed to fetch your sold items. Please try again later.</p>';
    }
  } catch (error) {
    console.error('Error fetching sold items:', error);
    soldItemsList.innerHTML = '<p>Failed to fetch your sold items. Please try again later.</p>';
  }
}

// Add event listeners to the buttons
boughtButton.addEventListener('click', fetchBoughtItems);
soldButton.addEventListener('click', fetchSoldItems);

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

// Initial page load: fetch and display bought items
fetchBoughtItems();
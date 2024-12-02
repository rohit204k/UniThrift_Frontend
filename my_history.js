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

// Function to display bought items
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

    boughtItemsList.appendChild(itemElement);
  });
}

// Function to display sold items
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

// Initial page load: fetch and display bought items
fetchBoughtItems();
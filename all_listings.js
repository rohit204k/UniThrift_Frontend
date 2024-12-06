
const accessToken = () => localStorage.getItem('accessToken');

// Get the necessary DOM elements
const itemListContainer = document.getElementById('item-list');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

// Variables to handle pagination
let currentPage = 1;
const itemsPerPage = 16; // Number of items per page
let totalItems = 0; // To keep track of total items fetched
let itemsOnCurrentPage = 0; // To track items on the current page

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

// Fetch items for the current page
async function fetchItems(page) {
    const apiUrl = `http://18.117.164.164:4001/api/v1/listing/get_listings?page=${page}&page_size=${itemsPerPage}`;
    const response = await makeApiRequest(apiUrl, 'GET', null, accessToken());
    
    if (response.status === 'SUCCESS') {
        totalItems = response.totalItems; // Total number of items from API response
        itemsOnCurrentPage = response.data.length; // Number of items returned for the current page
        return response.data; // Return the actual data
    }
    return [];
}

// Display items
function displayItems(items) {
    itemListContainer.innerHTML = ''; // Clear previous items
    items.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'item';
        itemDiv.innerHTML = `
            <h2>${item.title}</h2>
            <p><strong>Price:</strong> $${item.price}</p>
            <p><strong>Status:</strong> ${item.status}</p>
        `;

        // Make each item clickable and redirect to the details page
        itemDiv.addEventListener('click', () => {
            window.location.href = `item_details.html?itemId=${item._id}`;
        });

        itemListContainer.appendChild(itemDiv);
    });

    updatePaginationButtons();
}

// Update pagination buttons based on the current page
function updatePaginationButtons() {
    prevBtn.disabled = currentPage === 1; // Disable if on the first page
    nextBtn.disabled = itemsOnCurrentPage < itemsPerPage; // Disable if fewer items than expected
}

// Load items for the current page
async function loadItems() {
    const newItems = await fetchItems(currentPage);
    displayItems(newItems);
}

// Navigate to the next page
nextBtn.addEventListener('click', () => {
    currentPage++;
    loadItems();
});

// Navigate to the previous page
prevBtn.addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        loadItems();
    }
});

// Initial loading of items
loadItems();
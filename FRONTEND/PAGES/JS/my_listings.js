// Access token retrieval
const accessToken = () => localStorage.getItem('accessToken');

// Get the necessary DOM elements
const myListingsContainer = document.getElementById('my-listings-container');
const nextButton = document.getElementById('my-next-button');
const backButton = document.getElementById('my-back-button');

// Debugging function to log important information
function debugLog(message, data) {
    console.log(`[MyListings Debug] ${message}`, data);
}

// API request utility
async function makeApiRequest(url, method, data = null, token = null) {
    try {
        debugLog('API Request URL', url);
        
        const headers = {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
        };

        const response = await fetch(url, {
            method,
            headers,
            body: data ? JSON.stringify(data) : null,
        });

        debugLog('Response Status', response.status);

        if (!response.ok) {
            const error = await response.text();
            debugLog('API Error Response', error);
            throw new Error(`Request failed: ${response.statusText}`);
        }

        const jsonResponse = await response.json();
        debugLog('Full API Response', jsonResponse);
        return jsonResponse;
    } catch (error) {
        debugLog('Network Error', error);
        throw error;
    }
}

// Variables for pagination
let currentPage = 1;
const itemsPerPage = 8;
let allItems = [];

// Fetch all user listings
async function fetchAllUserListings() {
    try {
        const token = accessToken();
        if (!token) {
            throw new Error('Access token is missing.');
        }

        let page = 1;
        let hasMoreItems = true;

        while (hasMoreItems) {
            const apiUrl = `http://18.117.164.164:4001/api/v1/listing/get_user_listings?page=${page}&page_size=${itemsPerPage}`;
            const response = await makeApiRequest(apiUrl, 'GET', null, token);

            if (response?.status === 'SUCCESS' && response.data) {
                const nonDeletedItems = response.data.filter(item => !item.is_deleted);
                allItems.push(...nonDeletedItems);

                if (nonDeletedItems.length < itemsPerPage) {
                    hasMoreItems = false;
                }

                page++;
            } else {
                hasMoreItems = false;
            }
        }

        debugLog('Total Items Fetched', allItems.length);
        displayUserListings();
        updatePaginationButtons();
    } catch (error) {
        console.error(error);
        displayError('An error occurred while fetching listings.');
    }
}

// Display user's listings for the current page
function displayUserListings() {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageItems = allItems.slice(startIndex, endIndex);
    
    myListingsContainer.innerHTML = '';

    if (pageItems.length > 0) {
        pageItems.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'item';
            itemDiv.innerHTML = `
                <div class="item-title">${item.title}</div>
                <div class="item-status">Status: ${item.status}</div>
                <div class="item-price">Price: $${item.price}</div>
            `;

            itemDiv.addEventListener('click', () => {
                window.location.href = `../HTML/get_interested_listings_seller.html?listingID=${item._id}`;
            });

            renderItemActions(item, itemDiv);
            myListingsContainer.appendChild(itemDiv);
        });
    } else {
        displayError('No listings to display.');
    }
}

// Update pagination buttons
function updatePaginationButtons() {
    const totalItems = allItems.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    backButton.style.display = currentPage > 1 ? 'block' : 'none';
    nextButton.style.display = currentPage < totalPages ? 'block' : 'none';

    backButton.disabled = currentPage <= 1;
    nextButton.disabled = currentPage >= totalPages;
}

// Event listeners for pagination buttons
nextButton.addEventListener('click', () => {
    const totalPages = Math.ceil(allItems.length / itemsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        displayUserListings();
        updatePaginationButtons();
    }
});

backButton.addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        displayUserListings();
        updatePaginationButtons();
    }
});
document.getElementById('profileid').addEventListener('click', () => {
    const dropdown = document.querySelector('.dropdown');
    dropdown.classList.toggle('show'); // Toggle the dropdown visibility
  });

function logout() {
// Clear all items from local storage
localStorage.clear();

// Redirect to index.html
window.location.href = '../HTML/index.html';
}

// Event listener for the logout link
document.getElementById('logout-link').addEventListener('click', (event) => {
event.preventDefault(); // Prevent the default link behavior
logout(); // Call the logout function
});
// Initial page load
fetchAllUserListings();
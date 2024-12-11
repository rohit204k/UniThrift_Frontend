// Get the necessary DOM elements
const interestedItemsContainer = document.getElementById('interested-items-container');
const nextButton = document.getElementById('my-next-button');
const backButton = document.getElementById('my-back-button');

// Access token function
const accessToken = () => localStorage.getItem('accessToken');

// Variables for pagination
let currentPage = 1;
const itemsPerPage = 6;
let allItems = [];

// Debugging function to log important information
function debugLog(message, data) {
    console.log(`[InterestedListings Debug] ${message}`, data);
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

// Fetch all interested listings
async function fetchAllInterestedListings() {
    try {
        const token = accessToken();
        if (!token) {
            throw new Error('Access token is missing.');
        }

        let page = 1;
        let hasMoreItems = true;

        while (hasMoreItems) {
            const apiUrl = `http://18.117.164.164:4001/api/v1/queueing/get_interested_listings?page=${page}&page_size=${itemsPerPage}`;
            const response = await makeApiRequest(apiUrl, 'GET', null, token);

            if (response?.status === 'SUCCESS' && response.data) {
                allItems.push(...response.data);

                if (response.data.length < itemsPerPage) {
                    hasMoreItems = false;
                }

                page++;
            } else {
                hasMoreItems = false;
            }
        }

        debugLog('Total Items Fetched', allItems.length);
        displayInterestedListings();
        updatePaginationButtons();
    } catch (error) {
        console.error(error);
        interestedItemsContainer.innerHTML = '<p>An error occurred while fetching interested listings.</p>';
    }
}

// Display interested listings for the current page
function displayInterestedListings() {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageItems = allItems.slice(startIndex, endIndex);
    
    interestedItemsContainer.innerHTML = '';

    if (pageItems.length > 0) {
        pageItems.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'interested-item-container';
            itemDiv.innerHTML = `
                <h2>${item.title || 'N/A'}</h2>
                <p><strong>Comment:</strong> ${item.comments || 'No comments available.'}</p>
                <p><strong>Status:</strong> ${item.status || 'Unknown'}</p>
                <div class="interested-item-actions">
                    <button class="view-button" onclick="viewDetails('${item.listing_id}')">View Details</button>
                </div>
            `;

            interestedItemsContainer.appendChild(itemDiv);
        });
    } else {
        interestedItemsContainer.innerHTML = '<p>No interested items found.</p>';
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
        displayInterestedListings();
        updatePaginationButtons();
    }
});

backButton.addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        displayInterestedListings();
        updatePaginationButtons();
    }
});

// Function to view details of a specific listing
function viewDetails(listingId) {
    window.location.href = `../HTML/get_interested_listings.html?listing_id=${listingId}`;
}

// Logout function
function logout() {
    localStorage.clear();
    window.location.href = '../HTML/index.html';
}

// Event listener for the logout link
document.getElementById('logout-link').addEventListener('click', (event) => {
    event.preventDefault();
    logout();
});

// Event listener for profile dropdown
document.getElementById('profileid').addEventListener('click', () => {
    const dropdown = document.querySelector('.dropdown');
    dropdown.classList.toggle('show');
});

// Initial page load
fetchAllInterestedListings();
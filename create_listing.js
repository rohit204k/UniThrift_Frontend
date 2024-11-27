// Backend API base URL
const API_BASE_URL = "http://18.117.164.164:4001/api/v1";

// Access token for API authentication
const getAccessToken = () => "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNjc0MGMxZTRlZDYyNmYxMTM3MjhmYjNmIiwidXNlcl90eXBlIjoiU1RVREVOVCIsInRva2VuX3R5cGUiOiJiZWFyZXIiLCJpYXQiOjE3MzI2NDYzNDksImV4cCI6MTczMjczMjc0OX0.JIbl6hCJWj3W-zz323ei8aSZGyZHzcK7eam5o65mAgs";

// Get the necessary DOM elements
const createItemForm = document.getElementById('create-item-form');
const categorySelect = document.getElementById('category');

// Function to fetch all categories from the backend
async function fetchCategories() {
    try {
        const response = await fetch(`${API_BASE_URL}/item_categories/get_items`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${getAccessToken()}`, // Using token for authentication
            }
        });
        if (!response.ok) {
            throw new Error("Failed to fetch categories");
        }
        const { data } = await response.json();
        populateCategoryDropdown(data.data);
    } catch (error) {
        console.error("Error fetching categories:", error.message);
    }
}

// Function to populate dropdown with categories
function populateCategoryDropdown(categories) {
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category._id; // Assuming item_id is the ID you want to send
        option.textContent = category.item_name; // Display name of the category
        categorySelect.appendChild(option);
    });
}

// Function to handle form submission
createItemForm.addEventListener('submit', async function (event) {
    event.preventDefault(); // Prevent form from reloading the page

    // Get form values
    const title = document.getElementById('title').value;
    const categoryId = categorySelect.value; // Get selected category ID
    const description = document.getElementById('description').value;
    const price = document.getElementById('price').value;
    console.error(categoryId);

    // Prepare data to send to the backend
    const itemData = {
        title: title,
        item_id: categoryId, // Use selected category ID
        description: description,
        price: parseFloat(price)
    };

    try {
        // Send the data to the backend with authentication token
        const response = await fetch('http://18.117.164.164:4001/api/v1/listing/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getAccessToken()}`,  // Include the access token here
            },
            body: JSON.stringify(itemData)
        });

        // Handle the response from the backend
        if (response.ok) {
            const data = await response.json();
            alert('Item created successfully!'); // Show a success message
            window.location.href = 'items.html'; // Redirect to the main items page
        } else {
            const errorData = await response.json();
            alert('Error creating item: ' + errorData.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('There was an error submitting the item.');
    }
});

// Fetch categories when the page loads
fetchCategories();

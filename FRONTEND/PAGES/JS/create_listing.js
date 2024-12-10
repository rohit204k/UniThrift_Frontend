// Access token for API authentication
const getAccessToken = () => localStorage.getItem('accessToken');
// Backend API base URL
const API_BASE_URL = "http://18.117.164.164:4001/api/v1";
// Get the necessary DOM elements
const createItemForm = document.getElementById('create-item-form');
const categorySelect = document.getElementById('category');

// Function to fetch all categories from the backend
async function fetchCategories() {
    try {
        const response = await fetch(`${API_BASE_URL}/item_categories/get_items?page_size=30`, {
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

createItemForm.addEventListener('submit', async function (event) {
  event.preventDefault();

  // Get form values
  const title = document.getElementById('title').value;
  const categoryId = categorySelect.value;
  const description = document.getElementById('description').value;
  const price = document.getElementById('price').value;
  const imageInput = document.getElementById('image');
  const imageFiles = imageInput.files; // Get all selected files

  // Prepare data to send to the backend
  const itemData = {
    title: title,
    item_id: categoryId,
    description: description,
    price: parseFloat(price)
  };

  try {
    // Send the data to the backend with authentication token
    const response = await fetch('http://18.117.164.164:4001/api/v1/listing/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAccessToken()}`,
      },
      body: JSON.stringify(itemData)
    });

    if (response.ok) {
      const data = await response.json();
      const listingId = data.data.listing_id;

      // Loop through each image file
      for (const imageFile of imageFiles) {
        // Generate the pre-signed URL for image upload
        const presignedUrlResponse = await fetch(`${API_BASE_URL}/listing/image/generate_upload_url`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getAccessToken()}`,
          },
          body: JSON.stringify({ listing_id: listingId, file_extension: imageFile.type.split('/')[1] }),
        });

        if (presignedUrlResponse.ok) {
          const { data } = await presignedUrlResponse.json();
          const presignedUrl = data.url;

          // Upload the image using the pre-signed URL
          await fetch(presignedUrl, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/octet-stream',
            },
            body: imageFile,
          });
        } else {
          const errorData = await presignedUrlResponse.json();
          alert('Error generating pre-signed URL: ' + errorData.message);
          return; // Exit if there's an error
        }
      }

      alert('Item created and images uploaded successfully!');
      window.location.href = '../HTML/items.html';
    } else {
      const errorData = await response.json();
      alert('Error creating item: ' + errorData.message);
    }
  } catch (error) {
    console.error('Error:', error);
    alert('There was an error submitting the item.');
  }
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
document.getElementById('profileid').addEventListener('click', () => {
  const dropdown = document.querySelector('.dropdown');
  dropdown.classList.toggle('show'); // Toggle the dropdown visibility
});
// Fetch categories when the page loads
fetchCategories();

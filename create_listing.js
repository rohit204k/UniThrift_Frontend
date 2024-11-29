// Access token for API authentication
const getAccessToken = () => "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNjc0MGMxZTRlZDYyNmYxMTM3MjhmYjNmIiwidXNlcl90eXBlIjoiU1RVREVOVCIsInRva2VuX3R5cGUiOiJiZWFyZXIiLCJpYXQiOjE3MzI3NTExMjcsImV4cCI6MTczMjgzNzUyN30.OGE5wrAQP5yyyyNWSkNUg3o5hZm00a9GGTCKLcpkIMA";
const accessToken = () => localStorage.getItem('accessToken');
// Backend API base URL
const API_BASE_URL = "http://18.117.164.164:4001/api/v1";
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

createItemForm.addEventListener('submit', async function (event) {
    event.preventDefault();
  
    // Get form values
    const title = document.getElementById('title').value;
    const categoryId = categorySelect.value;
    const description = document.getElementById('description').value;
    const price = document.getElementById('price').value;
    const imageInput = document.getElementById('image');
    const imageFile = imageInput.files[0];
  
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
        // const listingId="6747c67b3443ee33b30aa097";
  
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
          console.log('Pre-signed URL:', presignedUrl);
  
          // Upload the image using the pre-signed URL
          await fetch(presignedUrl, {
            method: 'PUT',
            // mode: 'no-cors',
            headers: {
              'Content-Type': 'application/octet-stream',
            },
            body: imageFile,
          });
  
          alert('Item created and image uploaded successfully!');
          window.location.href = 'items.html';
        } else {
          try {
            const errorData = await presignedUrlResponse.json();
            alert('Error generating pre-signed URL: ' + errorData.message);
          } catch (error) {
            console.error('Error reading response:', error);
            alert('There was an error generating the pre-signed URL.');
          }
        }
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

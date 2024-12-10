const getAccessToken = () => localStorage.getItem('accessToken');

// Get the necessary DOM elements
const addCategoryButton = document.getElementById("add-category-button");
const categoryDialog = document.getElementById("category-dialog");
const cancelButton = document.getElementById("cancel-button");
const categoryForm = document.getElementById("category-form");
const categoryList = document.getElementById("categories");
const dialogTitle = document.getElementById("dialog-title");
const submitButton = document.getElementById("submit-button");

// Array to hold categories
let categories = [];
let editIndex = null; // To track which item is being edited

// Backend API base URL
const API_BASE_URL = "http://18.117.164.164:4001/api/v1/item_categories";

async function fetchCategories() {
    try {
        const response = await fetch(`${API_BASE_URL}/get_items`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${getAccessToken()}`, // Using token for authentication
            }
        });
        if (!response.ok) {
            throw new Error("Failed to fetch categories");
        }
        const { data } = await response.json();
        categories = data.data;
        updateCategoryList();
    } catch (error) {
        console.error("Error fetching categories:", error.message);
    }
}
async function addCategoryToBackend(name, description) {
    try {
        const response = await fetch(`${API_BASE_URL}/add_new_item`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${getAccessToken()}`, // Adding token to headers
            },
            body: JSON.stringify({ item_name: name, item_description: description }),
        });
        if (!response.ok) {
            throw new Error("Failed to add category");
        }
        await fetchCategories(); // Refresh the list after adding the category
    } catch (error) {
        console.error("Error adding category:", error.message);
    }
}

async function updateCategoryInBackend(id, name, description) {
    try {
        const response = await fetch(`${API_BASE_URL}/update_item_details/${id}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${getAccessToken()}`, // Adding token to headers
            },
            body: JSON.stringify({ item_name: name, item_description: description }),
        });
        if (!response.ok) {
            throw new Error("Failed to update category");
        }
        await fetchCategories(); // Refresh the list after updating
    } catch (error) {
        console.error("Error updating category:", error.message);
    }
}

// Function to delete a category via the backend
async function deleteCategoryFromBackend(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/delete_item/${id}`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${getAccessToken()}`, // Adding token to headers
            },
        });
        if (!response.ok) {
            throw new Error("Failed to delete category");
        }
        await fetchCategories(); // Refresh the list after deleting the category
    } catch (error) {
        console.error("Error deleting category:", error.message);
    }
}

// Function to open the category dialog
function openCategoryDialog() {
    categoryDialog.style.display = "flex";
    dialogTitle.innerText = "Add New Category"; // Default title
    submitButton.innerText = "Submit"; // Default button text
    categoryForm.reset();
    editIndex = null; // Clear edit index
}

// Function to close the category dialog
function closeCategoryDialog() {
    categoryDialog.style.display = "none";
}

async function addOrUpdateCategory(name, description) {
    if (!name.trim()) {
        alert("Category name is required.");
        return;
    }

    if (editIndex !== null) {
        const category = categories[editIndex];
        await updateCategoryInBackend(category._id, name, description);
    } else {
        await addCategoryToBackend(name, description);
    }
    closeCategoryDialog();
    await fetchCategories(); // Refresh the list after adding or updating
}


async function deleteCategory(id) {
    try {
        await deleteCategoryFromBackend(id);
        await fetchCategories();
    } catch (error) {
        console.error("Error deleting category:", error.message);
    }
}

function editCategory(id) {
    const category = categories.find((c) => c._id === id);
    document.getElementById("category-name").value = category.item_name;
    document.getElementById("category-description").value = category.item_description;

    openCategoryDialog();
    dialogTitle.innerText = "Edit Category";
    submitButton.innerText = "Update";
    editIndex = categories.findIndex((c) => c._id === id);
}


// Function to update the category list
function updateCategoryList() {
    categoryList.innerHTML = ""; // Clear the current list

    categories.forEach((category) => {
        const li = document.createElement("li");

        li.innerHTML = `
            <div>
                <strong>${category.item_name}</strong>: ${category.item_description}
            </div>
            <div class="action-buttons">
                <button onclick="editCategory('${category._id}')">✏️</button>
                <button class="delete" onclick="deleteCategory('${category._id}')">❌</button>
            </div>
        `;

        categoryList.appendChild(li);
    });
}

// Event listener for the "Add Category" button
addCategoryButton.addEventListener("click", openCategoryDialog);

// Event listener for the "Cancel" button
cancelButton.addEventListener("click", closeCategoryDialog);

// Event listener for the category form submission
categoryForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const categoryName = document.getElementById("category-name").value;
    const categoryDescription = document.getElementById("category-description").value;

    await addOrUpdateCategory(categoryName, categoryDescription);
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
// Fetch and display categories on page load
fetchCategories();

// Expose functions for the buttons (for inline event handlers in HTML)
window.editCategory = editCategory;
window.deleteCategory = deleteCategory;

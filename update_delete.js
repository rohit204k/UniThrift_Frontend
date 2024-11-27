// script.js

// Function to fetch user details from the token
function getUserIdFromToken(token) {
    try {
        const payload = JSON.parse(atob(token.split('.')[1])); // Decode JWT payload
        return payload.user_id; // Extract user ID
    } catch (error) {
        console.error("Failed to decode access token:", error);
        return null;
    }
}

// Function to display update and delete buttons for the user's own items
function renderItemActions(item, container) {
    const currentUserId = getUserIdFromToken(accessToken());

    // Only show update and delete buttons if the item belongs to the current user
    if (item.seller_id === currentUserId) {
        const actionContainer = document.createElement('div');
        actionContainer.classList.add('item-actions');

        // Update button
        const updateButton = document.createElement('button');
        updateButton.innerHTML = '✏️'; // Pencil icon
        updateButton.classList.add('update-button');
        updateButton.addEventListener('click', (event) => {
            event.stopPropagation(); // Prevent item details page from opening
            openUpdateForm(item); // Pass the entire item object
        });

        // Delete button
        const deleteButton = document.createElement('button');
        deleteButton.innerHTML = '❌'; // Cross icon
        deleteButton.classList.add('delete-button');
        deleteButton.addEventListener('click', (event) => {
            event.stopPropagation(); // Prevent item details page from opening
            showDeleteConfirmation(item);
        });

        // Append buttons to the action container
        actionContainer.appendChild(updateButton);
        actionContainer.appendChild(deleteButton);

        // Append action container to the item's container
        container.appendChild(actionContainer);
    }
}

// Function to create a modal backdrop
function createModalBackdrop() {
    const backdrop = document.createElement('div');
    backdrop.classList.add('modal-backdrop');
    backdrop.style.position = 'fixed';
    backdrop.style.top = '0';
    backdrop.style.left = '0';
    backdrop.style.width = '100%';
    backdrop.style.height = '100%';
    backdrop.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    backdrop.style.zIndex = '999';
    return backdrop;
}

// Function to open update form in a popup
function openUpdateForm(itemOrEvent) {
    const backdrop = createModalBackdrop();
    document.body.appendChild(backdrop);

    const modal = document.createElement('div');
    modal.classList.add('modal');
    modal.style.position = 'fixed';
    modal.style.top = '50%';
    modal.style.left = '50%';
    modal.style.transform = 'translate(-50%, -50%)';
    modal.style.padding = '20px';
    modal.style.background = '#fff';
    modal.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
    modal.style.zIndex = '1000';
    modal.style.borderRadius = '8px';
    modal.style.width = '300px';

    const title = document.createElement('h3');
    title.textContent = 'Update Listing';
    title.style.marginBottom = '15px';
    title.style.textAlign = 'center';

    let listingId, description, price, status;

    // Extract necessary fields
    if (typeof itemOrEvent === 'object' && itemOrEvent !== null) {
        listingId = itemOrEvent.id || itemOrEvent._id || itemOrEvent.listing_id;
        description = itemOrEvent.description;
        price = itemOrEvent.price;
        status = itemOrEvent.status;
    }

    const descriptionInput = createInputField('Description', description);
    const priceInput = createInputField('Price', price, 'number');
    const statusInput = createInputField('Status (AVAILABLE/SOLD)', status);

    const saveButton = document.createElement('button');
    saveButton.textContent = 'Save';
    saveButton.addEventListener('click', () => {
        const updatedData = {
            description: descriptionInput.querySelector('input').value,
            price: parseFloat(priceInput.querySelector('input').value),
            status: statusInput.querySelector('input').value,
        };

        if (updatedData.description && !isNaN(updatedData.price) && updatedData.status) {
            updateListing(listingId, updatedData);
            closeModal(modal, backdrop);
        } else {
            alert('Please fill in all fields correctly.');
        }
    });

    const cancelButton = document.createElement('button');
    cancelButton.textContent = 'Cancel';
    cancelButton.addEventListener('click', () => closeModal(modal, backdrop));

    const buttonContainer = document.createElement('div');
    buttonContainer.appendChild(saveButton);
    buttonContainer.appendChild(cancelButton);

    modal.appendChild(title);
    modal.appendChild(descriptionInput);
    modal.appendChild(priceInput);
    modal.appendChild(statusInput);
    modal.appendChild(buttonContainer);

    document.body.appendChild(modal);
}

function showDeleteConfirmation(item) {
    // Initialize variables
    let listingId, description, price, status;

    // Extract necessary fields from the item
    if (typeof item === 'object' && item !== null) {
        listingId = item.id || item._id || item.listing_id;
        description = item.description;
        price = item.price;
        status = item.status;

        console.log('Preparing to delete item:', {
            listingId,
            description,
            price,
            status
        }); // Debug log to verify extracted data
    }

    // Create modal backdrop
    const backdrop = createModalBackdrop();
    document.body.appendChild(backdrop);

    // Create modal container
    const modal = document.createElement('div');
    modal.classList.add('delete-confirmation-modal');
    modal.style.position = 'fixed';
    modal.style.top = '50%';
    modal.style.left = '50%';
    modal.style.transform = 'translate(-50%, -50%)';
    modal.style.padding = '20px';
    modal.style.background = '#fff';
    modal.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
    modal.style.zIndex = '1000';
    modal.style.borderRadius = '8px';
    modal.style.width = '300px';
    modal.style.textAlign = 'center';

    // Confirmation message
    const message = document.createElement('p');
    message.textContent = 'Are you sure you want to delete this item?';

    // Delete button
    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.style.marginRight = '10px';
    deleteButton.style.padding = '8px 15px';
    deleteButton.style.backgroundColor = '#f44336';
    deleteButton.style.color = 'white';
    deleteButton.style.border = 'none';
    deleteButton.style.borderRadius = '4px';

    // Ensure the correct listing ID is being sent
    deleteButton.addEventListener('click', () => {
        console.log('Deleting item with ID:', listingId); // Log the ID
        deleteListing(listingId); // Pass the correct ID to deleteListing
        closeModal(modal, backdrop);
    });

    // Cancel button
    const cancelButton = document.createElement('button');
    cancelButton.textContent = 'Cancel';
    cancelButton.style.padding = '8px 15px';
    cancelButton.style.backgroundColor = '#4CAF50';
    cancelButton.style.color = 'white';
    cancelButton.style.border = 'none';
    cancelButton.style.borderRadius = '4px';
    cancelButton.addEventListener('click', () => closeModal(modal, backdrop));

    // Append elements to modal
    modal.appendChild(message);
    modal.appendChild(deleteButton);
    modal.appendChild(cancelButton);

    // Add modal to document
    document.body.appendChild(modal);
}

// Helper function to create input fields
function createInputField(labelText, value = '', type = 'text') {
    const container = document.createElement('div');
    container.style.marginBottom = '10px';

    const label = document.createElement('label');
    label.textContent = labelText;
    label.style.display = 'block';
    label.style.marginBottom = '5px';

    const input = document.createElement('input');
    input.type = type;
    input.value = value;
    input.style.width = '100%';
    input.style.padding = '8px';
    input.style.border = '1px solid #ccc';
    input.style.borderRadius = '4px';

    container.appendChild(label);
    container.appendChild(input);
    return container;
}

// Function to close the modal
function closeModal(modal, backdrop) {
    if (modal) {
        modal.remove();
    }
    if (backdrop) {
        backdrop.remove();
    }
}

// Function to update a listing
async function updateListing(listingId, updatedData) {
    const apiUrl = `http://18.117.164.164:4001/api/v1/listing/update/${listingId}`;

    try {
        const response = await makeApiRequest(apiUrl, 'PUT', {
            description: updatedData.description,
            price: updatedData.price,
            status: updatedData.status
        }, accessToken());

        if (response && response.status === 'SUCCESS') {
            // Update the item in the DOM
            const itemElement = document.querySelector(`.item[data-item-id="${listingId}"]`);
            if (itemElement) {
                const priceElement = itemElement.querySelector('p:nth-child(2)');
                const statusElement = itemElement.querySelector('p:nth-child(3)');
                // Update the DOM elements with new values
                if (priceElement) priceElement.textContent = `Price: $${updatedData.price}`;
                if (statusElement) statusElement.textContent = `Status: ${updatedData.status}`;
                itemElement.querySelector('.item-description').textContent = updatedData.description; // Update description
            }
            alert('Listing updated successfully!');
        } else {
            alert(`Error: ${response.errorData.message}`);
        }
    } catch (error) {
        console.error('Error updating listing:', error);
        alert('An unexpected error occurred. Please try again.');
    }
}

// Function to delete a listing
async function deleteListing(listingId) {
    const apiUrl = `http://18.117.164.164:4001/api/v1/listing/delete/${listingId}`;

    try {
        const response = await makeApiRequest(apiUrl, 'DELETE', null, accessToken());
        if (response && response.status === 'SUCCESS') {
            // Remove the item from the DOM
            const itemElement = document.querySelector(`.item[data-item-id="${listingId}"]`);
            if (itemElement) {
                itemElement.remove();
            }
            alert('Listing deleted successfully!');
        } else {
            alert(`Error: ${response.errorData.message}`);
        }
    } catch (error) {
        console.error('Error deleting listing:', error);
        alert('An unexpected error occurred. Please try again.');
    }
}

// Reusable function for making API requests
async function makeApiRequest(url, method, body = null, token) {
    const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
    };

    const options = {
        method,
        headers,
        body: body ? JSON.stringify(body) : null,
    };

    const response = await fetch(url, options);
    const data = await response.json();

    if (!response.ok) {
        throw new Error(`API request failed with status code ${response.status}`);
    }

    return data;
}
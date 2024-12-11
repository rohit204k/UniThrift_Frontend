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
    if (item.seller_id === currentUserId && item.status !== 'SOLD') {
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

    let listingId, itemTitle, description, price, status;

    if (typeof itemOrEvent === 'object' && itemOrEvent !== null) {
        listingId = itemOrEvent.id || itemOrEvent._id || itemOrEvent.listing_id;
        itemTitle = itemOrEvent.title;
        description = itemOrEvent.description;
        price = itemOrEvent.price;
        status = itemOrEvent.status;
    }

    const titleInput = createInputField('Title', itemTitle, 'text', 'Enter item title');
    const descriptionInput = createInputField('Description', description, 'text', 'Enter item description');
    const priceInput = createInputField('Price', price, 'number', 'Enter item price');
    // const statusInput = createInputField('Status (AVAILABLE/ONHOLD/SOLD)', status, 'text', 'Enter item status');
    // Create a dropdown for status
    const statusContainer = document.createElement('div');
    statusContainer.style.marginBottom = '15px';

    const statusLabel = document.createElement('label');
    statusLabel.textContent = 'Status';
    statusLabel.style.display = 'block';
    statusLabel.style.fontWeight = 'bold';
    statusLabel.style.marginBottom = '5px';

    const statusSelect = document.createElement('select');
    statusSelect.style.width = '100%';
    statusSelect.style.padding = '8px';
    statusSelect.style.border = '1px solid #ccc';
    statusSelect.style.borderRadius = '4px';

    // Add dropdown options 
    const statuses = ['NEW', 'ON_HOLD'];
    statuses.forEach((statusOption) => {
        const option = document.createElement('option');
        option.value = statusOption;
        option.textContent = statusOption;
        if (status === statusOption) option.selected = true; // Pre-select the current status
        statusSelect.appendChild(option);
    });

    statusContainer.appendChild(statusLabel);
    statusContainer.appendChild(statusSelect);

    // Create multiple image upload input
    const imageContainer = document.createElement('div');
    imageContainer.style.marginBottom = '15px';

    const imageLabel = document.createElement('label');
    imageLabel.textContent = 'Upload Images';
    imageLabel.style.display = 'block';
    imageLabel.style.fontWeight = 'bold';
    imageLabel.style.marginBottom = '5px';

    const imageInput = document.createElement('input');
    imageInput.type = 'file';
    imageInput.accept = 'image/*';
    imageInput.multiple = true; // Allow multiple file selection
    imageInput.style.width = '100%';
    imageInput.style.padding = '8px';

    imageContainer.appendChild(imageLabel);
    imageContainer.appendChild(imageInput);

    const saveButton = document.createElement('button');
    saveButton.textContent = 'Save';
    saveButton.style.marginRight = '10px';
    saveButton.style.padding = '8px 15px';
    saveButton.style.backgroundColor = '#4CAF50';
    saveButton.style.color = 'white';
    saveButton.style.border = 'none';
    saveButton.style.borderRadius = '4px';

    saveButton.addEventListener('click', async () => {
        const updatedData = {
            title: titleInput.querySelector('input').value,
            description: descriptionInput.querySelector('input').value,
            price: parseFloat(priceInput.querySelector('input').value),
            // changed status: statusInput.querySelector('input').value,
            status: statusSelect.value,
        };

        if (
            updatedData.title &&
            updatedData.description &&
            !isNaN(updatedData.price) &&
            updatedData.status
        ) {
            try {
                await updateListing(listingId, updatedData);

                const imageFiles = imageInput.files;
                if (imageFiles.length > 0) {
                    for (let i = 0; i < imageFiles.length; i++) {
                        const imageFile = imageFiles[i];

                        const presignedUrlResponse = await fetch(
                            `http://18.117.164.164:4001/api/v1/listing/image/generate_upload_url`,
                            {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${accessToken()}`,
                                },
                                body: JSON.stringify({
                                    listing_id: listingId,
                                    file_extension: imageFile.type.split('/')[1],
                                }),
                            }
                        );

                        if (presignedUrlResponse.ok) {
                            const { data } = await presignedUrlResponse.json();
                            const presignedUrl = data.url;

                            const imageUploadResponse = await fetch(presignedUrl, {
                                method: 'PUT',
                                headers: {
                                    'Content-Type': 'application/octet-stream',
                                },
                                body: imageFile,
                            });

                            if (!imageUploadResponse.ok) {
                                throw new Error(`Image upload failed for file: ${imageFile.name}`);
                            }
                        } else {
                            throw new Error('Failed to generate pre-signed URL');
                        }
                    }
                }

                closeModal(modal, backdrop);
            } catch (error) {
                console.error('Error updating listing or uploading images:', error);
                alert('An error occurred while updating the listing or uploading the images.');
            }
        } else {
            alert('Please fill in all fields correctly.');
        }
    });

    const cancelButton = document.createElement('button');
    cancelButton.textContent = 'Cancel';
    cancelButton.style.padding = '8px 15px';
    cancelButton.style.backgroundColor = '#f44336';
    cancelButton.style.color = 'white';
    cancelButton.style.border = 'none';
    cancelButton.style.borderRadius = '4px';
    cancelButton.addEventListener('click', () => closeModal(modal, backdrop));

    const buttonContainer = document.createElement('div');
    buttonContainer.appendChild(saveButton);
    buttonContainer.appendChild(cancelButton);
    buttonContainer.style.marginTop = '15px';

    modal.appendChild(title);
    modal.appendChild(titleInput);
    modal.appendChild(descriptionInput);
    modal.appendChild(priceInput);
    modal.appendChild(statusContainer);
    modal.appendChild(imageContainer);
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
function createInputField(labelText, value = '', type = 'text', placeholder = '') {
    const container = document.createElement('div');
    container.style.marginBottom = '15px'; // Increased margin for better spacing

    // Create the label element
    const label = document.createElement('label');
    label.textContent = labelText; // Set the text for the label
    label.style.display = 'block'; // Ensure the label appears above the input
    label.style.fontWeight = 'bold'; // Optional: Make the label bold
    label.style.marginBottom = '5px'; // Space between the label and input

    // Create the input element
    const input = document.createElement('input');
    input.type = type;
    input.value = value;
    input.placeholder = placeholder; // Set the placeholder text
    input.style.width = '100%'; // Full width of the container
    input.style.padding = '8px'; // Padding for better usability
    input.style.border = '1px solid #ccc'; // Light border
    input.style.borderRadius = '4px'; // Rounded corners

    // Append the label and input to the container
    container.appendChild(label);
    container.appendChild(input);

    return container; // Return the container with both label and input
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
        const response = await makeApiRequest(apiUrl, 'PUT', updatedData, accessToken());

        if (response && response.status === 'SUCCESS') {
            // Locate item container
            const itemElement = document.querySelector(`.item[data-item-id="${listingId}"]`);
            if (itemElement) {
                // Update displayed description, price, and status
                itemElement.querySelector('.item-description').textContent = updatedData.description;
                itemElement.querySelector('.item-price').textContent = `Price: $${updatedData.price}`;
                itemElement.querySelector('.item-status').textContent = `Status: ${updatedData.status}`;
            }
            alert('Listing updated successfully!');
        } else {
            alert(`Failed to update listing: ${response.errorData.message}`);
        }
    } catch (error) {
        console.error('Error while updating listing:', error);
        alert('An error occurred while updating the listing. Please try again.');
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
document.addEventListener('DOMContentLoaded', () => {
    // Helper function for API requests
    async function makeApiRequest(url, method, data) {
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}` // Include token if needed
        };

        const response = await fetch(url, {
            method,
            headers,
            body: data ? JSON.stringify(data) : null,
        });

        if (!response.ok) {
            throw new Error(`API request failed with status code ${response.status}`);
        }

        return await response.json(); // Return the JSON response
    }

    // Function to update individual fields
    async function updateField(field, value) {
        const userData = {};
        userData[field] = value;

        try {
            const response = await makeApiRequest(
                'http://18.117.164.164:4001/api/v1/student/update',
                'PUT',
                userData
            );

            // Log the response for debugging
            console.log('API Response:', response);

            // Check if the response is successful
            return response && response.status === 'SUCCESS'; // Return true if successful
        } catch (error) {
            console.error(`Error updating ${field}:`, error);
            return false; // Return false if there was an error
        }
    }

    // Event listener for updating all fields
    document.getElementById('update-form').addEventListener('submit', async (event) => {
        event.preventDefault(); // Prevent the default form submission

        const firstName = document.getElementById('first-name').value.trim();
        const lastName = document.getElementById('last-name').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const address = document.getElementById('address').value.trim();

        let allUpdatesSuccessful = true; // Assume success

        // Update all fields and check results
        if (firstName && !(await updateField('first_name', firstName))) {
            allUpdatesSuccessful = false; // Update failed
        }
        if (lastName && !(await updateField('last_name', lastName))) {
            allUpdatesSuccessful = false; // Update failed
        }
        if (phone && !(await updateField('phone', phone))) {
            allUpdatesSuccessful = false; // Update failed
        }
        if (address && !(await updateField('address', address))) {
            allUpdatesSuccessful = false; // Update failed
        }

        // Display a single alert based on the result of all updates
        if (allUpdatesSuccessful) {
            alert('Successfully Updated');
        } else {
            alert('Some updates failed. Please try again.');
        }
    });
});
document.addEventListener('DOMContentLoaded', async () => {
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

    // Function to populate the fields with user data
    async function populateUserData() {
        try {
            const response = await makeApiRequest('http://18.117.164.164:4001/api/v1/student/get_student', 'GET');
            const userData = response.data;

            // Populate fields, checking for the string "string"
            document.getElementById('email').value = userData.email === "string" ? "" : userData.email;
            document.getElementById('university').value = userData.university === "string" ? "" : userData.university;
            document.getElementById('first-name').value = userData.first_name === "string" ? "" : userData.first_name;
            document.getElementById('last-name').value = userData.last_name === "string" ? "" : userData.last_name;
            document.getElementById('phone').value = userData.phone === "string" ? "" : userData.phone;
            document.getElementById('address').value = userData.address === "string" ? "" : userData.address;
        } catch (error) {
            console.error('Error fetching user data:', error);
            document.getElementById('error-message').innerText = 'Failed to load user data.';
            document.getElementById('error-message').style.display = 'block';
        }
    }

    // Function to update all fields at once
    async function updateAllFields() {
        const firstName = document.getElementById('first-name').value.trim();
        const lastName = document.getElementById('last-name').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const address = document.getElementById('address').value.trim();

        const userData = {
            first_name: firstName,
            last_name: lastName,
            phone: phone,
            address: address
        };

        try {
            const response = await makeApiRequest(
                'http://18.117.164.164:4001/api/v1/student/update',
                'PUT',
                userData
            );

            // Log the response for debugging
            console.log('API Response:', response);

            if (response && response.status === 'SUCCESS') {
                alert('Successfully Updated');
            } else {
                alert('Some updates failed. Please try again.');
            }
        } catch (error) {
            console.error('Error updating user data:', error);
            alert('An error occurred while updating. Please try again.');
        }
    }

    // Event listener for updating all fields
    document.getElementById('update-form').addEventListener('submit', (event) => {
        event.preventDefault(); // Prevent the default form submission
        updateAllFields(); // Call the function to update all fields
    });

    // Call the function to populate user data on page load
    populateUserData();
});
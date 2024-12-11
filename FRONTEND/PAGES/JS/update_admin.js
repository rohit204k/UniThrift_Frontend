document.addEventListener('DOMContentLoaded', async () => {
    // Helper function for API requests
    async function makeApiRequest(url, method, data) {
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        };

        const response = await fetch(url, {
            method,
            headers,
            body: data ? JSON.stringify(data) : null,
        });

        if (!response.ok) {
            throw new Error(`API request failed with status code ${response.status}`);
        }

        return await response.json();
    }

    // Function to populate fields with admin data
    async function populateAdminData() {
        try {
            const response = await makeApiRequest('http://18.117.164.164:4001/api/v1/admin/get_admin', 'GET');
            if (response.status === 'SUCCESS') {
                const adminData = response.data;
                document.getElementById('email').value = adminData.email;
                document.getElementById('university-name').value = adminData.university_name;
                document.getElementById('first-name').value = adminData.first_name;
                document.getElementById('last-name').value = adminData.last_name;
            }
        } catch (error) {
            console.error('Error fetching admin data:', error);
        }
    }

    // Function to update user details
    async function updateUserDetails(firstName, lastName) {
        const userData = {
            first_name: firstName,
            last_name: lastName
        };

        try {
            const response = await makeApiRequest(
                'http://18.117.164.164:4001/api/v1/admin/update',
                'PUT',
                userData
            );

            console.log('Update Response:', response);
            return response && response.status === 'SUCCESS';
        } catch (error) {
            console.error('Error updating user details:', error);
            return false;
        }
    }

    // Populate the fields when the page loads
    await populateAdminData();

    // Event listener for updating all fields
    document.getElementById('update-form').addEventListener('submit', async (event) => {
        event.preventDefault();

        const firstName = document.getElementById('first-name').value.trim();
        const lastName = document.getElementById('last-name').value.trim();

        const updateSuccess = await updateUserDetails(firstName, lastName);
        
        if (updateSuccess) {
            alert('Successfully Updated');
        } else {
            alert('Update failed. Please try again.');
        }
    });
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
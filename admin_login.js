// Helper function for API requests
async function makeApiRequest(url, method, data) {
    const headers = {
        'Content-Type': 'application/json',
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

// Login functionality
const loginForm = document.getElementById('login-form');
loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    // Gather login form data
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
        // Send login request to API
        const response = await makeApiRequest(
            'http://18.117.164.164:4001/api/v1/admin/login',
            'POST',
            { email, password }
        );

        if (response.status === 'SUCCESS') {
            // Store access token in localStorage for future use
            const accessToken = response.data.access_token;
            localStorage.setItem('accessToken', accessToken);

            alert('Login successful!');
            // Redirect to items.html
            window.location.href = 'admin_analytics.html'; //NEED TO CHANGE 
        }
    } catch (error) {
        console.error('Login error:', error);
        const errorElement = document.getElementById('login-error');
        errorElement.style.display = 'block'; // Show error message
    }
});

// Retrieve token for use in items.js (example function)
function getAccessToken() {
    return localStorage.getItem('accessToken');
}

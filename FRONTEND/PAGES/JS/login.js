// Include the CryptoJS library if not already included in your HTML
// <script src="https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.1.1/crypto-js.min.js"></script>

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
    const hpassword = document.getElementById('login-password').value;

    // Validate inputs
    if (!email || !hpassword) {
        alert("Please enter both email and password.");
        return; // Prevent further execution if validation fails
    }
    
    // Hash the password using SHA-1
    const password = CryptoJS.SHA1(hpassword).toString();

    try {
        // Send login request to API
        const response = await makeApiRequest(
            'http://18.117.164.164:4001/api/v1/student/login',
            'POST',
            { email, password } // Use the hashed password
        );

        if (response.status === 'SUCCESS') {
            // Store access token in localStorage for future use
            const accessToken = response.data.access_token;
            localStorage.setItem('accessToken', accessToken);

            const userId = response.data.user_id; // Extract user_id from response
            localStorage.setItem('userId', userId); // Store user_id in localStorage

            // Redirect to items.html
            window.location.href = '../HTML/items.html';
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

function getUserId() {
    return localStorage.getItem('userId');
}
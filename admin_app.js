// Helper function to make API requests
async function makeApiRequest(url, method, data, accessToken = null) {
    const headers = {
        'Content-Type': 'application/json'
    };

    if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
    }

    const response = await fetch(url, {
        method,
        headers,
        body: data ? JSON.stringify(data) : null
    });

    if (!response.ok) {
        throw new Error(`API request failed with status code ${response.status}`);
    }

    return await response.json();
}

async function populateUniversityDropdown() {
    const dropdown = document.getElementById('signup-universityname');
    try {
        console.log('Fetching universities...');
        const response = await makeApiRequest(
            'http://18.117.164.164:4001/api/v1/common/get_universities?page=1&page_size=10',
            'GET'
        );

        const universities = response.data.data;
        universities.forEach((university) => {
            const option = document.createElement('option');
            option.value = university._id;
            option.textContent = `${university.name} (${university.city}, ${university.country})`;
            dropdown.appendChild(option);
        });
        console.log('University dropdown populated.');
    } catch (error) {
        console.error('Failed to fetch universities:', error);
        alert('Unable to load universities. Please try again later.');
    }
}

// Signup functionality
const signupForm = document.getElementById('signup-form');
signupForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    console.log('Signup form submitted'); // Debugging step
    const first_name = document.getElementById('signup-firstname').value;
    const last_name = document.getElementById('signup-lastname').value;
    const email = document.getElementById('signup-email').value;
    // const university = document.getElementById('signup-universityname').value;
    const university_name = document.getElementById('signup-universityname').options[document.getElementById('signup-universityname').selectedIndex].textContent; // Selected university name
    const university_id = document.getElementById('signup-universityid').value;
    // const phone = document.getElementById('signup-phone').value;
    // const address = document.getElementById('signup-addr').value;
    const password = document.getElementById('signup-password').value;
    try {
        console.log('Sending signup API request'); // Debugging step
        // console.log(university);
        await makeApiRequest('http://18.117.164.164:4001/api/v1/admin/create', 'POST', 
            { first_name, last_name, email, 
                university_name, university_id, password });
        alert('Signup successful! Please verify your OTP to complete registration.');
        window.location.href = 'admin_send_email_verification.html'; // Replace 'otp_verification.html' with your desired webpage URL
    } catch (error) {
        console.error('Signup error:', error);
        alert('Signup failed. Please try again.');
    }
});

document.addEventListener('DOMContentLoaded', populateUniversityDropdown);


// OTP Verification functionality
const otpForm = document.getElementById('otp-form');
otpForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const otp = document.getElementById('otp-input').value;

    try {
        await makeApiRequest('http://18.117.164.164:4001/api/v1/admin/verify_otp', 'POST', { otp });
        document.getElementById('otp-container').style.display = 'none';
        document.getElementById('login-container').style.display = 'block';
    } catch (error) {
        console.error('OTP verification error:', error);
    }
});

// Login functionality
const loginForm = document.getElementById('login-form');
loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
        const { accessToken, user } = await makeApiRequest('http://18.117.164.164:4001/api/v1/admin/login', 'POST', { email, password });
        localStorage.setItem('accessToken', accessToken);
        document.getElementById('login-container').style.display = 'none';
        document.getElementById('profile-container').style.display = 'block';
        document.getElementById('profile-name').value = user.name;
        document.getElementById('profile-email').value = user.email;
    } catch (error) {
        console.error('Login error:', error);
    }
});

// Password reset functionality
const forgotPasswordLink = document.getElementById('forgot-password-link');
forgotPasswordLink.addEventListener('click', () => {
    document.getElementById('login-container').style.display = 'none';
    document.getElementById('password-reset-container').style.display = 'block';
});

const passwordResetForm = document.getElementById('password-reset-form');
passwordResetForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const email = document.getElementById('password-reset-email').value;

    try {
        await makeApiRequest('http://18.117.164.164:4001/api/v1/admin/send_otp', 'POST', { email });
    } catch (error) {
        console.error('Password reset error:', error);
    }
});

// Profile Update functionality
const profileForm = document.getElementById('profile-form');
profileForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const name = document.getElementById('profile-name').value;
    const email = document.getElementById('profile-email').value;
    const accessToken = localStorage.getItem('accessToken');

    try {
        await makeApiRequest('http://18.117.164.164:4001/api/v1/admin/update', 'PUT', { name, email }, accessToken);
    } catch (error) {
        console.error('Profile update error:', error);
    }
});

// Toggle between signup and login
const loginLink = document.getElementById('login-link');
loginLink.addEventListener('click', () => {
    document.getElementById('signup-container').style.display = 'none';
    document.getElementById('login-container').style.display = 'block';
});
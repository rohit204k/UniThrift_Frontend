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
    const university = document.getElementById('signup-universityname').options[document.getElementById('signup-universityname').selectedIndex].textContent; // Selected university name
    const university_id = document.getElementById('signup-universityid').value;
    const phone = document.getElementById('signup-phone').value;
    const address = document.getElementById('signup-addr').value;
    const hpassword = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirm-password').value;

    // Check if passwords match
    if (hpassword !== confirmPassword) {
        alert("Passwords do not match.");
        return;
    }
    // Hash the password using SHA-1
    const password = CryptoJS.SHA1(hpassword).toString();
    
    // console.log(hashedPassword);
    try {
        console.log('Sending signup API request'); // Debugging step
        // console.log(university);
        await makeApiRequest('http://18.117.164.164:4001/api/v1/student/create', 'POST', 
            { first_name, last_name, email, 
            university, university_id, phone, address, password });

        // Store the email in localStorage
        localStorage.setItem('userEmail', email);
        console.log('Email stored in localStorage');

        localStorage.setItem('userPassword', hpassword)
        
        const otpRequestBody = {
            email: email, // Using the email entered in the signup form
            verification_type: "AUTHENTICATION"
        };
    
        console.log('Sending OTP request...'); // Debugging step
        await makeApiRequest('http://18.117.164.164:4001/api/v1/student/send_otp', 'POST', otpRequestBody);

        alert('Signup successful! Please verify your OTP to complete registration.');
        // window.location.href = '../HTML/send_email_verification.html'; 
        window.location.href = '../HTML/otp_verification.html'; // Replace 'otp_verification.html' with your desired webpage URL
    } catch (error) {
        console.error('Signup error:', error);
        alert('Signup failed. Please try again.');
    }
});

document.addEventListener('DOMContentLoaded', populateUniversityDropdown);

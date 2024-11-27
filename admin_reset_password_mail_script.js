document.getElementById('send-email-btn').addEventListener('click', async () => {
    // Get the email input value
    const email = document.getElementById('email-otp').value;

    // Ensure the email field is not empty
    if (!email) {
        alert('Please enter your email.');
        return;
    }

    // Create the request payload
    const requestBody = {
        email: email,
        verification_type: "AUTHENTICATION"
    };

    try {
        console.log('Sending OTP request...'); // Debugging step

        // Make the API request
        const response = await fetch('http://18.117.164.164:4001/api/v1/admin/send_otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
        }

        const responseData = await response.json();
        console.log('OTP sent successfully:', responseData);

        // Notify the user
        alert('OTP sent successfully! Please check your email.');
        window.location.href = 'admin_reset_password.html';
    } catch (error) {
        console.error('Error sending OTP:', error);
        alert('Failed to send OTP. Please try again.');
    }
});

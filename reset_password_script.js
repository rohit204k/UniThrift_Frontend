document.getElementById('reset-password-btn').addEventListener('click', async () => {
    const email = document.getElementById('reset-email').value;
    const otp = document.getElementById('reset-input').value;
    const password = document.getElementById('reset-password').value;

    // Check if all fields are filled
    if (!email || !otp || !password) {
        alert('Please fill in all the required fields.');
        return;
    }

    try {
        const response = await fetch('http://18.117.164.164:4001/api/v1/student/verify_otp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email,
                otp,
                password,
                verification_type: 'FORGOT_PASSWORD',
            }),
        });

        if (response.ok) {
            alert('Password Reset Success!. Redirecting to Login...');
            window.location.href = 'login.html';
        } else {
            const errorData = await response.json();
            alert(`OTP Verification Failed: ${errorData.message}`);
        }
    } catch (error) {
        console.error('Error during OTP verification:', error);
        alert('An error occurred while verifying OTP. Please try again later.');
    }
});


// Function to register a new user
async function registerUser() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const response = await makeRequest(`${backendURL}/api/auth/register`, 'POST', { username, password });

    console.log(response);

    // Redirect to login page after successful registration
    if (response.status === 'SUCCESS') {
        window.location.href = 'login.html';
    }
}

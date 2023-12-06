async function loginUser() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const response = await makeRequest(`${backendURL}/api/auth/login`, 'POST', { username, password });

    console.log(response);

    if (response.status === 'SUCCESS') {
        // Redirect to main app page after successful login
        window.location.href = 'chat.html';
        sessionStorage.setItem("loginStatus", "login");
    }
}


// Mock backend URL
const backendURL = 'http://127.0.0.1:8080';

const loginNavItem = document.getElementById("login-nav-item");

if (sessionStorage.getItem("loginStatus") === "login") {
    loginNavItem.textContent = "Logout";
    loginNavItem.addEventListener("click", logout);
} else {
    loginNavItem.textContent = "Login";
    loginNavItem.addEventListener("click", () => {
        window.location.href = 'login.html';
    }); vcde
}

// Function to make a generic HTTP request
async function makeRequest(url, method, data) {
    const response = await fetch(url, {
        method: method,
        credentials: "include",
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    return response.json();
}



function logout() {
    fetch(`${backendURL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include', // Include credentials (cookies) in the request
        headers: {
            'Content-Type': 'application/json',
        },
    })
    .then(response => {
        if (response.ok) {
            console.log("Successful logout.")
        }
    })
    .catch(error => console.error('Logout failed:', error))
    .finally(() => {
        sessionStorage.removeItem('curSessionId');
        sessionStorage.removeItem('loginStatus');
        window.location.href = 'index.html';
    });
}
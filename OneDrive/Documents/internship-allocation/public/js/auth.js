// ===== AUTH UTIL =====

const TOKEN_KEY = "token";
const USER_KEY = "user";

// Get token
function getToken() {
    return localStorage.getItem(TOKEN_KEY);
}

// Get stored user
function getUser() {
    const userStr = localStorage.getItem(USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
}

// Save user
function setUser(user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
}

// Check auth
function isLoggedIn() {
    return !!getToken();
}

// Redirect if not logged in
function requireAuth() {
    if (!isLoggedIn()) {
        window.location.href = "/login";
        return false;
    }
    return true;
}

// ===== FETCH USER FROM BACKEND =====

async function fetchCurrentUser() {
    const token = getToken();

    if (!token) {
        console.error("No token found");
        return null;
    }

    try {
        const response = await fetch('/api/auth/current', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();
        console.log("API Response:", data);

        if (data.success) {
            setUser(data.user);
            return data.user;
        } else {
            console.error("API failed:", data.message);
            return null;
        }

    } catch (err) {
        console.error("Fetch error:", err);
        return null;
    }
}

// ===== PAGE LOAD LOGIC (THIS WAS MISSING) =====

document.addEventListener("DOMContentLoaded", async () => {
    console.log("Page loaded");

    if (!requireAuth()) return;

    const user = await fetchCurrentUser();

    if (user) {
        console.log("User loaded:", user);

        const nameEl = document.getElementById("username");
        if (nameEl) {
            nameEl.innerText = user.name || user.email;
        }
    } else {
        console.log("User fetch failed");
    }
});
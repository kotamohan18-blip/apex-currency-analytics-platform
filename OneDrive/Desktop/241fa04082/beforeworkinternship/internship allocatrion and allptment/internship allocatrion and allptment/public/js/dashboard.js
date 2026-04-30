// Dashboard JavaScript - Handles user data fetching and display

// API Configuration
 const API_BASE_URL = '/api';

// Check login state and redirect if not logged in
const token = localStorage.getItem('token') || sessionStorage.getItem('token');
if (!token) {
    console.log('No token found, redirecting to login...');
    window.location.href = '/login';
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Dashboard loaded, fetching user data...');
    loadUserData();
});

/**
 * Fetch user data from GET /api/user/me
 */
async function loadUserData() {
    try {
        console.log('Making API call to GET /api/profile');
        
       const response = await fetch(`${API_BASE_URL}/profile`, {
    method: "GET",
    headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token
    }
});

        console.log('Response status:', response.status);

        if (!response.ok) {
            if (response.status === 401) {
                console.error('Unauthorized - redirecting to login');
                localStorage.removeItem('token');
                sessionStorage.removeItem('token');
                window.location.href = '/login';
                return;
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('User data received:', data);

        if (data.success && data.profile) {
            displayUserData(data.profile);
            showToast('Dashboard loaded successfully!', 'success');
        } else {
            throw new Error(data.message || 'Failed to load user data');
        }

    } catch (error) {
        console.error('Error loading user data:', error);
        showToast('Error loading user data: ' + error.message, 'error');
    }
}

/**
 * Display user data in the UI
 */
function displayUserData(user) {
    console.log('Displaying user data:', user);

    // Welcome section
    const welcomeNameEl = document.getElementById('welcomeName');
    if (welcomeNameEl) {
        welcomeNameEl.textContent = user.name || 'User';
    }

    // Navbar user info
    const userNameEl = document.getElementById('userName');
    if (userNameEl) {
        userNameEl.textContent = user.name || 'User';
    }

    const userEmailEl = document.getElementById('userEmail');
    if (userEmailEl) {
        userEmailEl.textContent = user.email || 'No email';
    }

    // User details
    const userRoleEl = document.getElementById('userRole');
    if (userRoleEl) {
        userRoleEl.textContent = user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Student';
    }

    const userDepartmentEl = document.getElementById('userDepartment');
    if (userDepartmentEl) {
        userDepartmentEl.textContent = user.department || 'Not specified';
    }

    // Detail cards
    const detailEmailEl = document.getElementById('detailEmail');
    if (detailEmailEl) {
        detailEmailEl.textContent = user.email || 'Not provided';
    }

    const detailMemberSinceEl = document.getElementById('detailMemberSince');
    if (detailMemberSinceEl && user.createdAt) {
        const date = new Date(user.createdAt);
        detailMemberSinceEl.textContent = date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    } else if (detailMemberSinceEl) {
        detailMemberSinceEl.textContent = 'Not available';
    }

    // Skills
    const detailSkillsEl = document.getElementById('detailSkills');
    if (detailSkillsEl && user.skills && user.skills.length > 0) {
        detailSkillsEl.innerHTML = user.skills.map(skill => 
            `<span class="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">${skill}</span>`
        ).join('');
    } else if (detailSkillsEl) {
        detailSkillsEl.innerHTML = '<span class="text-gray-400">No skills added</span>';
    }
}

/**
 * Logout function
 */
async function logout() {
    try {
        console.log('Logging out...');
        
        const response = await fetch(`${API_BASE_URL}/auth/logout`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            credentials: 'include'
        });

        console.log('Logout response:', response.status);
        
    } catch (error) {
        console.error('Logout error:', error);
    } finally {
        // Clear tokens and redirect
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        localStorage.removeItem('isLoggedIn');
        window.location.href = '/login';
    }
}

/**
 * Show toast notification
 */
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-4 right-4 px-6 py-3 rounded-lg text-white font-medium z-50 shadow-lg';
    
    if (type === 'success') toast.classList.add('bg-green-500');
    else if (type === 'error') toast.classList.add('bg-red-500');
    else toast.classList.add('bg-blue-500');
    
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

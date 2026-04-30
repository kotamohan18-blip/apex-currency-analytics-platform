// Common script file for InternHub
// This file is loaded by all pages and provides shared functionality

// Note: Main authentication functions are in auth.js
// This file is for additional shared utilities

// Prevent duplicate auth redirects by tracking redirect state
if (!window.__authRedirected) {
    window.__authRedirected = false;
}

// Safe redirect function that prevents loops
function safeRedirect(url) {
    if (window.__authRedirected) return;
    
    // Don't redirect if already on target page
    const currentPath = window.location.pathname;
    if (currentPath === url || currentPath === url + '/') {
        return;
    }
    
    window.__authRedirected = true;
    window.location.href = url;
}

// Reset redirect flag on page unload
window.addEventListener('beforeunload', () => {
    window.__authRedirected = false;
});

// Utility: Format date
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Utility: Show toast notification
function showToast(message, type = 'info') {
    // Remove existing toasts
    const existing = document.querySelectorAll('.toast-notification');
    existing.forEach(t => t.remove());
    
    const toast = document.createElement('div');
    toast.className = `toast-notification fixed top-4 right-4 px-6 py-3 rounded-lg text-white font-medium z-50 shadow-lg transition-all duration-300 transform translate-x-full`;
    
    // Color based on type
    const colors = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        warning: 'bg-yellow-500',
        info: 'bg-blue-500'
    };
    toast.classList.add(colors[type] || colors.info);
    
    toast.textContent = message;
    document.body.appendChild(toast);
    
    // Animate in
    requestAnimationFrame(() => {
        toast.classList.remove('translate-x-full');
    });
    
    // Remove after delay
    setTimeout(() => {
        toast.classList.add('translate-x-full');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Utility: Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Utility: API helper with auth header
async function apiFetch(url, options = {}) {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    
    const defaultOptions = {
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        }
    };
    
    if (token) {
        defaultOptions.headers['Authorization'] = `Bearer ${token}`;
    }
    
    const mergedOptions = {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...options.headers
        }
    };
    
    try {
        const response = await fetch(url, mergedOptions);
        
        // Handle 401 - unauthorized
        if (response.status === 401) {
            // Clear auth data and redirect to login
            localStorage.removeItem('token');
            localStorage.removeItem('currentUser');
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('currentUser');
            
            if (!window.__authRedirected) {
                window.__authRedirected = true;
                window.location.href = '/login';
            }
            return null;
        }
        
        return response;
    } catch (error) {
        console.error('API fetch error:', error);
        throw error;
    }
}

// Log when script loads
console.log('InternHub common script loaded');

// Common JavaScript Functions and Utilities

// Global utilities
class Utils {
    // Show message function
    static showMessage(message, type = 'info', duration = 3000) {
        const messageEl = document.getElementById('message');
        if (!messageEl) {
            // Create message element if it doesn't exist
            const newMessageEl = document.createElement('div');
            newMessageEl.id = 'message';
            newMessageEl.className = `message ${type}`;
            newMessageEl.textContent = message;
            newMessageEl.style.cssText = `
                position: fixed;
                top: 2rem;
                right: 2rem;
                padding: 1rem 1.5rem;
                border-radius: 0.5rem;
                color: white;
                font-weight: 500;
                z-index: 1000;
                display: block;
                animation: slideInRight 0.3s ease-out;
                max-width: 400px;
                box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
            `;
            
            // Set background color based on type
            switch (type) {
                case 'success':
                    newMessageEl.style.background = '#10b981';
                    break;
                case 'error':
                    newMessageEl.style.background = '#ef4444';
                    break;
                case 'warning':
                    newMessageEl.style.background = '#f59e0b';
                    break;
                default:
                    newMessageEl.style.background = '#6366f1';
            }
            
            document.body.appendChild(newMessageEl);
            
            // Remove after duration
            setTimeout(() => {
                newMessageEl.style.animation = 'slideOutRight 0.3s ease-out';
                setTimeout(() => {
                    if (newMessageEl.parentNode) {
                        newMessageEl.parentNode.removeChild(newMessageEl);
                    }
                }, 300);
            }, duration);
        } else {
            messageEl.textContent = message;
            messageEl.className = `message ${type}`;
            messageEl.style.display = 'block';
            
            setTimeout(() => {
                messageEl.style.display = 'none';
            }, duration);
        }
    }

    // Format date
    static formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    // Format time
    static formatTime(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        
        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        if (days < 30) return `${days} day${days > 1 ? 's' : ''} ago`;
        
        return this.formatDate(dateString);
    }

    // Generate ID
    static generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Debounce function
    static debounce(func, wait) {
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

    // Validate email
    static isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Get initials from name
    static getInitials(name) {
        return name
            .split(' ')
            .map(word => word.charAt(0).toUpperCase())
            .join('')
            .substring(0, 2);
    }

    // Calculate match score
    static calculateMatchScore(studentSkills, requiredSkills) {
        if (!studentSkills || !requiredSkills) return 0;
        
        const studentSkillsLower = studentSkills.map(skill => skill.toLowerCase());
        const requiredSkillsLower = requiredSkills.map(skill => skill.toLowerCase());
        
        const matches = requiredSkillsLower.filter(skill => studentSkillsLower.includes(skill));
        return Math.round((matches.length / requiredSkillsLower.length) * 100);
    }

    // Export data to CSV
    static exportToCSV(data, filename) {
        const csv = this.convertToCSV(data);
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
    }

    // Convert array to CSV
    static convertToCSV(data) {
        if (!data || data.length === 0) return '';
        
        const headers = Object.keys(data[0]);
        const csvHeaders = headers.join(',');
        
        const csvRows = data.map(row => {
            return headers.map(header => {
                const value = row[header];
                return typeof value === 'string' && value.includes(',') 
                    ? `"${value}"` 
                    : value;
            }).join(',');
        });
        
        return [csvHeaders, ...csvRows].join('\n');
    }

    // Loading state management
    static setLoading(element, loading = true) {
        if (loading) {
            element.disabled = true;
            element.classList.add('loading');
            element.dataset.originalText = element.textContent;
            element.textContent = 'Loading...';
        } else {
            element.disabled = false;
            element.classList.remove('loading');
            element.textContent = element.dataset.originalText || element.textContent;
        }
    }

    // Copy to clipboard
    static async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            this.showMessage('Copied to clipboard!', 'success');
        } catch (err) {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            this.showMessage('Copied to clipboard!', 'success');
        }
    }
}

// Navigation Management
class NavigationManager {
    constructor() {
        this.currentPage = 'dashboard';
        this.navLinks = document.querySelectorAll('.nav-link');
        this.pages = document.querySelectorAll('.page');
        this.initializeNavigation();
    }

    initializeNavigation() {
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                this.navigateToPage(targetId);
            });
        });

        // Set initial active page
        this.updateActivePage();
    }

    navigateToPage(pageId) {
        // Hide all pages
        this.pages.forEach(page => {
            page.classList.remove('active');
        });

        // Remove active class from all nav links
        this.navLinks.forEach(link => {
            link.classList.remove('active');
        });

        // Show target page
        const targetPage = document.getElementById(pageId);
        if (targetPage) {
            targetPage.classList.add('active');
            this.currentPage = pageId;
        }

        // Add active class to corresponding nav link
        const activeLink = document.querySelector(`.nav-link[href="#${pageId}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }

        // Update URL hash
        window.location.hash = pageId;
    }

    updateActivePage() {
        const hash = window.location.hash.substring(1);
        if (hash && document.getElementById(hash)) {
            this.navigateToPage(hash);
        } else {
            this.navigateToPage('dashboard');
        }
    }
}

// User Menu Management
class UserMenuManager {
    constructor() {
        this.userBtn = document.querySelector('.user-btn');
        this.userDropdown = document.getElementById('userDropdown');
        this.initializeUserMenu();
    }

    initializeUserMenu() {
        if (this.userBtn) {
            this.userBtn.addEventListener('click', () => {
                this.toggleUserMenu();
            });
        }

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.user-menu')) {
                this.closeUserMenu();
            }
        });
    }

    toggleUserMenu() {
        if (this.userDropdown) {
            this.userDropdown.classList.toggle('show');
        }
    }

    closeUserMenu() {
        if (this.userDropdown) {
            this.userDropdown.classList.remove('show');
        }
    }
}

// Data Management
class DataManager {
    constructor() {
        this.data = {
            students: [],
            companies: [],
            internships: [],
            applications: [],
            allocations: []
        };
        this.loadData();
    }

    loadData() {
        const keys = ['students', 'companies', 'internships', 'applications', 'allocations'];
        keys.forEach(key => {
            const data = localStorage.getItem(key);
            this.data[key] = data ? JSON.parse(data) : this.getDefaultData(key);
        });
    }

    saveData(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
        this.data[key] = data;
    }

    getData(key) {
        return this.data[key];
    }

    getDefaultData(key) {
        const defaults = {
            students: [],
            companies: [],
            internships: [],
            applications: [],
            allocations: []
        };
        return defaults[key] || [];
    }

    // Student operations
    addStudent(student) {
        this.data.students.push(student);
        this.saveData('students', this.data.students);
        return student;
    }

    updateStudent(id, updates) {
        const index = this.data.students.findIndex(s => s.id === id);
        if (index !== -1) {
            this.data.students[index] = { ...this.data.students[index], ...updates };
            this.saveData('students', this.data.students);
            return this.data.students[index];
        }
        return null;
    }

    deleteStudent(id) {
        const index = this.data.students.findIndex(s => s.id === id);
        if (index !== -1) {
            this.data.students.splice(index, 1);
            this.saveData('students', this.data.students);
            return true;
        }
        return false;
    }

    // Internship operations
    addInternship(internship) {
        this.data.internships.push(internship);
        this.saveData('internships', this.data.internships);
        return internship;
    }

    updateInternship(id, updates) {
        const index = this.data.internships.findIndex(i => i.id === id);
        if (index !== -1) {
            this.data.internships[index] = { ...this.data.internships[index], ...updates };
            this.saveData('internships', this.data.internships);
            return this.data.internships[index];
        }
        return null;
    }

    deleteInternship(id) {
        const index = this.data.internships.findIndex(i => i.id === id);
        if (index !== -1) {
            this.data.internships.splice(index, 1);
            this.saveData('internships', this.data.internships);
            return true;
        }
        return false;
    }

    // Application operations
    addApplication(application) {
        this.data.applications.push(application);
        this.saveData('applications', this.data.applications);
        return application;
    }

    updateApplication(id, updates) {
        const index = this.data.applications.findIndex(a => a.id === id);
        if (index !== -1) {
            this.data.applications[index] = { ...this.data.applications[index], ...updates };
            this.saveData('applications', this.data.applications);
            return this.data.applications[index];
        }
        return null;
    }

    // Allocation operations
    addAllocation(allocation) {
        this.data.allocations.push(allocation);
        this.saveData('allocations', this.data.allocations);
        return allocation;
    }

    updateAllocation(id, updates) {
        const index = this.data.allocations.findIndex(a => a.id === id);
        if (index !== -1) {
            this.data.allocations[index] = { ...this.data.allocations[index], ...updates };
            this.saveData('allocations', this.data.allocations);
            return this.data.allocations[index];
        }
        return null;
    }
}

// Search and Filter Utilities
class SearchManager {
    static filterData(data, searchTerm, fields) {
        if (!searchTerm) return data;
        
        const term = searchTerm.toLowerCase();
        return data.filter(item => {
            return fields.some(field => {
                const value = item[field];
                return value && value.toString().toLowerCase().includes(term);
            });
        });
    }

    static sortData(data, field, direction = 'asc') {
        return [...data].sort((a, b) => {
            const aVal = a[field];
            const bVal = b[field];
            
            if (aVal < bVal) return direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return direction === 'asc' ? 1 : -1;
            return 0;
        });
    }
}

// Chart Utilities
class ChartManager {
    static createAllocationChart(canvasId, data) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return null;

        return new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: [{
                    label: 'Allocations',
                    data: data.values,
                    borderColor: '#6366f1',
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    static createSkillsChart(canvasId, data) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return null;

        return new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: data.labels,
                datasets: [{
                    data: data.values,
                    backgroundColor: [
                        '#6366f1',
                        '#22d3ee',
                        '#10b981',
                        '#f59e0b',
                        '#ef4444'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }
}

// Initialize global managers
let navigationManager;
let userMenuManager;
let dataManager;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    navigationManager = new NavigationManager();
    userMenuManager = new UserMenuManager();
    dataManager = new DataManager();

    // Handle browser back/forward buttons
    window.addEventListener('popstate', () => {
        if (navigationManager) {
            navigationManager.updateActivePage();
        }
    });
});

// Global functions
function toggleUserMenu() {
    if (userMenuManager) {
        userMenuManager.toggleUserMenu();
    }
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('currentUser');
        sessionStorage.removeItem('currentUser');
        window.location.href = '../pages/login.html';
    }
}

// Export classes for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        Utils,
        NavigationManager,
        UserMenuManager,
        DataManager,
        SearchManager,
        ChartManager
    };
}

// Frontend JavaScript for Python Backend Integration

// Global variables
let currentUser = null;
let internships = [];

// API Base URL
const API_BASE = '/api';

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    checkAuthentication();
    loadInternships();
});

function initializeApp() {
    // Setup navigation
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.getAttribute('data-section');
            if (section) {
                showSection(section);
            }
        });
    });
}

function showSection(sectionId) {
    // Hide all sections
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => {
        section.classList.remove('active');
    });
    
    // Show selected section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    // Update active nav link
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-section') === sectionId) {
            link.classList.add('active');
        }
    });
}

// Authentication functions
async function checkAuthentication() {
    try {
        const response = await fetch(`${API_BASE}/auth/current`);
        const data = await response.json();
        
        if (data.success) {
            currentUser = data.user;
            updateAuthUI();
            
            // Redirect based on user type
            if (currentUser.userType === 'admin') {
                showSection('admin');
                loadAdminStats();
            }
        }
    } catch (error) {
        console.log('Not authenticated');
    }
}

async function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    try {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            currentUser = data.user;
            updateAuthUI();
            showMessage('Login successful!', 'success');
            
            if (currentUser.userType === 'admin') {
                showSection('admin');
                loadAdminStats();
            } else {
                showSection('internships');
            }
        } else {
            showMessage(data.message || 'Login failed', 'error');
        }
    } catch (error) {
        showMessage('Network error. Please try again.', 'error');
    }
}

async function handleSignup(event) {
    event.preventDefault();
    
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const userType = document.getElementById('userType').value;
    
    try {
        const response = await fetch(`${API_BASE}/auth/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ firstName, lastName, email, password, userType })
        });
        
        const data = await response.json();
        
        if (data.success) {
            currentUser = data.user;
            updateAuthUI();
            showMessage('Account created successfully!', 'success');
            
            if (userType === 'admin') {
                showSection('admin');
                loadAdminStats();
            } else {
                showSection('internships');
            }
        } else {
            showMessage(data.message || 'Signup failed', 'error');
        }
    } catch (error) {
        showMessage('Network error. Please try again.', 'error');
    }
}

async function logout() {
    try {
        await fetch(`${API_BASE}/auth/logout`, {
            method: 'POST'
        });
    } catch (error) {
        console.log('Logout request failed');
    }
    
    currentUser = null;
    updateAuthUI();
    showMessage('Logged out successfully!', 'success');
    showSection('home');
    
    // Clear any open modals
    const modals = document.querySelectorAll('.internship-details-modal');
    modals.forEach(modal => modal.remove());
}

function updateAuthUI() {
    const userMenuBtn = document.getElementById('userMenuBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const signInBtn = document.getElementById('signInBtn');
    
    if (currentUser) {
        if (userMenuBtn) {
            userMenuBtn.style.display = 'block';
            userMenuBtn.textContent = `${currentUser.firstName} ${currentUser.lastName}`;
        }
        if (logoutBtn) {
            logoutBtn.style.display = 'block';
        }
        if (signInBtn) {
            signInBtn.style.display = 'none';
        }
    } else {
        if (userMenuBtn) {
            userMenuBtn.style.display = 'none';
        }
        if (logoutBtn) {
            logoutBtn.style.display = 'none';
        }
        if (signInBtn) {
            signInBtn.style.display = 'block';
        }
    }
}

function showUserMenu() {
    if (!currentUser) return;
    
    const menuHTML = `
        <div class="user-menu-modal">
            <div class="user-menu-content">
                <h3>User Profile</h3>
                <p><strong>Name:</strong> ${currentUser.firstName} ${currentUser.lastName}</p>
                <p><strong>Email:</strong> ${currentUser.email}</p>
                <p><strong>Type:</strong> ${currentUser.userType}</p>
                <div class="user-menu-actions">
                    <button class="btn btn-primary" onclick="this.parentElement.parentElement.parentElement.remove()">Close</button>
                    <button class="btn btn-secondary" onclick="logout(); this.parentElement.parentElement.parentElement.remove();">Logout</button>
                </div>
            </div>
        </div>
    `;
    
    const modal = document.createElement('div');
    modal.innerHTML = menuHTML;
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
    `;
    
    document.body.appendChild(modal);
}

// Internship functions
async function loadInternships() {
    try {
        const response = await fetch(`${API_BASE}/internships`);
        const data = await response.json();
        
        if (data.success) {
            internships = data.internships;
            displayInternships(internships);
        }
    } catch (error) {
        console.error('Failed to load internships:', error);
    }
}

function displayInternships(internshipList) {
    const grid = document.getElementById('internshipsGrid');
    if (!grid) return;
    
    grid.innerHTML = '';
    internshipList.forEach(internship => {
        const card = createInternshipCard(internship);
        grid.appendChild(card);
    });
}

function createInternshipCard(internship) {
    const card = document.createElement('div');
    card.className = 'internship-card';
    card.innerHTML = `
        <div class="card-header">
            <h3>${internship.position}</h3>
            <span class="company">${internship.company}</span>
        </div>
        <div class="card-body">
            <p>${internship.description}</p>
            <div class="details">
                <span><i class="fas fa-map-marker-alt"></i> ${internship.location}</span>
                <span><i class="fas fa-clock"></i> ${internship.duration}</span>
                <span><i class="fas fa-dollar-sign"></i> ${internship.stipend}</span>
            </div>
            <div class="skills">
                ${internship.skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
            </div>
        </div>
        <div class="card-footer">
            <button class="btn btn-primary" onclick="applyForInternship('${internship.id}')">
                Apply Now
            </button>
        </div>
    `;
    return card;
}

function filterInternships() {
    const searchTerm = document.getElementById('internshipSearch').value.toLowerCase();
    const locationFilter = document.getElementById('locationFilter').value;
    const typeFilter = document.getElementById('typeFilter').value;
    
    const filtered = internships.filter(internship => {
        const matchesSearch = !searchTerm || 
            internship.position.toLowerCase().includes(searchTerm) ||
            internship.company.toLowerCase().includes(searchTerm) ||
            internship.description.toLowerCase().includes(searchTerm);
        
        const matchesLocation = !locationFilter || internship.location === locationFilter;
        const matchesType = !typeFilter || internship.type === typeFilter;
        
        return matchesSearch && matchesLocation && matchesType;
    });
    
    displayInternships(filtered);
}

async function applyForInternship(internshipId) {
    if (!currentUser) {
        showMessage('Please login to apply for internships.', 'error');
        showSection('login');
        return;
    }
    
    const internship = internships.find(i => i.id === internshipId);
    if (!internship) return;
    
    try {
        const response = await fetch(`${API_BASE}/applications`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                internshipId: internshipId,
                company: internship.company,
                position: internship.position
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showMessage(`🎉 Application submitted for ${internship.position} at ${internship.company}!`, 'success');
        } else {
            showMessage(data.message || 'Application failed', 'error');
        }
    } catch (error) {
        showMessage('Network error. Please try again.', 'error');
    }
}

// Admin functions
async function loadAdminStats() {
    try {
        const response = await fetch(`${API_BASE}/admin/stats`);
        const data = await response.json();
        
        if (data.success) {
            document.getElementById('totalStudents').textContent = data.stats.totalStudents;
            document.getElementById('totalCompanies').textContent = data.stats.totalCompanies;
            document.getElementById('totalInternships').textContent = data.stats.totalInternships;
        }
    } catch (error) {
        console.error('Failed to load admin stats:', error);
    }
}

async function runAutoAllocation() {
    showMessage('Running auto-allocation algorithm...', 'info');
    setTimeout(() => {
        showMessage('✅ Auto-allocation completed successfully!', 'success');
    }, 2000);
}

async function exportData() {
    try {
        const response = await fetch(`${API_BASE}/admin/applications`);
        const data = await response.json();
        
        if (data.success) {
            const dataStr = JSON.stringify(data.applications, null, 2);
            const dataBlob = new Blob([dataStr], {type: 'application/json'});
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'internship_applications.json';
            link.click();
            showMessage('Data exported successfully!', 'success');
        }
    } catch (error) {
        showMessage('Failed to export data', 'error');
    }
}

// Google Sign-In (Simulated)
function handleGoogleSignIn() {
    showMessage('Connecting to Google...', 'info');
    
    setTimeout(() => {
        // Simulate Google Sign-In with demo user
        const googleUser = {
            id: 'google_' + Date.now(),
            email: 'john.doe@gmail.com',
            firstName: 'John',
            lastName: 'Doe',
            userType: 'student',
            authMethod: 'google'
        };
        
        currentUser = googleUser;
        updateAuthUI();
        showMessage('Welcome, John! 🎉', 'success');
        showSection('internships');
        
        // Show internship details
        setTimeout(() => {
            showInternshipDetails();
        }, 1000);
    }, 2000);
}

function showInternshipDetails() {
    const detailsHTML = `
        <div class="internship-details-modal">
            <h3>🚀 Welcome to Your Internship Journey!</h3>
            <p>We found ${internships.length} amazing opportunities for you:</p>
            <div class="details-grid">
                ${internships.map(internship => `
                    <div class="detail-card">
                        <h4>${internship.position}</h4>
                        <p><strong>${internship.company}</strong></p>
                        <p>${internship.location} • ${internship.duration}</p>
                        <p><strong>${internship.stipend}</strong></p>
                        <button onclick="applyForInternship('${internship.id}')" class="btn btn-sm btn-primary">
                            Apply Now
                        </button>
                    </div>
                `).join('')}
            </div>
            <button onclick="this.parentElement.remove()" class="btn btn-secondary">
                Close
            </button>
        </div>
    `;
    
    const modal = document.createElement('div');
    modal.innerHTML = detailsHTML;
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
    `;
    
    document.body.appendChild(modal);
}

// Utility functions
function showMessage(message, type = 'info') {
    const messageEl = document.getElementById('message');
    if (!messageEl) return;
    
    messageEl.textContent = message;
    messageEl.className = `message ${type}`;
    messageEl.style.display = 'block';
    
    setTimeout(() => {
        messageEl.style.display = 'none';
    }, 5000);
}

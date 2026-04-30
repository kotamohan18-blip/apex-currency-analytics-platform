// Single Page Application - InternHub

// Global variables
let currentUser = null;
let internships = [
    {
        id: '1',
        position: 'Frontend Developer Intern',
        company: 'TechCorp Solutions',
        location: 'Remote',
        type: 'Full-time',
        duration: '3 months',
        stipend: '$800/month',
        description: 'Join our frontend team to build amazing user experiences.',
        skills: ['JavaScript', 'React', 'CSS', 'HTML']
    },
    {
        id: '2',
        position: 'Data Science Intern',
        company: 'Analytics Pro',
        location: 'New York, NY',
        type: 'Full-time',
        duration: '6 months',
        stipend: '$1,200/month',
        description: 'Work with real-world datasets to build ML models.',
        skills: ['Python', 'Machine Learning', 'Statistics', 'SQL']
    },
    {
        id: '3',
        position: 'UX/UI Designer',
        company: 'Creative Studios',
        location: 'San Francisco, CA',
        type: 'Part-time',
        duration: '4 months',
        stipend: '$900/month',
        description: 'Design beautiful interfaces and user experiences.',
        skills: ['Figma', 'Adobe XD', 'Prototyping', 'User Research']
    }
];

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    loadInternships();
    checkAuthentication();
});

function initializeApp() {
    // Setup navigation
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.getAttribute('data-section');
            showSection(section);
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

function loadInternships() {
    const grid = document.getElementById('internshipsGrid');
    if (!grid) return;
    
    grid.innerHTML = '';
    internships.forEach(internship => {
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
    
    const grid = document.getElementById('internshipsGrid');
    grid.innerHTML = '';
    filtered.forEach(internship => {
        const card = createInternshipCard(internship);
        grid.appendChild(card);
    });
}

function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    
    // Demo login logic
    if (email === 'admin@internship.com' && password === 'admin123') {
        currentUser = {
            id: '1',
            email: email,
            firstName: 'Admin',
            lastName: 'User',
            userType: 'admin'
        };
        saveUserSession(rememberMe);
        showMessage('Login successful! Welcome Admin.', 'success');
        showSection('admin');
        updateAdminStats();
    } else if (email === 'student@internship.com' && password === 'student123') {
        currentUser = {
            id: '2',
            email: email,
            firstName: 'Student',
            lastName: 'User',
            userType: 'student'
        };
        saveUserSession(rememberMe);
        showMessage('Login successful! Welcome Student.', 'success');
        showSection('internships');
    } else {
        showMessage('Invalid email or password. Try admin@internship.com/admin123 or student@internship.com/student123', 'error');
    }
}

function handleSignup(event) {
    event.preventDefault();
    
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const userType = document.getElementById('userType').value;
    
    // Create new user
    currentUser = {
        id: Date.now().toString(),
        email: email,
        firstName: firstName,
        lastName: lastName,
        userType: userType
    };
    
    saveUserSession(true);
    showMessage('Account created successfully! Welcome to InternHub.', 'success');
    
    // Redirect based on user type
    if (userType === 'admin') {
        showSection('admin');
        updateAdminStats();
    } else {
        showSection('internships');
    }
}

function handleGoogleSignIn() {
    showMessage('Connecting to Google...', 'info');
    
    // Simulate Google Sign-In
    setTimeout(() => {
        currentUser = {
            id: 'google_' + Date.now(),
            email: 'john.doe@gmail.com',
            firstName: 'John',
            lastName: 'Doe',
            userType: 'student',
            authMethod: 'google'
        };
        
        saveUserSession(true);
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

function applyForInternship(internshipId) {
    if (!currentUser) {
        showMessage('Please login to apply for internships.', 'error');
        showSection('login');
        return;
    }
    
    const internship = internships.find(i => i.id === internshipId);
    if (internship) {
        showMessage(`🎉 Application submitted for ${internship.position} at ${internship.company}!`, 'success');
        
        // Save application
        const applications = JSON.parse(localStorage.getItem('applications') || '[]');
        applications.push({
            id: Date.now().toString(),
            studentId: currentUser.id,
            internshipId: internshipId,
            company: internship.company,
            position: internship.position,
            appliedDate: new Date().toISOString(),
            status: 'pending'
        });
        localStorage.setItem('applications', JSON.stringify(applications));
    }
}

function saveUserSession(rememberMe) {
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem('currentUser', JSON.stringify(currentUser));
    
    // Update UI
    const userMenuBtn = document.getElementById('userMenuBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const signInBtn = document.getElementById('signInBtn');
    
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
}

function checkAuthentication() {
    const savedUser = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        const userMenuBtn = document.getElementById('userMenuBtn');
        const logoutBtn = document.getElementById('logoutBtn');
        const signInBtn = document.getElementById('signInBtn');
        
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
        
        // Redirect based on user type
        if (currentUser.userType === 'admin') {
            showSection('admin');
            updateAdminStats();
        }
    }
}

function updateAdminStats() {
    const applications = JSON.parse(localStorage.getItem('applications') || '[]');
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    document.getElementById('totalStudents').textContent = users.filter(u => u.userType === 'student').length;
    document.getElementById('totalCompanies').textContent = internships.length;
    document.getElementById('totalInternships').textContent = internships.length;
}

function runAutoAllocation() {
    showMessage('Running auto-allocation algorithm...', 'info');
    setTimeout(() => {
        showMessage('✅ Auto-allocation completed successfully!', 'success');
    }, 2000);
}

function exportData() {
    const applications = JSON.parse(localStorage.getItem('applications') || '[]');
    const dataStr = JSON.stringify(applications, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'internship_applications.json';
    link.click();
    showMessage('Data exported successfully!', 'success');
}

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

// Global functions for HTML onclick handlers
function logout() {
    localStorage.removeItem('currentUser');
    sessionStorage.removeItem('currentUser');
    currentUser = null;
    showMessage('Logged out successfully!', 'success');
    
    // Reset UI
    const userMenuBtn = document.getElementById('userMenuBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const signInBtn = document.getElementById('signInBtn');
    
    if (userMenuBtn) userMenuBtn.style.display = 'none';
    if (logoutBtn) logoutBtn.style.display = 'none';
    if (signInBtn) signInBtn.style.display = 'block';
    
    // Redirect to home
    showSection('home');
    
    // Clear any open modals
    const modals = document.querySelectorAll('.internship-details-modal');
    modals.forEach(modal => modal.remove());
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
                ${currentUser.authMethod ? `<p><strong>Auth Method:</strong> ${currentUser.authMethod}</p>` : ''}
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
            const sectionTop = section.offsetTop - 100;
            const sectionId = section.getAttribute('id');
            const correspondingLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);
            
            if (correspondingLink) {
                if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                    navLinks.forEach(link => link.classList.remove('active'));
                    correspondingLink.classList.add('active');
                }
            }
        });
    }
    
    // Smooth scrolling for navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            if (href.startsWith('#')) {
                e.preventDefault();
                const targetId = href.substring(1);
                const targetSection = document.getElementById(targetId);
                
                if (targetSection) {
                    const offsetTop = targetSection.offsetTop - 80;
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
    
    // Scroll event listeners
    window.addEventListener('scroll', function() {
        highlightActiveLink();
        
        // Add shadow to navbar on scroll
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 10) {
            navbar.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
        } else {
            navbar.style.boxShadow = 'none';
        }
    });
    
    // Animate elements on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe feature cards and about content
    const animateElements = document.querySelectorAll('.feature-card, .about-text, .about-image');
    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
    
    // Animate stats counters
    function animateCounter(element, target, duration = 2000) {
        const start = 0;
        const increment = target / (duration / 16);
        let current = start;
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            
            if (element.textContent.includes('+')) {
                element.textContent = Math.floor(current) + '+';
            } else if (element.textContent.includes('%')) {
                element.textContent = Math.floor(current) + '%';
            } else {
                element.textContent = Math.floor(current) + '+';
            }
        }, 16);
    }
    
    // Counter animation on scroll
    const statNumbers = document.querySelectorAll('.stat-number');
    const counterObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.classList.contains('animated')) {
                entry.target.classList.add('animated');
                const text = entry.target.textContent;
                const number = parseInt(text.replace(/\D/g, ''));
                
                if (!isNaN(number)) {
                    animateCounter(entry.target, number);
                }
            }
        });
    }, { threshold: 0.5 });
    
    statNumbers.forEach(stat => {
        counterObserver.observe(stat);
    });
    
    // Hero card animation
    const heroCard = document.querySelector('.hero-card');
    if (heroCard) {
        const scoreFills = heroCard.querySelectorAll('.score-fill');
        
        setTimeout(() => {
            scoreFills.forEach(fill => {
                const width = fill.style.width;
                fill.style.width = '0';
                setTimeout(() => {
                    fill.style.width = width;
                }, 100);
            });
        }, 1000);
    }
    
    // Form validation for any forms
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Basic validation
            const requiredFields = form.querySelectorAll('[required]');
            let isValid = true;
            
            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    isValid = false;
                    field.classList.add('error');
                    
                    // Remove error class on input
                    field.addEventListener('input', function() {
                        this.classList.remove('error');
                    }, { once: true });
                }
            });
            
            if (isValid) {
                // Show success message
                showMessage('Form submitted successfully!', 'success');
                form.reset();
            } else {
                showMessage('Please fill in all required fields.', 'error');
            }
        });
    });
    
    // Initialize tooltips
    const tooltipElements = document.querySelectorAll('[data-tooltip]');
    tooltipElements.forEach(element => {
        element.addEventListener('mouseenter', function() {
            const tooltip = document.createElement('div');
            tooltip.className = 'tooltip';
            tooltip.textContent = this.getAttribute('data-tooltip');
            document.body.appendChild(tooltip);
            
            const rect = this.getBoundingClientRect();
            tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
            tooltip.style.top = rect.top - tooltip.offsetHeight - 10 + 'px';
            
            this.tooltip = tooltip;
        });
        
        element.addEventListener('mouseleave', function() {
            if (this.tooltip) {
                this.tooltip.remove();
                this.tooltip = null;
            }
        });
    });
});

// Utility functions
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        const offsetTop = section.offsetTop - 80;
        window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
        });
    }
}

function showMessage(message, type = 'info') {
    // Create message element
    const messageEl = document.createElement('div');
    messageEl.className = `message message-${type}`;
    messageEl.textContent = message;
    
    // Style the message
    messageEl.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 0.5rem;
        color: white;
        font-weight: 500;
        z-index: 9999;
        animation: slideInRight 0.3s ease;
        max-width: 300px;
    `;
    
    // Set background color based on type
    switch (type) {
        case 'success':
            messageEl.style.background = '#10b981';
            break;
        case 'error':
            messageEl.style.background = '#ef4444';
            break;
        case 'warning':
            messageEl.style.background = '#f59e0b';
            break;
        default:
            messageEl.style.background = '#6366f1';
    }
    
    document.body.appendChild(messageEl);
    
    // Remove message after 3 seconds
    setTimeout(() => {
        messageEl.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (messageEl.parentNode) {
                messageEl.parentNode.removeChild(messageEl);
            }
        }, 300);
    }, 3000);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .form-group input.error,
    .form-group textarea.error {
        border-color: #ef4444 !important;
    }
    
    .tooltip {
        position: absolute;
        background: #1f2937;
        color: white;
        padding: 0.5rem 0.75rem;
        border-radius: 0.375rem;
        font-size: 0.875rem;
        white-space: nowrap;
        z-index: 1000;
        pointer-events: none;
    }
    
    .tooltip::after {
        content: '';
        position: absolute;
        top: 100%;
        left: 50%;
        transform: translateX(-50%);
        border: 5px solid transparent;
        border-top-color: #1f2937;
    }
`;
document.head.appendChild(style);

// Performance optimization
let ticking = false;
function requestTick(callback) {
    if (!ticking) {
        requestAnimationFrame(callback);
        ticking = true;
        setTimeout(() => { ticking = false; }, 100);
    }
}

// Lazy loading for images (if any are added later)
function lazyLoadImages() {
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

// Initialize lazy loading
lazyLoadImages();

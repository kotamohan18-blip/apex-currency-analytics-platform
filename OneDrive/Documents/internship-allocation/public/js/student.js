    // Student Dashboard JavaScript
    class StudentDashboard {
        constructor() {
            this.authSystem = new AuthSystem();
            this.currentUser = null;
            this.internships = [];
            this.applications = [];
            this.initializeDashboard();
        }

        initializeDashboard() {
            // Check authentication
            if (!this.authSystem.isStudent()) {
                window.location.href = 'login.html';
                return;
            }

            // Get current user
            this.currentUser = this.authSystem.getCurrentUser();
            
            // Load data
            this.loadData();
            
            // Setup navigation
            this.setupNavigation();
            
            // Setup form listeners
            this.setupFormListeners();
            
            // Render initial data
            this.renderProfile();
            this.renderInternships();
            this.renderApplications();
            this.renderAllocation();
            
            // Update user info
            this.updateUserInfo();
        }

        loadData() {
            // Load internships
            const savedInternships = localStorage.getItem('internships');
            this.internships = savedInternships ? JSON.parse(savedInternships) : this.getDefaultInternships();
            
            // Load student applications
            this.applications = this.currentUser.applications || [];
            
            // Load allocation
            this.allocation = this.currentUser.allocation;
        }

        getDefaultInternships() {
            return [
                {
                    id: 1,
                    company: "TechCorp Solutions",
                    position: "Frontend Developer Intern",
                    requiredSkills: ["JavaScript", "React", "CSS", "HTML"],
                    duration: "6 months",
                    availableSlots: 2,
                    allocatedSlots: 0
                },
                {
                    id: 2,
                    company: "DataScience Inc",
                    position: "Machine Learning Intern",
                    requiredSkills: ["Python", "TensorFlow", "Machine Learning"],
                    duration: "3 months",
                    availableSlots: 1,
                    allocatedSlots: 0
                },
                {
                    id: 3,
                    company: "CloudTech Systems",
                    position: "Cloud DevOps Intern",
                    requiredSkills: ["AWS", "Docker", "Python", "Linux"],
                    duration: "6 months",
                    availableSlots: 1,
                    allocatedSlots: 0
                },
                {
                    id: 4,
                    company: "WebDesign Studio",
                    position: "UI/UX Design Intern",
                    requiredSkills: ["HTML", "CSS", "JavaScript", "Design Principles"],
                    duration: "3 months",
                    availableSlots: 2,
                    allocatedSlots: 0
                }
            ];
        }

        setupNavigation() {
            const navLinks = document.querySelectorAll('.nav-link');
            navLinks.forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const targetPage = link.dataset.page;
                    this.showPage(targetPage);
                    
                    // Update active nav
                    navLinks.forEach(l => l.classList.remove('active'));
                    link.classList.add('active');
                });
            });
        }

        setupFormListeners() {
            // Edit profile form
            const editProfileForm = document.getElementById('editProfileForm');
            if (editProfileForm) {
                editProfileForm.addEventListener('submit', (e) => this.handleProfileUpdate(e));
            }

            // Application form
            const applicationForm = document.getElementById('applicationForm');
            if (applicationForm) {
                applicationForm.addEventListener('submit', (e) => this.handleApplicationSubmit(e));
            }
        }

        showPage(pageName) {
            const pages = document.querySelectorAll('.page');
            pages.forEach(page => page.classList.remove('active'));
            
            const targetPage = document.getElementById(pageName);
            if (targetPage) {
                targetPage.classList.add('active');
            }
        }

        updateUserInfo() {
            const studentNameEl = document.getElementById('studentName');
            if (studentNameEl && this.currentUser) {
                studentNameEl.textContent = this.currentUser.fullName;
            }
        }

        // Profile Page
        renderProfile() {
            if (!this.currentUser) return;

            // Update profile information
            document.getElementById('profileName').textContent = this.currentUser.fullName;
            document.getElementById('profileEmail').textContent = this.currentUser.email;
            document.getElementById('profileStudentId').textContent = `ID: ${this.currentUser.studentId || 'N/A'}`;
            
            // Update avatar initial
            const initial = this.currentUser.fullName.charAt(0).toUpperCase();
            document.getElementById('avatarInitial').textContent = initial;
            
            // Update skills
            const skillsContainer = document.getElementById('profileSkills');
            if (skillsContainer) {
                const skills = this.currentUser.skills || [];
                skillsContainer.innerHTML = skills.map(skill => 
                    `<span class="skill-tag">${skill}</span>`
                ).join('');
            }
            
            // Update preferences
            const preferencesContainer = document.getElementById('profilePreferences');
            if (preferencesContainer) {
                const preferences = this.currentUser.preferences || [];
                preferencesContainer.innerHTML = preferences.map(pref => 
                    `<span class="skill-tag">${pref}</span>`
                ).join('');
            }
            
            // Update account info
            const registrationDate = this.currentUser.createdAt ? 
                new Date(this.currentUser.createdAt).toLocaleDateString() : 'N/A';
            document.getElementById('registrationDate').textContent = registrationDate;
            
            const lastUpdated = this.currentUser.lastUpdated ? 
                new Date(this.currentUser.lastUpdated).toLocaleDateString() : 'N/A';
            document.getElementById('lastUpdated').textContent = lastUpdated;
        }

        editProfile() {
            // Populate edit form
            document.getElementById('editName').value = this.currentUser.fullName;
            document.getElementById('editEmail').value = this.currentUser.email;
            document.getElementById('editSkills').value = (this.currentUser.skills || []).join(', ');
            document.getElementById('editPreferences').value = (this.currentUser.preferences || []).join(', ');
            
            this.showModal('editProfileModal');
        }

        handleProfileUpdate(e) {
            e.preventDefault();
            
            // Update user data
            this.currentUser.fullName = document.getElementById('editName').value;
            this.currentUser.email = document.getElementById('editEmail').value;
            this.currentUser.skills = document.getElementById('editSkills').value
                .split(',').map(s => s.trim()).filter(s => s);
            this.currentUser.preferences = document.getElementById('editPreferences').value
                .split(',').map(p => p.trim()).filter(p => p);
            this.currentUser.lastUpdated = new Date().toISOString();
            
            // Save to localStorage
            this.saveCurrentUser();
            
            // Update UI
            this.renderProfile();
            this.closeModal('editProfileModal');
            this.showMessage('Profile updated successfully!', 'success');
        }

        // Internships Page
        renderInternships() {
            const grid = document.getElementById('internshipsGrid');
            if (!grid) return;

            grid.innerHTML = '';
            
            // Filter available internships
            const availableInternships = this.internships.filter(i => i.allocatedSlots < i.availableSlots);
            
            availableInternships.forEach(internship => {
                const matchScore = this.calculateMatchScore(internship);
                const hasApplied = this.applications.some(app => app.internshipId === internship.id);
                
                const card = document.createElement('div');
                card.className = 'internship-card';
                card.innerHTML = `
                    <div class="internship-header">
                        <h3>${internship.position}</h3>
                        <p>${internship.company}</p>
                    </div>
                    <div class="internship-details">
                        <div class="internship-meta">
                            <span>Duration: ${internship.duration}</span>
                            <span>Slots: ${internship.availableSlots - internship.allocatedSlots}/${internship.availableSlots}</span>
                        </div>
                        <div class="internship-skills">
                            <strong>Required Skills:</strong>
                            <div>${internship.requiredSkills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}</div>
                        </div>
                        <div class="match-badge ${matchScore >= 70 ? 'high' : matchScore >= 40 ? 'medium' : ''}">
                            Match Score: ${matchScore}%
                        </div>
                    </div>
                    <div class="internship-actions">
                        ${hasApplied ? 
                            `<button class="btn btn-secondary" disabled>Applied</button>` :
                            `<button class="btn btn-primary" onclick="studentDashboard.applyForInternship(${internship.id})">Apply Now</button>`
                        }
                    </div>
                `;
                grid.appendChild(card);
            });

            // Update skill filter
            this.updateSkillFilter();
        }

        calculateMatchScore(internship) {
            if (!this.currentUser.skills || this.currentUser.skills.length === 0) {
                return 0;
            }

            const matchingSkills = this.currentUser.skills.filter(skill => 
                internship.requiredSkills.some(req => 
                    req.toLowerCase().includes(skill.toLowerCase()) || 
                    skill.toLowerCase().includes(req.toLowerCase())
                )
            );

            return Math.round((matchingSkills.length / internship.requiredSkills.length) * 100);
        }

        updateSkillFilter() {
            const skillFilter = document.getElementById('skillFilter');
            if (!skillFilter) return;

            // Get all unique skills from internships
            const allSkills = new Set();
            this.internships.forEach(internship => {
                internship.requiredSkills.forEach(skill => allSkills.add(skill));
            });

            // Clear existing options (except the first one)
            skillFilter.innerHTML = '<option value="">All Skills</option>';
            
            // Add skill options
            Array.from(allSkills).sort().forEach(skill => {
                const option = document.createElement('option');
                option.value = skill;
                option.textContent = skill;
                skillFilter.appendChild(option);
            });
        }

        applyForInternship(internshipId) {
            const internship = this.internships.find(i => i.id === internshipId);
            if (!internship) return;

            // Check if already applied
            if (this.applications.some(app => app.internshipId === internshipId)) {
                this.showMessage('You have already applied for this internship!', 'error');
                return;
            }

            // Show application modal
            this.showApplicationModal(internship);
        }

        showApplicationModal(internship) {
            const modal = document.getElementById('applicationModal');
            const details = document.getElementById('applicationDetails');
            
            details.innerHTML = `
                <div class="internship-summary">
                    <h4>${internship.position}</h4>
                    <p><strong>Company:</strong> ${internship.company}</p>
                    <p><strong>Duration:</strong> ${internship.duration}</p>
                    <p><strong>Required Skills:</strong> ${internship.requiredSkills.join(', ')}</p>
                    <p><strong>Match Score:</strong> ${this.calculateMatchScore(internship)}%</p>
                </div>
            `;
            
            // Store current internship ID
            this.currentApplicationInternshipId = internship.id;
            
            this.showModal('applicationModal');
        }

        handleApplicationSubmit(e) {
            e.preventDefault();
            
            const coverLetter = document.getElementById('coverLetter').value;
            const internshipId = this.currentApplicationInternshipId;
            
            if (!internshipId) {
                this.showMessage('Invalid internship selection!', 'error');
                return;
            }

            // Create application
            const application = {
                id: this.generateId(),
                internshipId: internshipId,
                coverLetter: coverLetter,
                appliedDate: new Date().toISOString(),
                status: 'pending',
                matchScore: this.calculateMatchScore(this.internships.find(i => i.id === internshipId))
            };

            // Add to applications
            this.applications.push(application);
            this.currentUser.applications = this.applications;
            
            // Save
            this.saveCurrentUser();
            
            // Update UI
            this.renderInternships();
            this.renderApplications();
            this.closeModal('applicationModal');
            
            // Reset form
            document.getElementById('applicationForm').reset();
            this.currentApplicationInternshipId = null;
            
            this.showMessage('Application submitted successfully!', 'success');
        }

        // Applications Page
        renderApplications() {
            const tbody = document.getElementById('applicationsTableBody');
            if (!tbody) return;

            tbody.innerHTML = '';
            
            // Update statistics
            const totalApps = this.applications.length;
            const pendingApps = this.applications.filter(app => app.status === 'pending').length;
            const acceptedApps = this.applications.filter(app => app.status === 'accepted').length;
            const rejectedApps = this.applications.filter(app => app.status === 'rejected').length;
            
            document.getElementById('totalApplications').textContent = totalApps;
            document.getElementById('pendingApplications').textContent = pendingApps;
            document.getElementById('acceptedApplications').textContent = acceptedApps;
            document.getElementById('rejectedApplications').textContent = rejectedApps;
            
            // Render applications table
            this.applications.forEach(application => {
                const internship = this.internships.find(i => i.id === application.internshipId);
                
                if (internship) {
                    const row = document.createElement('tr');
                    const appliedDate = new Date(application.appliedDate).toLocaleDateString();
                    
                    row.innerHTML = `
                        <td>${internship.company}</td>
                        <td>${internship.position}</td>
                        <td>${appliedDate}</td>
                        <td><span class="status ${application.status}">${application.status}</span></td>
                        <td><span class="match-score ${application.matchScore >= 70 ? 'high' : application.matchScore >= 40 ? 'medium' : 'low'}">${application.matchScore}%</span></td>
                        <td>
                            <button class="btn btn-info" onclick="studentDashboard.viewApplicationDetails(${application.id})">View</button>
                            ${application.status === 'pending' ? 
                                `<button class="btn btn-danger" onclick="studentDashboard.withdrawApplication(${application.id})">Withdraw</button>` : ''
                            }
                        </td>
                    `;
                    tbody.appendChild(row);
                }
            });
        }

        viewApplicationDetails(applicationId) {
            const application = this.applications.find(app => app.id === applicationId);
            if (!application) return;

            const internship = this.internships.find(i => i.id === application.internshipId);
            if (!internship) return;

            const details = `
                Application Details:
                
                Company: ${internship.company}
                Position: ${internship.position}
                Applied Date: ${new Date(application.appliedDate).toLocaleDateString()}
                Status: ${application.status}
                Match Score: ${application.matchScore}%
                
                Cover Letter:
                ${application.coverLetter || 'No cover letter provided.'}
            `;

            alert(details);
        }

        withdrawApplication(applicationId) {
            if (!confirm('Are you sure you want to withdraw this application?')) return;

            this.applications = this.applications.filter(app => app.id !== applicationId);
            this.currentUser.applications = this.applications;
            
            this.saveCurrentUser();
            this.renderApplications();
            this.renderInternships();
            
            this.showMessage('Application withdrawn successfully!', 'success');
        }

        // Allocation Page
        renderAllocation() {
            const allocationStatus = document.getElementById('allocationStatus');
            const allocationDetails = document.getElementById('allocationDetails');
            const noAllocation = document.getElementById('noAllocation');
            
            if (this.allocation) {
                // Show allocation details
                const internship = this.internships.find(i => i.id === this.allocation.internshipId);
                
                if (internship) {
                    document.getElementById('allocatedCompany').textContent = internship.company;
                    document.getElementById('allocatedPosition').textContent = internship.position;
                    document.getElementById('allocatedDuration').textContent = internship.duration;
                    document.getElementById('allocatedStartDate').textContent = this.allocation.startDate || 'TBD';
                    document.getElementById('allocatedMatchScore').textContent = `${this.allocation.matchScore}%`;
                    
                    allocationDetails.style.display = 'block';
                    noAllocation.style.display = 'none';
                } else {
                    this.showNoAllocation();
                }
            } else {
                this.showNoAllocation();
            }
        }

        showNoAllocation() {
            document.getElementById('allocationDetails').style.display = 'none';
            document.getElementById('noAllocation').style.display = 'block';
        }

        acceptAllocation() {
            if (!this.allocation) return;
            
            this.allocation.status = 'accepted';
            this.allocation.acceptedDate = new Date().toISOString();
            this.currentUser.allocation = this.allocation;
            
            this.saveCurrentUser();
            this.showMessage('Allocation accepted! Good luck with your internship!', 'success');
        }

        contactAdmin() {
            // In a real application, this would open a contact form or email client
            alert('Contact feature would open here. You can reach out to the admin for any questions about your allocation.');
        }

        // Utility functions
        generateId() {
            return Date.now().toString(36) + Math.random().toString(36).substr(2);
        }

        saveCurrentUser() {
            // Update current user in localStorage
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const userIndex = users.findIndex(u => u.id === this.currentUser.id);
            
            if (userIndex !== -1) {
                users[userIndex] = this.currentUser;
                localStorage.setItem('users', JSON.stringify(users));
            }
            
            // Update current user session
            localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
        }

        showModal(modalId) {
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.style.display = 'block';
            }
        }

        closeModal(modalId) {
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.style.display = 'none';
            }
        }

        showMessage(message, type = 'info') {
            const messageEl = document.getElementById('message');
            if (!messageEl) return;

            messageEl.textContent = message;
            messageEl.className = `message ${type}`;
            messageEl.style.display = 'block';

            setTimeout(() => {
                messageEl.style.display = 'none';
            }, 5000);
        }

        // Search and filter functions
        searchInternships() {
            const searchTerm = document.getElementById('internshipSearch').value.toLowerCase();
            const cards = document.querySelectorAll('.internship-card');
            
            cards.forEach(card => {
                const text = card.textContent.toLowerCase();
                card.style.display = text.includes(searchTerm) ? '' : 'none';
            });
        }

        filterInternships() {
            const selectedSkill = document.getElementById('skillFilter').value;
            const cards = document.querySelectorAll('.internship-card');
            
            cards.forEach(card => {
                if (!selectedSkill) {
                    card.style.display = '';
                    return;
                }
                
                const skillsText = card.querySelector('.internship-skills').textContent.toLowerCase();
                card.style.display = skillsText.includes(selectedSkill.toLowerCase()) ? '' : 'none';
            });
        }
    }

    // Global functions for HTML onclick handlers
    function editProfile() {
        studentDashboard.editProfile();
    }

    function acceptAllocation() {
        studentDashboard.acceptAllocation();
    }

    function contactAdmin() {
        studentDashboard.contactAdmin();
    }

    function closeModal(modalId) {
        studentDashboard.closeModal(modalId);
    }

    function searchInternships() {
        studentDashboard.searchInternships();
    }

    function filterInternships() {
        studentDashboard.filterInternships();
    }

    // Initialize dashboard
    let studentDashboard;
    document.addEventListener('DOMContentLoaded', function() {
        studentDashboard = new StudentDashboard();
    });

    // Include AuthSystem class
    class AuthSystem {
        constructor() {
            this.currentUser = null;
        }

        getCurrentUser() {
            if (!this.currentUser) {
                const savedUser = localStorage.getItem('currentUser');
                if (savedUser) {
                    this.currentUser = JSON.parse(savedUser);
                }
            }
            return this.currentUser;
        }

        isStudent() {
            const user = this.getCurrentUser();
            return user && user.userType === 'student';
        }

        logout() {
            this.currentUser = null;
            localStorage.removeItem('currentUser');
            window.location.href = 'login.html';
        }
    }

// Admin Dashboard JavaScript
class AdminDashboard {
    constructor() {
        this.authSystem = new AuthSystem();
        this.students = [];
        this.internships = [];
        this.allocations = [];
        this.initializeDashboard();
    }

    initializeDashboard() {
        // Check authentication
        if (!this.authSystem.isAdmin()) {
            window.location.href = 'login.html';
            return;
        }

        // Load data
        this.loadData();
        
        // Setup navigation
        this.setupNavigation();
        
        // Setup form listeners
        this.setupFormListeners();
        
        // Render initial data
        this.renderOverview();
        this.renderStudents();
        this.renderInternships();
        this.renderAllocations();
        
        // Update user info
        this.updateUserInfo();
    }

    loadData() {
        // Load from localStorage or use default data
        const savedStudents = localStorage.getItem('students');
        const savedInternships = localStorage.getItem('internships');
        const savedAllocations = localStorage.getItem('allocations');

        this.students = savedStudents ? JSON.parse(savedStudents) : this.getDefaultStudents();
        this.internships = savedInternships ? JSON.parse(savedInternships) : this.getDefaultInternships();
        this.allocations = savedAllocations ? JSON.parse(savedAllocations) : [];
    }

    getDefaultStudents() {
        return [
            {
                id: 1,
                name: "Alice Johnson",
                email: "alice.johnson@email.com",
                skills: ["JavaScript", "React", "Node.js", "MongoDB"],
                preferences: ["Web Development", "Frontend", "Full Stack"],
                status: "pending"
            },
            {
                id: 2,
                name: "Bob Smith",
                email: "bob.smith@email.com",
                skills: ["Python", "Django", "PostgreSQL", "Docker"],
                preferences: ["Backend Development", "Data Science", "Machine Learning"],
                status: "pending"
            },
            {
                id: 3,
                name: "Carol Williams",
                email: "carol.williams@email.com",
                skills: ["Java", "Spring Boot", "MySQL", "AWS"],
                preferences: ["Enterprise Software", "Cloud Computing", "DevOps"],
                status: "pending"
            }
        ];
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
        // Student form
        const studentForm = document.getElementById('studentForm');
        if (studentForm) {
            studentForm.addEventListener('submit', (e) => this.handleStudentSubmit(e));
        }

        // Internship form
        const internshipForm = document.getElementById('internshipForm');
        if (internshipForm) {
            internshipForm.addEventListener('submit', (e) => this.handleInternshipSubmit(e));
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
        const user = this.authSystem.getCurrentUser();
        const userNameEl = document.getElementById('userName');
        if (userNameEl && user) {
            userNameEl.textContent = user.fullName;
        }
    }

    // Overview Page
    renderOverview() {
        const totalStudents = this.students.length;
        const totalInternships = this.internships.length;
        const allocatedCount = this.allocations.filter(a => a.status === 'allocated').length;
        const pendingCount = totalStudents - allocatedCount;

        document.getElementById('totalStudents').textContent = totalStudents;
        document.getElementById('totalInternships').textContent = totalInternships;
        document.getElementById('allocatedCount').textContent = allocatedCount;
        document.getElementById('pendingCount').textContent = pendingCount;
    }

    // Students Management
    renderStudents() {
        const tbody = document.getElementById('studentsTableBody');
        if (!tbody) return;

        tbody.innerHTML = '';
        
        this.students.forEach(student => {
            const allocation = this.allocations.find(a => a.studentId === student.id);
            const status = allocation ? allocation.status : 'pending';
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${student.id}</td>
                <td>${student.name}</td>
                <td>${student.email}</td>
                <td>${student.skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}</td>
                <td><span class="status ${status}">${status}</span></td>
                <td>
                    <button class="btn btn-primary" onclick="adminDashboard.editStudent(${student.id})">Edit</button>
                    <button class="btn btn-danger" onclick="adminDashboard.deleteStudent(${student.id})">Delete</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    editStudent(id) {
        const student = this.students.find(s => s.id === id);
        if (!student) return;

        document.getElementById('studentId').value = student.id;
        document.getElementById('studentName').value = student.name;
        document.getElementById('studentEmail').value = student.email;
        document.getElementById('studentSkills').value = student.skills.join(', ');
        document.getElementById('studentPreferences').value = student.preferences.join(', ');

        this.showModal('studentModal');
    }

    deleteStudent(id) {
        if (confirm('Are you sure you want to delete this student?')) {
            this.students = this.students.filter(s => s.id !== id);
            this.allocations = this.allocations.filter(a => a.studentId !== id);
            this.saveData();
            this.renderStudents();
            this.renderOverview();
            this.renderAllocations();
            this.showMessage('Student deleted successfully!', 'success');
        }
    }

    handleStudentSubmit(e) {
        e.preventDefault();
        
        const studentId = document.getElementById('studentId').value;
        const studentData = {
            name: document.getElementById('studentName').value,
            email: document.getElementById('studentEmail').value,
            skills: document.getElementById('studentSkills').value.split(',').map(s => s.trim()).filter(s => s),
            preferences: document.getElementById('studentPreferences').value.split(',').map(p => p.trim()).filter(p => p)
        };

        if (studentId) {
            // Edit existing student
            const index = this.students.findIndex(s => s.id === parseInt(studentId));
            if (index !== -1) {
                this.students[index] = { ...this.students[index], ...studentData };
            }
        } else {
            // Add new student
            const newStudent = {
                id: this.generateId(),
                ...studentData,
                status: 'pending'
            };
            this.students.push(newStudent);
        }

        this.saveData();
        this.renderStudents();
        this.renderOverview();
        this.closeModal('studentModal');
        this.showMessage('Student saved successfully!', 'success');
    }

    // Internship Management
    renderInternships() {
        const tbody = document.getElementById('internshipsTableBody');
        if (!tbody) return;

        tbody.innerHTML = '';
        
        this.internships.forEach(internship => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${internship.id}</td>
                <td>${internship.company}</td>
                <td>${internship.position}</td>
                <td>${internship.requiredSkills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}</td>
                <td>${internship.allocatedSlots}/${internship.availableSlots}</td>
                <td>
                    <button class="btn btn-primary" onclick="adminDashboard.editInternship(${internship.id})">Edit</button>
                    <button class="btn btn-danger" onclick="adminDashboard.deleteInternship(${internship.id})">Delete</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    editInternship(id) {
        const internship = this.internships.find(i => i.id === id);
        if (!internship) return;

        document.getElementById('internshipId').value = internship.id;
        document.getElementById('companyName').value = internship.company;
        document.getElementById('positionTitle').value = internship.position;
        document.getElementById('requiredSkills').value = internship.requiredSkills.join(', ');
        document.getElementById('duration').value = internship.duration;
        document.getElementById('availableSlots').value = internship.availableSlots;

        this.showModal('internshipModal');
    }

    deleteInternship(id) {
        if (confirm('Are you sure you want to delete this internship?')) {
            this.internships = this.internships.filter(i => i.id !== id);
            this.allocations = this.allocations.filter(a => a.internshipId !== id);
            this.saveData();
            this.renderInternships();
            this.renderOverview();
            this.renderAllocations();
            this.showMessage('Internship deleted successfully!', 'success');
        }
    }

    handleInternshipSubmit(e) {
        e.preventDefault();
        
        const internshipId = document.getElementById('internshipId').value;
        const internshipData = {
            company: document.getElementById('companyName').value,
            position: document.getElementById('positionTitle').value,
            requiredSkills: document.getElementById('requiredSkills').value.split(',').map(s => s.trim()).filter(s => s),
            duration: document.getElementById('duration').value,
            availableSlots: parseInt(document.getElementById('availableSlots').value)
        };

        if (internshipId) {
            // Edit existing internship
            const index = this.internships.findIndex(i => i.id === parseInt(internshipId));
            if (index !== -1) {
                this.internships[index] = { 
                    ...this.internships[index], 
                    ...internshipData,
                    allocatedSlots: this.internships[index].allocatedSlots || 0
                };
            }
        } else {
            // Add new internship
            const newInternship = {
                id: this.generateId(),
                ...internshipData,
                allocatedSlots: 0
            };
            this.internships.push(newInternship);
        }

        this.saveData();
        this.renderInternships();
        this.renderOverview();
        this.closeModal('internshipModal');
        this.showMessage('Internship saved successfully!', 'success');
    }

    // Allocation Management
    renderAllocations() {
        const tbody = document.getElementById('allocationTableBody');
        if (!tbody) return;

        tbody.innerHTML = '';
        
        this.allocations.forEach(allocation => {
            const student = this.students.find(s => s.id === allocation.studentId);
            const internship = allocation.internshipId ? 
                this.internships.find(i => i.id === allocation.internshipId) : null;

            if (student) {
                const row = document.createElement('tr');
                const scoreClass = allocation.score >= 70 ? 'high' : 
                                  allocation.score >= 40 ? 'medium' : 'low';
                
                row.innerHTML = `
                    <td>${student.name}</td>
                    <td>${internship ? `${internship.company} - ${internship.position}` : 'Not Allocated'}</td>
                    <td><span class="match-score ${scoreClass}">${allocation.score}%</span></td>
                    <td><span class="status ${allocation.status}">${allocation.status}</span></td>
                    <td>
                        ${allocation.status === 'allocated' ? 
                            `<button class="btn btn-danger" onclick="adminDashboard.removeAllocation(${allocation.studentId})">Remove</button>` :
                            `<button class="btn btn-primary" onclick="adminDashboard.manualAllocate(${allocation.studentId})">Allocate</button>`
                        }
                    </td>
                `;
                tbody.appendChild(row);
            }
        });
    }

    runAutoAllocation() {
        // Clear existing allocations
        this.allocations = [];
        this.internships.forEach(internship => {
            internship.allocatedSlots = 0;
        });

        // Create compatibility matrix
        const compatibilityMatrix = [];
        
        this.students.forEach(student => {
            this.internships.forEach(internship => {
                if (internship.allocatedSlots < internship.availableSlots) {
                    const score = this.calculateMatchScore(student, internship);
                    compatibilityMatrix.push({
                        student,
                        internship,
                        score
                    });
                }
            });
        });

        // Sort by score (descending)
        compatibilityMatrix.sort((a, b) => b.score - a.score);

        // Allocate based on highest scores
        const allocatedStudents = new Set();
        
        compatibilityMatrix.forEach(({ student, internship, score }) => {
            if (!allocatedStudents.has(student.id) && 
                internship.allocatedSlots < internship.availableSlots && 
                score >= 30) {
                this.allocations.push({
                    studentId: student.id,
                    internshipId: internship.id,
                    score,
                    status: 'allocated'
                });
                
                internship.allocatedSlots++;
                allocatedStudents.add(student.id);
            }
        });

        // Mark unallocated students
        this.students.forEach(student => {
            if (!allocatedStudents.has(student.id)) {
                this.allocations.push({
                    studentId: student.id,
                    internshipId: null,
                    score: 0,
                    status: 'pending'
                });
            }
        });

        this.saveData();
        this.renderAllocations();
        this.renderOverview();
        this.renderStudents();
        this.showMessage('Auto allocation completed successfully!', 'success');
    }

    calculateMatchScore(student, internship) {
        let score = 0;
        const skillMatchWeight = document.getElementById('skillMatch').checked ? 0.4 : 0;
        const preferenceWeight = document.getElementById('studentPreference').checked ? 0.3 : 0;
        const requirementWeight = document.getElementById('companyRequirements').checked ? 0.3 : 0;
        
        // Skill matching
        const matchingSkills = student.skills.filter(skill => 
            internship.requiredSkills.some(req => req.toLowerCase().includes(skill.toLowerCase()) || 
                                                 skill.toLowerCase().includes(req.toLowerCase()))
        );
        const skillScore = matchingSkills.length / Math.max(student.skills.length, internship.requiredSkills.length);
        score += skillScore * skillMatchWeight;
        
        // Preference matching
        const preferenceMatch = student.preferences.some(pref => 
            pref.toLowerCase().includes(internship.position.toLowerCase()) ||
            internship.position.toLowerCase().includes(pref.toLowerCase())
        );
        score += (preferenceMatch ? 1 : 0) * preferenceWeight;
        
        // Requirements fulfillment
        const missingSkills = internship.requiredSkills.filter(req => 
            !student.skills.some(skill => skill.toLowerCase().includes(req.toLowerCase()) || 
                                         req.toLowerCase().includes(skill.toLowerCase()))
        );
        const requirementScore = 1 - (missingSkills.length / internship.requiredSkills.length);
        score += requirementScore * requirementWeight;
        
        return Math.round(score * 100);
    }

    clearAllocations() {
        if (confirm('Are you sure you want to clear all allocations?')) {
            this.allocations = [];
            this.internships.forEach(internship => {
                internship.allocatedSlots = 0;
            });
            this.saveData();
            this.renderAllocations();
            this.renderOverview();
            this.renderStudents();
            this.showMessage('All allocations cleared!', 'success');
        }
    }

    removeAllocation(studentId) {
        const allocation = this.allocations.find(a => a.studentId === studentId);
        if (allocation && allocation.internshipId) {
            const internship = this.internships.find(i => i.id === allocation.internshipId);
            if (internship) {
                internship.allocatedSlots--;
            }
            
            allocation.internshipId = null;
            allocation.score = 0;
            allocation.status = 'pending';
            
            this.saveData();
            this.renderAllocations();
            this.renderStudents();
            this.showMessage('Allocation removed!', 'success');
        }
    }

    manualAllocate(studentId) {
        const student = this.students.find(s => s.id === studentId);
        if (!student) return;
        
        const availableInternships = this.internships.filter(i => i.allocatedSlots < i.availableSlots);
        
        if (availableInternships.length === 0) {
            this.showMessage('No available internships for manual allocation.', 'error');
            return;
        }
        
        const internshipNames = availableInternships.map((i, index) => 
            `${index + 1}. ${i.company} - ${i.position}`
        ).join('\n');
        
        const choice = prompt(`Select internship for ${student.name}:\n${internshipNames}\n\nEnter number:`);
        
        if (choice && !isNaN(choice)) {
            const selectedIndex = parseInt(choice) - 1;
            if (selectedIndex >= 0 && selectedIndex < availableInternships.length) {
                const selectedInternship = availableInternships[selectedIndex];
                const score = this.calculateMatchScore(student, selectedInternship);
                
                const allocation = this.allocations.find(a => a.studentId === studentId);
                if (allocation) {
                    allocation.internshipId = selectedInternship.id;
                    allocation.score = score;
                    allocation.status = 'allocated';
                }
                
                selectedInternship.allocatedSlots++;
                
                this.saveData();
                this.renderAllocations();
                this.renderStudents();
                this.showMessage('Manual allocation completed!', 'success');
            }
        }
    }

    // Reports
    generateReport() {
        // This would generate a detailed report
        // For demo purposes, we'll show a summary
        const totalStudents = this.students.length;
        const allocatedStudents = this.allocations.filter(a => a.status === 'allocated').length;
        const allocationRate = ((allocatedStudents / totalStudents) * 100).toFixed(1);
        
        const reportSummary = `
            <h4>Allocation Summary</h4>
            <p>Total Students: ${totalStudents}</p>
            <p>Allocated Students: ${allocatedStudents}</p>
            <p>Allocation Rate: ${allocationRate}%</p>
            <p>Total Internships: ${this.internships.length}</p>
        `;
        
        document.getElementById('reportSummary').innerHTML = reportSummary;
        this.showMessage('Report generated successfully!', 'success');
    }

    exportData() {
        const csvContent = this.generateCSV();
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'internship_allocation_report.csv';
        a.click();
        window.URL.revokeObjectURL(url);
        this.showMessage('Data exported successfully!', 'success');
    }

    generateCSV() {
        let csv = "Student Name,Email,Company,Position,Match Score,Status\n";
        
        this.allocations.forEach(allocation => {
            const student = this.students.find(s => s.id === allocation.studentId);
            const internship = allocation.internshipId ? 
                this.internships.find(i => i.id === allocation.internshipId) : null;
            
            if (student) {
                csv += `"${student.name}","${student.email}","${internship ? internship.company : 'N/A'}","${internship ? internship.position : 'N/A'}","${allocation.score}%","${allocation.status}"\n`;
            }
        });
        
        return csv;
    }

    // Utility functions
    generateId() {
        return Math.max(...this.students.map(s => s.id), ...this.internships.map(i => i.id), 0) + 1;
    }

    saveData() {
        localStorage.setItem('students', JSON.stringify(this.students));
        localStorage.setItem('internships', JSON.stringify(this.internships));
        localStorage.setItem('allocations', JSON.stringify(this.allocations));
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

    // Search functions
    searchStudents() {
        const searchTerm = document.getElementById('studentSearch').value.toLowerCase();
        const rows = document.querySelectorAll('#studentsTableBody tr');
        
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(searchTerm) ? '' : 'none';
        });
    }

    searchInternships() {
        const searchTerm = document.getElementById('internshipSearch').value.toLowerCase();
        const rows = document.querySelectorAll('#internshipsTableBody tr');
        
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(searchTerm) ? '' : 'none';
        });
    }

    filterStudents() {
        const filterStatus = document.getElementById('filterStatus').value;
        const rows = document.querySelectorAll('#studentsTableBody tr');
        
        rows.forEach(row => {
            const statusCell = row.querySelector('.status');
            if (statusCell) {
                const status = statusCell.textContent.toLowerCase();
                row.style.display = !filterStatus || status === filterStatus ? '' : 'none';
            }
        });
    }
}

// Global functions for HTML onclick handlers
function showAddStudentModal() {
    document.getElementById('studentForm').reset();
    document.getElementById('studentId').value = '';
    adminDashboard.showModal('studentModal');
}

function showAddInternshipModal() {
    document.getElementById('internshipForm').reset();
    document.getElementById('internshipId').value = '';
    adminDashboard.showModal('internshipModal');
}

function runAutoAllocation() {
    adminDashboard.runAutoAllocation();
}

function clearAllocations() {
    adminDashboard.clearAllocations();
}

function exportData() {
    adminDashboard.exportData();
}

function generateReport() {
    adminDashboard.generateReport();
}

function closeModal(modalId) {
    adminDashboard.closeModal(modalId);
}

function searchStudents() {
    adminDashboard.searchStudents();
}

function searchInternships() {
    adminDashboard.searchInternships();
}

function filterStudents() {
    adminDashboard.filterStudents();
}

// Initialize dashboard
let adminDashboard;
document.addEventListener('DOMContentLoaded', function() {
    adminDashboard = new AdminDashboard();
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

    isAdmin() {
        const user = this.getCurrentUser();
        return user && user.userType === 'admin';
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('currentUser');
        window.location.href = 'login.html';
    }
}

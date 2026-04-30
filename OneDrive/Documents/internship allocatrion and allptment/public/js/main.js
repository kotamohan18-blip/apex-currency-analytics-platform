// Global variables
let currentEditingStudent = null;
let currentEditingInternship = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeTabs();
    loadFromLocalStorage();
    renderStudents();
    renderInternships();
    renderResults();
    updateAllocationStats();
    
    // Setup form listeners
    document.getElementById('studentForm').addEventListener('submit', handleStudentSubmit);
    document.getElementById('internshipForm').addEventListener('submit', handleInternshipSubmit);
});

// Tab functionality
function initializeTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.dataset.tab;
            
            // Remove active class from all tabs and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding content
            button.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
        });
    });
}

// Student Management Functions
function renderStudents() {
    const tbody = document.getElementById('studentsTableBody');
    tbody.innerHTML = '';
    
    students.forEach(student => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${student.id}</td>
            <td>${student.name}</td>
            <td>${student.email}</td>
            <td>${student.skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}</td>
            <td>${student.preferences.map(pref => `<span class="skill-tag">${pref}</span>`).join('')}</td>
            <td>
                <button class="btn btn-primary" onclick="editStudent(${student.id})">Edit</button>
                <button class="btn btn-danger" onclick="deleteStudent(${student.id})">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function openStudentModal(studentId = null) {
    const modal = document.getElementById('studentModal');
    const form = document.getElementById('studentForm');
    
    if (studentId) {
        const student = students.find(s => s.id === studentId);
        if (student) {
            document.getElementById('studentId').value = student.id;
            document.getElementById('studentName').value = student.name;
            document.getElementById('studentEmail').value = student.email;
            document.getElementById('studentSkills').value = student.skills.join(', ');
            document.getElementById('studentPreferences').value = student.preferences.join(', ');
            currentEditingStudent = student;
        }
    } else {
        form.reset();
        document.getElementById('studentId').value = '';
        currentEditingStudent = null;
    }
    
    modal.style.display = 'block';
}

function closeStudentModal() {
    document.getElementById('studentModal').style.display = 'none';
    currentEditingStudent = null;
}

function handleStudentSubmit(e) {
    e.preventDefault();
    
    const studentData = {
        name: document.getElementById('studentName').value,
        email: document.getElementById('studentEmail').value,
        skills: document.getElementById('studentSkills').value.split(',').map(s => s.trim()).filter(s => s),
        preferences: document.getElementById('studentPreferences').value.split(',').map(p => p.trim()).filter(p => p)
    };
    
    const studentId = document.getElementById('studentId').value;
    
    if (studentId) {
        // Edit existing student
        const index = students.findIndex(s => s.id === parseInt(studentId));
        if (index !== -1) {
            students[index] = { ...students[index], ...studentData };
        }
    } else {
        // Add new student
        const newStudent = {
            id: generateId(),
            ...studentData
        };
        students.push(newStudent);
    }
    
    saveToLocalStorage();
    renderStudents();
    updateAllocationStats();
    closeStudentModal();
}

function editStudent(id) {
    openStudentModal(id);
}

function deleteStudent(id) {
    if (confirm('Are you sure you want to delete this student?')) {
        students = students.filter(s => s.id !== id);
        allocations = allocations.filter(a => a.studentId !== id);
        saveToLocalStorage();
        renderStudents();
        renderResults();
        updateAllocationStats();
    }
}

function searchStudents() {
    const searchTerm = document.getElementById('studentSearch').value.toLowerCase();
    const rows = document.querySelectorAll('#studentsTableBody tr');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
    });
}

// Internship Management Functions
function renderInternships() {
    const tbody = document.getElementById('internshipsTableBody');
    tbody.innerHTML = '';
    
    internships.forEach(internship => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${internship.id}</td>
            <td>${internship.company}</td>
            <td>${internship.position}</td>
            <td>${internship.requiredSkills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}</td>
            <td>${internship.duration}</td>
            <td>${internship.allocatedSlots}/${internship.availableSlots}</td>
            <td>
                <button class="btn btn-primary" onclick="editInternship(${internship.id})">Edit</button>
                <button class="btn btn-danger" onclick="deleteInternship(${internship.id})">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function openInternshipModal(internshipId = null) {
    const modal = document.getElementById('internshipModal');
    const form = document.getElementById('internshipForm');
    
    if (internshipId) {
        const internship = internships.find(i => i.id === internshipId);
        if (internship) {
            document.getElementById('internshipId').value = internship.id;
            document.getElementById('companyName').value = internship.company;
            document.getElementById('positionTitle').value = internship.position;
            document.getElementById('requiredSkills').value = internship.requiredSkills.join(', ');
            document.getElementById('duration').value = internship.duration;
            document.getElementById('availableSlots').value = internship.availableSlots;
            currentEditingInternship = internship;
        }
    } else {
        form.reset();
        document.getElementById('internshipId').value = '';
        currentEditingInternship = null;
    }
    
    modal.style.display = 'block';
}

function closeInternshipModal() {
    document.getElementById('internshipModal').style.display = 'none';
    currentEditingInternship = null;
}

function handleInternshipSubmit(e) {
    e.preventDefault();
    
    const internshipData = {
        company: document.getElementById('companyName').value,
        position: document.getElementById('positionTitle').value,
        requiredSkills: document.getElementById('requiredSkills').value.split(',').map(s => s.trim()).filter(s => s),
        duration: document.getElementById('duration').value,
        availableSlots: parseInt(document.getElementById('availableSlots').value)
    };
    
    const internshipId = document.getElementById('internshipId').value;
    
    if (internshipId) {
        // Edit existing internship
        const index = internships.findIndex(i => i.id === parseInt(internshipId));
        if (index !== -1) {
            internships[index] = { 
                ...internships[index], 
                ...internshipData,
                allocatedSlots: internships[index].allocatedSlots || 0
            };
        }
    } else {
        // Add new internship
        const newInternship = {
            id: generateId(),
            ...internshipData,
            allocatedSlots: 0
        };
        internships.push(newInternship);
    }
    
    saveToLocalStorage();
    renderInternships();
    closeInternshipModal();
}

function editInternship(id) {
    openInternshipModal(id);
}

function deleteInternship(id) {
    if (confirm('Are you sure you want to delete this internship?')) {
        internships = internships.filter(i => i.id !== id);
        allocations = allocations.filter(a => a.internshipId !== id);
        saveToLocalStorage();
        renderInternships();
        renderResults();
        updateAllocationStats();
    }
}

function searchInternships() {
    const searchTerm = document.getElementById('internshipSearch').value.toLowerCase();
    const rows = document.querySelectorAll('#internshipsTableBody tr');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
    });
}

// Allocation Functions
function calculateMatchScore(student, internship) {
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
    
    // Requirements fulfillment (inverse of missing skills)
    const missingSkills = internship.requiredSkills.filter(req => 
        !student.skills.some(skill => skill.toLowerCase().includes(req.toLowerCase()) || 
                                     req.toLowerCase().includes(skill.toLowerCase()))
    );
    const requirementScore = 1 - (missingSkills.length / internship.requiredSkills.length);
    score += requirementScore * requirementWeight;
    
    return Math.round(score * 100);
}

function performAutoAllocation() {
    // Clear existing allocations
    allocations = [];
    internships.forEach(internship => {
        internship.allocatedSlots = 0;
    });
    
    // Create compatibility matrix
    const compatibilityMatrix = [];
    
    students.forEach(student => {
        internships.forEach(internship => {
            if (internship.allocatedSlots < internship.availableSlots) {
                const score = calculateMatchScore(student, internship);
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
            score >= 30) { // Minimum threshold
            allocations.push({
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
    students.forEach(student => {
        if (!allocatedStudents.has(student.id)) {
            allocations.push({
                studentId: student.id,
                internshipId: null,
                score: 0,
                status: 'pending'
            });
        }
    });
    
    saveToLocalStorage();
    renderResults();
    updateAllocationStats();
    
    alert('Auto allocation completed!');
}

function clearAllocations() {
    if (confirm('Are you sure you want to clear all allocations?')) {
        allocations = [];
        internships.forEach(internship => {
            internship.allocatedSlots = 0;
        });
        saveToLocalStorage();
        renderResults();
        updateAllocationStats();
    }
}

function updateAllocationStats() {
    const totalStudents = students.length;
    const totalInternships = internships.length;
    const allocatedStudents = allocations.filter(a => a.status === 'allocated').length;
    const unallocatedStudents = totalStudents - allocatedStudents;
    
    document.getElementById('totalStudents').textContent = totalStudents;
    document.getElementById('totalInternships').textContent = totalInternships;
    document.getElementById('allocatedStudents').textContent = allocatedStudents;
    document.getElementById('unallocatedStudents').textContent = unallocatedStudents;
}

// Results Functions
function renderResults() {
    const tbody = document.getElementById('resultsTableBody');
    tbody.innerHTML = '';
    
    allocations.forEach(allocation => {
        const student = students.find(s => s.id === allocation.studentId);
        const internship = allocation.internshipId ? 
            internships.find(i => i.id === allocation.internshipId) : null;
        
        if (student) {
            const row = document.createElement('tr');
            const scoreClass = allocation.score >= 70 ? 'high' : 
                              allocation.score >= 40 ? 'medium' : 'low';
            
            row.innerHTML = `
                <td>${student.name}</td>
                <td>${student.email}</td>
                <td>${internship ? internship.company : 'N/A'}</td>
                <td>${internship ? internship.position : 'N/A'}</td>
                <td><span class="match-score ${scoreClass}">${allocation.score}%</span></td>
                <td><span class="status ${allocation.status}">${allocation.status}</span></td>
                <td>
                    ${allocation.status === 'allocated' ? 
                        `<button class="btn btn-danger" onclick="removeAllocation(${allocation.studentId})">Remove</button>` :
                        `<button class="btn btn-primary" onclick="manualAllocate(${allocation.studentId})">Allocate</button>`
                    }
                </td>
            `;
            tbody.appendChild(row);
        }
    });
}

function removeAllocation(studentId) {
    const allocation = allocations.find(a => a.studentId === studentId);
    if (allocation && allocation.internshipId) {
        const internship = internships.find(i => i.id === allocation.internshipId);
        if (internship) {
            internship.allocatedSlots--;
        }
        
        allocation.internshipId = null;
        allocation.score = 0;
        allocation.status = 'pending';
        
        saveToLocalStorage();
        renderResults();
        renderInternships();
        updateAllocationStats();
    }
}

function manualAllocate(studentId) {
    const student = students.find(s => s.id === studentId);
    if (!student) return;
    
    const availableInternships = internships.filter(i => i.allocatedSlots < i.availableSlots);
    
    if (availableInternships.length === 0) {
        alert('No available internships for manual allocation.');
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
            const score = calculateMatchScore(student, selectedInternship);
            
            const allocation = allocations.find(a => a.studentId === studentId);
            if (allocation) {
                allocation.internshipId = selectedInternship.id;
                allocation.score = score;
                allocation.status = 'allocated';
            }
            
            selectedInternship.allocatedSlots++;
            
            saveToLocalStorage();
            renderResults();
            renderInternships();
            updateAllocationStats();
        }
    }
}

function searchResults() {
    const searchTerm = document.getElementById('resultsSearch').value.toLowerCase();
    const rows = document.querySelectorAll('#resultsTableBody tr');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
    });
}

function exportResults() {
    let csvContent = "Student Name,Email,Company,Position,Match Score,Status\n";
    
    allocations.forEach(allocation => {
        const student = students.find(s => s.id === allocation.studentId);
        const internship = allocation.internshipId ? 
            internships.find(i => i.id === allocation.internshipId) : null;
        
        if (student) {
            csvContent += `"${student.name}","${student.email}","${internship ? internship.company : 'N/A'}","${internship ? internship.position : 'N/A'}","${allocation.score}%","${allocation.status}"\n`;
        }
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'internship_allocation_results.csv';
    a.click();
    window.URL.revokeObjectURL(url);
}

// Close modals when clicking outside
window.onclick = function(event) {
    const studentModal = document.getElementById('studentModal');
    const internshipModal = document.getElementById('internshipModal');
    
    if (event.target === studentModal) {
        closeStudentModal();
    }
    if (event.target === internshipModal) {
        closeInternshipModal();
    }
}

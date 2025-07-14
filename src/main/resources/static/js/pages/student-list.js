// DOM Elements
const searchInput = document.getElementById('searchInput');
const searchFilter = document.getElementById('searchFilter');
const clearSearchBtn = document.querySelector('.clear-search');
const studentsTable = document.getElementById('studentsTable').getElementsByTagName('tbody')[0];
const totalStudentsCount = document.getElementById('totalStudentsCount');
const totalFees = document.getElementById('totalFees');
const activeStudents = document.getElementById('activeStudents');

// State
let students = [];
let filteredStudents = [];

// Fetch students from API
async function fetchStudents() {
    try {
        const response = await fetch('/api/students');
        students = await response.json();
        filteredStudents = [...students];
        updateTable();
        updateStats();
    } catch (error) {
        console.error('Error fetching students:', error);
        showNotification('Error loading students', 'error');
    }
}

// Update table with student data
function updateTable() {
    studentsTable.innerHTML = '';
    
    filteredStudents.forEach(student => {
        const row = document.createElement('tr');
        
        // Student Info Cell
        const studentInfoCell = document.createElement('td');
        studentInfoCell.innerHTML = `
            <div class="student-info">
                <div class="student-avatar">
                    ${student.name.charAt(0).toUpperCase()}
                </div>
                <div class="student-details">
                    <div class="student-name">${student.name}</div>
                    <div class="student-id">ID: ${student.id}</div>
                </div>
            </div>
        `;
        
        // Contact Info Cell
        const contactInfoCell = document.createElement('td');
        contactInfoCell.innerHTML = `
            <div class="contact-info">
                <div class="contact-item">
                    <i class="fas fa-phone"></i>
                    <span>${student.phone}</span>
                </div>
                <div class="contact-item">
                    <i class="fas fa-envelope"></i>
                    <span>${student.email}</span>
                </div>
            </div>
        `;
        
        // Course Info Cell
        const courseInfoCell = document.createElement('td');
        courseInfoCell.innerHTML = `
            <div class="course-info">
                <div class="course-name">${student.course}</div>
                <div class="course-duration">${student.duration}</div>
            </div>
        `;
        
        // Fee Status Cell
        const feeStatusCell = document.createElement('td');
        const paidPercentage = (student.paidAmount / student.totalFee) * 100;
        feeStatusCell.innerHTML = `
            <div class="fee-status">
                <div class="fee-amount">₹${student.paidAmount} / ₹${student.totalFee}</div>
                <div class="fee-progress">
                    <div class="fee-progress-bar" style="width: ${paidPercentage}%"></div>
                </div>
            </div>
        `;
        
        // Actions Cell
        const actionsCell = document.createElement('td');
        actionsCell.innerHTML = `
            <div class="action-buttons">
                <button class="action-btn view-profile-btn primary" onclick="viewStudentProfile(${student.id})">
                    <i class="fas fa-user"></i> <span>View Profile</span>
                </button>
                <button class="action-btn edit-btn" onclick="editStudent(${student.id})">
                    <i class="fas fa-edit"></i>
                    Edit
                </button>
                <button class="action-btn payment-btn" onclick="addPayment(${student.id})">
                    <i class="fas fa-money-bill"></i>
                    Payment
                </button>
                <button class="action-btn id-card-btn" onclick="generateIdCard(${student.id})">
                    <i class="fas fa-id-card"></i>
                    ID Card
                </button>
                <button class="action-btn delete-btn" onclick="deleteStudent(${student.id})">
                    <i class="fas fa-trash"></i>
                    Delete
                </button>
            </div>
        `;
        
        row.appendChild(studentInfoCell);
        row.appendChild(contactInfoCell);
        row.appendChild(courseInfoCell);
        row.appendChild(feeStatusCell);
        row.appendChild(actionsCell);
        
        studentsTable.appendChild(row);
    });
}

// Update statistics
function updateStats() {
    totalStudentsCount.textContent = students.length;
    
    const totalFeesAmount = students.reduce((sum, student) => sum + student.totalFee, 0);
    totalFees.textContent = `₹${totalFeesAmount}`;
    
    const activeStudentsCount = students.filter(student => student.status === 'active').length;
    activeStudents.textContent = activeStudentsCount;
}

// Search functionality
function handleSearch() {
    const searchTerm = searchInput.value.toLowerCase();
    const filterType = searchFilter.value;
    
    filteredStudents = students.filter(student => {
        if (filterType === 'all') {
            return (
                student.name.toLowerCase().includes(searchTerm) ||
                student.id.toString().includes(searchTerm) ||
                student.course.toLowerCase().includes(searchTerm) ||
                student.phone.includes(searchTerm) ||
                student.email.toLowerCase().includes(searchTerm)
            );
        } else {
            return student[filterType].toString().toLowerCase().includes(searchTerm);
        }
    });
    
    updateTable();
}

// Event Listeners
searchInput.addEventListener('input', handleSearch);
searchFilter.addEventListener('change', handleSearch);
clearSearchBtn.addEventListener('click', () => {
    searchInput.value = '';
    searchFilter.value = 'all';
    filteredStudents = [...students];
    updateTable();
});

// Student Actions
function editStudent(id) {
    window.location.href = `/pages/add-student.html?id=${id}`;
}

function addPayment(id) {
    window.location.href = `/pages/payments.html?studentId=${id}`;
}

function generateIdCard(id) {
    window.location.href = `/pages/id-card.html?id=${id}`;
}

async function deleteStudent(id) {
    if (confirm('Are you sure you want to delete this student? This will permanently delete all student data including payments and receipts.')) {
        try {
            const response = await fetch(`/api/students/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                // Remove the student from both arrays
                students = students.filter(student => student.id !== id);
                filteredStudents = filteredStudents.filter(student => student.id !== id);
                
                // Update the UI
                updateTable();
                updateStats();
                showNotification('Student and all related data deleted successfully', 'success');
                
                // Refresh the page after successful deletion
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            } else {
                const errorData = await response.text();
                console.error('Delete failed:', errorData);
                throw new Error(`Failed to delete student: ${errorData}`);
            }
        } catch (error) {
            console.error('Error deleting student:', error);
            showNotification('Error deleting student: ' + error.message, 'error');
        }
    }
}

// Notification system
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Add viewStudentProfile function and modal logic
window.viewStudentProfile = function(id) {
    const student = students.find(s => s.id === id);
    if (!student) return;
    const content = `
        <div class="profile-modal-card">
            <div class="profile-header">
                <div class="profile-avatar">${student.name.charAt(0).toUpperCase()}</div>
                <div class="profile-main-info">
                    <div class="profile-name">${student.name}</div>
                    <div class="profile-id-status">
                        <span class="profile-id">ID: ${student.id}</span>
                        <span class="profile-status ${student.status === 'active' ? 'active' : 'inactive'}">
                            <i class="fas fa-circle"></i> ${student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                        </span>
                    </div>
                </div>
            </div>
            <hr class="profile-divider" />
            <div class="profile-section">
                <h4><i class="fas fa-user"></i> Personal</h4>
                <div class="profile-row"><b>Father's Name:</b> ${student.fatherName || '-'}</div>
                <div class="profile-row"><b>Mother's Name:</b> ${student.motherName || '-'}</div>
                <div class="profile-row"><b>Date of Birth:</b> ${student.dob || '-'}</div>
            </div>
            <div class="profile-section">
                <h4><i class="fas fa-address-book"></i> Contact</h4>
                <div class="profile-row"><b>Phone:</b> ${student.phone}</div>
                <div class="profile-row"><b>Email:</b> ${student.email}</div>
                <div class="profile-row"><b>Address:</b> ${student.address || '-'}</div>
            </div>
            <div class="profile-section">
                <h4><i class="fas fa-graduation-cap"></i> Course</h4>
                <div class="profile-row"><b>Course:</b> ${student.course}</div>
                <div class="profile-row"><b>Duration:</b> ${student.duration}</div>
            </div>
            <div class="profile-section">
                <h4><i class="fas fa-rupee-sign"></i> Financial</h4>
                <div class="profile-row"><b>Paid:</b> ₹${student.paidAmount} / ₹${student.totalFee}</div>
            </div>
            <div class="profile-signature">
                <span class="sig-label">Signature</span>
                <img src="../uploads/signatures/director.png" alt="Director Signature" />
            </div>
        </div>
    `;
    document.getElementById('studentProfileContent').innerHTML = content;
    document.getElementById('studentProfileModal').style.display = 'flex';
    // Ensure close button works
    const closeBtn = document.getElementById('closeProfileModalBtn');
    if (closeBtn) {
        closeBtn.onclick = function() {
            document.getElementById('studentProfileModal').style.display = 'none';
        };
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    fetchStudents();
    var closeBtn = document.getElementById('closeProfileModalBtn');
    if (closeBtn) {
        closeBtn.onclick = function() {
            document.getElementById('studentProfileModal').style.display = 'none';
        };
    }
});

// Modal close logic using event delegation
const studentProfileModal = document.getElementById('studentProfileModal');
if (studentProfileModal) {
    studentProfileModal.addEventListener('click', function(e) {
        if (e.target.classList.contains('close-btn') || e.target === studentProfileModal) {
            studentProfileModal.style.display = 'none';
        }
    });
} 
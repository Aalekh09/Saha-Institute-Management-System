// Check if user is logged in
if (!localStorage.getItem('isLoggedIn')) {
    window.location.replace('login.html');
    throw new Error('Not logged in');
}

// Set username from localStorage
const username = localStorage.getItem('username');
if (username) {
    document.getElementById('username').textContent = username;
}

const API_URL = 'http://localhost:4456/api/students';

const studentsTableBody = document.querySelector('#studentsTable tbody');
const studentForm = document.getElementById('studentForm');
const searchInput = document.getElementById('searchInput');
const submitBtn = document.getElementById('submitBtn');
const cancelEditBtn = document.getElementById('cancelEditBtn');
const tabButtons = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');
const notification = document.getElementById('notification');
const notificationMessage = document.getElementById('notificationMessage');

let editingStudentId = null;
// Declare a global variable to store students
let allStudents = [];

// Declare a global variable for the active tab ID
let activeTabId = 'list'; // Default to list panel

// Add these variables at the top of the file with other global variables
let enquiriesChart = null;
let studentGrowthChart = null;

// Add logout button to header (ensure this is only added once if script is loaded on multiple pages)
// Consider moving this to dashboard.html and index.html separately if header structure differs
const header = document.querySelector('header');
const logoutBtn = document.createElement('button');
logoutBtn.textContent = 'Logout';
logoutBtn.className = 'logout-btn';
logoutBtn.onclick = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('username');
    window.location.href = 'login.html';
};
if (header && !header.querySelector('.logout-btn')) { // Prevent adding multiple logout buttons
    header.appendChild(logoutBtn);
}

// Show notification function
function showNotification(message, isError = false) {
    notificationMessage.textContent = message;
    notification.className = 'notification' + (isError ? ' error' : '');
    notification.classList.add('show');
    
    // Hide notification after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Function to activate a specific tab
function activateTab(tabId) {
    // Remove active class from all tabs
    document.querySelectorAll('.list-group-item[data-tab]').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Add active class to selected tab
    document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
    
    // Hide all panels
    document.querySelectorAll('.panel').forEach(panel => {
        panel.style.display = 'none';
    });
    
    // Show selected panel
    const selectedPanel = document.getElementById(`${tabId}Panel`);
    if (selectedPanel) {
        selectedPanel.style.display = 'block';
    }
    
    // Load data based on active tab
    if (tabId === 'list') {
        fetchStudents().then(() => {
            initializeSearch(); // Initialize search after students are fetched and displayed
        });
    } else if (tabId === 'payments') {
        fetchPayments();
        loadStudentsForPayment();
    } else if (tabId === 'reports') {
        loadReports();
    } else if (tabId === 'add') {
        resetForm();
        checkForEnquiryData();
    }
}

// Tab switching functionality
document.addEventListener('DOMContentLoaded', () => {
    const tabButtons = document.querySelectorAll('.list-group-item[data-tab]');
    tabButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const tabId = button.getAttribute('data-tab');
            if (tabId === 'teachers') {
                const modal = new bootstrap.Modal(document.getElementById('maintenanceModal'));
                modal.show();
                return;
            }
            activateTab(tabId);
        });
    });

    // Check for panel parameter in URL
    const panelParam = getUrlParameter('panel');
    if (panelParam) {
        activateTab(panelParam);
    } else {
        // Default to list panel if no parameter is provided
        activateTab('list');
    }
});

// Function to get URL parameter
function getUrlParameter(name) {
    name = name.replace(/[[\]]/g, '\\$&');
    const regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)');
    const results = regex.exec(window.location.href);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

// Fetch and display students
async function fetchStudents() {
    console.log('Fetching students...');
    try {
        const response = await fetch(API_URL);
        console.log('Response status:', response.status);
        const students = await response.json();
        console.log('Received students:', students);
        // Store fetched students in the global variable
        allStudents = students;
        displayStudents(students);
    } catch (error) {
        console.error('Error fetching students:', error);
        showNotification('Error fetching students', true);
    }
}

// Function to format text in capital letters
function toUpperCase(text) {
    if (!text) return '';
    return text.toUpperCase();
}

// Display students in table, with filtering
function displayStudents(students) {
    console.log('Displaying students:', students);
    const tbody = document.querySelector('#studentsTable tbody');
    if (!tbody) {
        console.error('Could not find students table body element');
        return;
    }
    tbody.innerHTML = '';
    
    // Sort students alphabetically by name
    students.sort((a, b) => a.name.localeCompare(b.name));
    
    // Update stats
    updateStats(students);
    
    students.forEach(student => {
        console.log('Creating row for student:', student);
        
        // Calculate fee progress
        const totalFee = parseFloat(student.totalCourseFee) || 0;
        const paidAmount = parseFloat(student.paidAmount) || 0;
        const progress = totalFee > 0 ? (paidAmount / totalFee) * 100 : 0;
        
        console.log('Student ID:', student.id, 'Total Fee:', totalFee, 'Paid Amount:', paidAmount, 'Progress:', progress);
        
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>
                <div class="d-flex align-items-center">
                    <div class="flex-shrink-0">
                        <div class="student-avatar bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style="width: 40px; height: 40px;">
                            <i class="fas fa-user"></i>
                        </div>
                    </div>
                    <div class="flex-grow-1 ms-3">
                        <h6 class="mb-0 text-primary cursor-pointer" data-id="${student.id}">${toUpperCase(student.name) || 'N/A'}</h6>
                        <small class="text-muted">ID: STU${String(student.id).padStart(4, '0')}</small>
                    </div>
                </div>
            </td>
            <td>
                <div class="d-flex flex-column">
                    <div class="d-flex align-items-center mb-1">
                        <i class="fas fa-phone text-muted me-2"></i>
                        <span>${student.phoneNumber || 'N/A'}</span>
                    </div>
                    <div class="d-flex align-items-center">
                        <i class="fas fa-envelope text-muted me-2"></i>
                        <span>${toUpperCase(student.email) || 'N/A'}</span>
                    </div>
                </div>
            </td>
            <td>
                <div class="d-flex flex-column">
                    <span class="fw-bold">${toUpperCase(student.courses) || 'N/A'}</span>
                    <small class="text-muted">${student.courseDuration || 'N/A'}</small>
                </div>
            </td>
            <td>
                <div class="d-flex flex-column">
                    <span class="fw-bold">₹${formatCurrency(paidAmount)} / ₹${formatCurrency(totalFee)}</span>
                    <div class="progress" style="height: 5px;">
                        <div class="progress-bar bg-success" role="progressbar" style="width: ${progress}%" aria-valuenow="${progress}" aria-valuemin="0" aria-valuemax="100"></div>
                    </div>
                </div>
            </td>
            <td>
                <div class="btn-group">
                    <button class="btn btn-sm btn-outline-primary" data-id="${student.id}" title="View Profile">
                        <i class="fas fa-user"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-secondary" data-id="${student.id}" title="Edit Student">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-success" data-id="${student.id}" data-name="${toUpperCase(student.name)}" data-phone="${student.phoneNumber}" title="Add Payment">
                        <i class="fas fa-money-bill"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" data-id="${student.id}" title="Delete Student">
                        <i class="fas fa-trash"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-info" data-id="${student.id}" title="View ID Card">
                        <i class="fas fa-id-card"></i>
                    </button>
                </div>
            </td>
        `;
        
        // Add event listeners
        const deleteBtn = row.querySelector('.btn-outline-danger');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => deleteStudent(student.id));
        }
        
        const editBtn = row.querySelector('.btn-outline-secondary');
        if (editBtn) {
            editBtn.addEventListener('click', () => {
                console.log('Edit button clicked for student:', student);
                loadEditStudent(student);
            });
        }

        const paymentBtn = row.querySelector('.btn-outline-success');
        if (paymentBtn) {
            paymentBtn.addEventListener('click', async () => {
                const paymentsTab = document.querySelector('[data-tab="payments"]');
                const paymentFormContainer = document.getElementById('paymentFormContainer');

                // Switch to the payments tab and show the payment form container
                if (paymentsTab) {
                    paymentsTab.click(); // This will trigger activateTab('payments')
                }

                // Ensure the payment form container is visible
                if (paymentFormContainer) {
                    paymentFormContainer.style.display = 'block';
                }

                // Wait for students to be loaded in the payment select (from activateTab)
                // A small delay might be necessary to ensure the dropdown is populated
                await new Promise(resolve => setTimeout(resolve, 150)); // Adjust delay if needed

                const studentSelect = document.getElementById('paymentStudentSelect');
                if (studentSelect) {
                    // Select the clicked student in the dropdown
                    studentSelect.value = student.id;

                    // Trigger change event if needed by other listeners
                    const event = new Event('change');
                    studentSelect.dispatchEvent(event);
                }
            });
        }
        
        const idCardBtn = row.querySelector('.btn-outline-info');
        if (idCardBtn) {
            idCardBtn.addEventListener('click', () => {
                console.log('ID Card button clicked for student:', student);
                showIdCard(student.id);
            });
        }
        
        const viewProfileBtn = row.querySelector('.btn-outline-primary');
        if (viewProfileBtn) {
            viewProfileBtn.addEventListener('click', () => {
                showStudentProfile(student.id);
            });
        }

        const studentNameSpan = row.querySelector('.text-primary.cursor-pointer');
        if (studentNameSpan) {
            studentNameSpan.addEventListener('click', () => {
                showStudentProfile(student.id);
            });
        }
        
        tbody.appendChild(row);
    });
}

// Update stats
function updateStats(students) {
    // Total Students
    const totalStudentsCount = document.getElementById('totalStudentsCount');
    if (totalStudentsCount) {
        totalStudentsCount.textContent = students.length;
    }
    
    // Total Fees
    const totalFees = document.getElementById('totalFees');
    if (totalFees) {
        const total = students.reduce((sum, student) => sum + (parseFloat(student.totalCourseFee) || 0), 0);
        totalFees.textContent = `₹${formatCurrency(total)}`;
    }
    
    // Active Students (students with remaining fees > 0)
    const activeStudents = document.getElementById('activeStudents');
    if (activeStudents) {
        const active = students.filter(student => (parseFloat(student.remainingAmount) || 0) > 0).length;
        activeStudents.textContent = active;
    }
}

// Helper function to format currency values
function formatCurrency(value) {
    if (!value) return '0.00';
    return parseFloat(value).toFixed(2);
}

// Load student data into form for editing
function loadEditStudent(student) {
    try {
        // Switch to the add/edit panel
        const addTab = document.querySelector('[data-tab="add"]');
        if (addTab) {
            addTab.click();
        }

        // Fill the form with student data
        document.getElementById('studentId').value = student.id;
        document.getElementById('name').value = student.name || '';
        document.getElementById('fatherName').value = student.fatherName || '';
        document.getElementById('motherName').value = student.motherName || '';
        document.getElementById('dob').value = student.dob || '';
        document.getElementById('email').value = student.email || '';
        document.getElementById('phoneNumber').value = student.phoneNumber || '';
        document.getElementById('address').value = student.address || '';
        document.getElementById('courses').value = student.courses || '';
        document.getElementById('courseDuration').value = student.courseDuration || '';
        document.getElementById('totalCourseFee').value = student.totalCourseFee || '';

        editingStudentId = student.id;
        submitBtn.textContent = 'Update Student';
        cancelEditBtn.style.display = 'inline-block';

        // Scroll to the form
        // Add a small delay to ensure the element is in the DOM
        setTimeout(() => {
            const addStudentSection = document.querySelector('.add-student-section');
            if (addStudentSection) {
                addStudentSection.scrollIntoView({ behavior: 'smooth' });
            } else {
                console.error('Add student section not found after tab switch');
            }
        }, 100); // Adjust delay if needed
        
        showNotification('Edit mode activated. Please update the student details.');
    } catch (error) {
        console.error('Error loading student for edit:', error);
        showNotification('Error loading student details for editing', true);
    }
}

// Cancel editing
document.getElementById('cancelEditBtn').addEventListener('click', () => {
    resetForm();
});

// Reset form to add new student mode
function resetForm() {
    document.getElementById('studentForm').reset();
    document.getElementById('studentId').value = '';
    editingStudentId = null;
    submitBtn.textContent = 'Add Student';
    cancelEditBtn.style.display = 'none';
}

// Handle form submit
studentForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const studentData = {
        name: toUpperCase(document.getElementById('name').value),
        fatherName: toUpperCase(document.getElementById('fatherName').value),
        motherName: toUpperCase(document.getElementById('motherName').value),
        dob: document.getElementById('dob').value,
        email: toUpperCase(document.getElementById('email').value),
        phoneNumber: document.getElementById('phoneNumber').value,
        address: toUpperCase(document.getElementById('address').value),
        courses: toUpperCase(document.getElementById('courses').value),
        courseDuration: document.getElementById('courseDuration').value,
        totalCourseFee: parseFloat(document.getElementById('totalCourseFee').value) || 0,
        paidAmount: 0,
        remainingAmount: parseFloat(document.getElementById('totalCourseFee').value) || 0,
        remarks: document.getElementById('remarks').value || ''
    };

    try {
        if (editingStudentId) {
            // Update existing student
            const response = await fetch(`${API_URL}/${editingStudentId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(studentData)
            });
            
            if (!response.ok) {
                throw new Error('Failed to update student');
            }
            
            resetForm();
            fetchStudents();
            showNotification('Student updated successfully!');
        } else {
            // Add new student
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(studentData)
            });
            
            if (!response.ok) {
                throw new Error('Failed to add student');
            }
            
            resetForm();
            fetchStudents();
            showNotification('Student added successfully!');

            // Check if the form was from an enquiry AND the checkbox is checked
            const enquiryData = localStorage.getItem('enquiryToStudent');
            const markConfirmedCheckbox = document.getElementById('markEnquiryConfirmed');

            if (enquiryData && markConfirmedCheckbox && markConfirmedCheckbox.checked) {
                const enquiry = JSON.parse(enquiryData);
                try {
                    const convertResponse = await fetch(`http://localhost:4455/api/enquiries/${enquiry.id}/convert`, {
                        method: 'POST'
                    });

                    if (convertResponse.ok) {
                        console.log(`Enquiry ${enquiry.id} marked as converted successfully.`);
                        showNotification('Enquiry status updated to Confirmed!', false);

                        if (window.fetchEnquiries) {
                            window.fetchEnquiries();
                        } else {
                            console.warn('fetchEnquiries function not found in this window. Cannot auto-refresh enquiry list.');
                        }
                    } else {
                        const errorText = await convertResponse.text();
                        console.error(`Failed to mark enquiry ${enquiry.id} as converted:`, errorText);
                        showNotification(`Failed to update enquiry status: ${errorText || convertResponse.statusText}`, true);
                    }
                } catch (error) {
                    console.error(`Error calling /convert endpoint for enquiry ${enquiry.id}:`, error);
                    showNotification(`Error calling update enquiry status API: ${error.message}`, true);
                } finally {
                     localStorage.removeItem('enquiryToStudent');
                }
            } else if (enquiryData) {
                 // If the form was from an enquiry but the checkbox was NOT checked
                 localStorage.removeItem('enquiryToStudent');
            }
        }
    } catch (error) {
        showNotification('Error: ' + error.message, true);
        console.error(error);
    }
});

// Delete student
async function deleteStudent(id) {
    if (!confirm('Are you sure you want to delete this student?')) return;
    try {
        await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        fetchStudents();
        showNotification('Student deleted successfully!');
    } catch (error) {
        showNotification('Error deleting student', true);
        console.error(error);
    }
}

// Enhanced search functionality
function filterStudents(students, searchTerm, filterType) {
    console.log('Filtering students with term:', searchTerm, 'type:', filterType);
    console.log('Students to filter:', students);
    if (!searchTerm) return students;
    
    searchTerm = searchTerm.toLowerCase().trim();
    
    return students.filter(student => {
        switch (filterType) {
            case 'name':
                return student.name?.toLowerCase().includes(searchTerm);
            case 'id':
                return `stu${String(student.id).padStart(4, '0')}`.includes(searchTerm);
            case 'course':
                return student.courses?.toLowerCase().includes(searchTerm);
            case 'phone':
                return student.phoneNumber?.includes(searchTerm);
            case 'email':
                return student.email?.toLowerCase().includes(searchTerm);
            case 'all':
            default:
                return (
                    student.name?.toLowerCase().includes(searchTerm) ||
                    `stu${String(student.id).padStart(4, '0')}`.includes(searchTerm) ||
                    student.courses?.toLowerCase().includes(searchTerm) ||
                    student.phoneNumber?.includes(searchTerm) ||
                    student.email?.toLowerCase().includes(searchTerm)
                );
        }
    });
}

// Initialize search functionality
function initializeSearch() {
    console.log('Initializing search...');
    const searchInput = document.getElementById('searchInput');
    const searchFilter = document.getElementById('searchFilter');
    const clearSearchBtn = document.querySelector('.clear-search');
    
    if (!searchInput) {
        console.error('Search input element not found');
        return;
    }

    let searchTimeout;
    
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            const searchTerm = e.target.value;
            const filterType = searchFilter ? searchFilter.value : 'all';
            console.log('Search input:', searchTerm, 'Filter type:', filterType, 'All students:', allStudents);
            const filteredStudents = filterStudents(allStudents, searchTerm, filterType);
            console.log('Filtered students:', filteredStudents);
            displayStudents(filteredStudents);
            
            if (clearSearchBtn) {
                clearSearchBtn.style.display = searchTerm ? 'flex' : 'none';
            }
        }, 300); // Debounce search for better performance
    });
    
    if (searchFilter) {
        searchFilter.addEventListener('change', () => {
            const searchTerm = searchInput.value;
            const filterType = searchFilter.value;
            const filteredStudents = filterStudents(allStudents, searchTerm, filterType);
            displayStudents(filteredStudents);
        });
    }
    
    if (clearSearchBtn) {
        clearSearchBtn.addEventListener('click', () => {
            searchInput.value = '';
            clearSearchBtn.style.display = 'none';
            displayStudents(allStudents);
        });

        clearSearchBtn.style.display = 'none';
    }
}

// Fetch payments
async function fetchPayments() {
    console.log('Fetching payments...');
    try {
        const response = await fetch('http://localhost:4456/api/payments');
        console.log('Payments API response status:', response.status);
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error response:', errorText);
            throw new Error(`Failed to fetch payments: ${response.status} - ${errorText}`);
        }
        const payments = await response.json();
        console.log('Raw payments data:', JSON.stringify(payments, null, 2));
        
        // Update payments table
        const paymentsTableBody = document.querySelector('#paymentsTable tbody');
        if (!paymentsTableBody) {
            console.error('Payments table body element not found');
            return;
        }

        if (!Array.isArray(payments)) {
            console.error('Payments data is not an array:', payments);
            showNotification('Invalid payments data received', true);
            return;
        }

        console.log('Mapping payments to table rows...');
        paymentsTableBody.innerHTML = payments.map(payment => {
            console.log('Processing payment:', payment);
            
            // Try different possible date field names
            const dateField = payment.createdAt || payment.created_at || payment.date || payment.paymentDate;
            console.log('Date field value:', dateField);
            
            // Format the date properly
            let paymentDate = 'N/A';
            if (dateField) {
                try {
                    const date = new Date(dateField);
                    console.log('Parsed date:', date);
                    if (!isNaN(date.getTime())) {
                        paymentDate = date.toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                        });
                        console.log('Formatted date:', paymentDate);
                    }
                } catch (error) {
                    console.error('Error formatting date:', error);
                }
            } else {
                // If no date field is found, use current date
                paymentDate = new Date().toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                });
            }
            
            return `
            <tr>
                <td>${payment.id || 'N/A'}</td>
                <td>${payment.student?.name || 'N/A'}</td>
                <td>₹${formatCurrency(payment.amount)}</td>
                <td>${payment.paymentMethod || 'N/A'}</td>
                <td>${paymentDate}</td>
                <td>
                    <span class="badge ${payment.status === 'COMPLETED' ? 'bg-success' : 'bg-warning'}">
                        ${payment.status || 'PENDING'}
                    </span>
                </td>
                <td>
                    <div class="btn-group">
                        <button class="btn btn-sm btn-outline-primary" onclick="viewPayment(${payment.id})">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-info" onclick="downloadReceipt(${payment.id})">
                            <i class="fas fa-download"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="deletePayment(${payment.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
        }).join('');
    } catch (error) {
        console.error('Error fetching payments:', error);
        showNotification('Error loading payments: ' + error.message, true);
    }
}

// Load students for payment form
async function loadStudentsForPayment() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error(`Failed to fetch students: ${response.status}`);
        }
        const students = await response.json();
        
        const studentSelect = document.getElementById('paymentStudentSelect');
        if (studentSelect) {
            studentSelect.innerHTML = `
                <option value="">Select Student</option>
                ${students.map(student => `
                    <option value="${student.id}">${student.name} (ID: STU${String(student.id).padStart(4, '0')})</option>
                `).join('')}
            `;
        }
    } catch (error) {
        console.error('Error loading students for payment:', error);
        showNotification('Error loading students', true);
    }
}

// Reports functionality
async function loadReports() {
    try {
        console.log('Loading reports...');
        
        // Fetch enquiries
        const enquiriesResponse = await fetch('http://localhost:4455/api/enquiries');
        if (!enquiriesResponse.ok) {
            throw new Error(`Failed to fetch enquiries: ${enquiriesResponse.status}`);
        }
        const enquiries = await enquiriesResponse.json();
        console.log('Fetched enquiries:', enquiries);
        
        // Set current month as default in selector
        const currentMonth = new Date().getMonth();
        const monthSelect = document.getElementById('enquiryMonthSelect');
        if (!monthSelect) {
            console.error('Month select element not found');
            return;
        }
        monthSelect.value = currentMonth;
        
        // Load initial month's data
        loadMonthEnquiries(enquiries, currentMonth);
        
        // Add event listener for month change
        monthSelect.addEventListener('change', (e) => {
            loadMonthEnquiries(enquiries, parseInt(e.target.value));
        });
        
        // Get pending enquiries
        const pendingEnquiries = enquiries.filter(enquiry => 
            enquiry.status === 'PENDING' || enquiry.status === 'pending'
        );
        console.log('Pending enquiries:', pendingEnquiries);
        
        // Update pending enquiries count
        const pendingEnquiriesCount = document.getElementById('pendingEnquiries');
        if (pendingEnquiriesCount) {
            pendingEnquiriesCount.textContent = pendingEnquiries.length;
        }
        
        // Update pending enquiries list
        const pendingEnquiriesList = document.querySelector('#pendingEnquiriesList tbody');
        if (pendingEnquiriesList) {
            if (pendingEnquiries.length === 0) {
                pendingEnquiriesList.innerHTML = `
                    <tr>
                        <td colspan="4" class="text-center">No pending enquiries</td>
                    </tr>
                `;
            } else {
                pendingEnquiriesList.innerHTML = pendingEnquiries.map(enquiry => `
                    <tr>
                        <td>${enquiry.name || 'N/A'}</td>
                        <td>${enquiry.course || 'N/A'}</td>
                        <td>${enquiry.phoneNumber || 'N/A'}</td>
                        <td>${enquiry.createdAt ? new Date(enquiry.createdAt).toLocaleDateString() : 'N/A'}</td>
                    </tr>
                `).join('');
            }
        }
        
        // Fetch students for pending fees
        const studentsResponse = await fetch(API_URL);
        if (!studentsResponse.ok) {
            throw new Error(`Failed to fetch students: ${studentsResponse.status}`);
        }
        const students = await studentsResponse.json();
        
        // Calculate total pending fees
        const totalPendingFees = students.reduce((total, student) => {
            return total + (parseFloat(student.remainingAmount) || 0);
        }, 0);
        
        const totalPendingFeesElement = document.getElementById('totalPendingFees');
        if (totalPendingFeesElement) {
            totalPendingFeesElement.textContent = `₹${totalPendingFees.toFixed(2)}`;
        }
        
        // Update pending fees list
        const pendingFeesList = document.getElementById('pendingFeesList');
        if (pendingFeesList) {
            const studentsWithPendingFees = students
                .filter(student => (parseFloat(student.remainingAmount) || 0) > 0)
                .sort((a, b) => (parseFloat(b.remainingAmount) || 0) - (parseFloat(a.remainingAmount) || 0))
                .slice(0, 5);
                
            if (studentsWithPendingFees.length === 0) {
                pendingFeesList.innerHTML = `
                    <div class="report-list-item">
                        <span class="item-name">No pending fees</span>
                    </div>
                `;
            } else {
                pendingFeesList.innerHTML = studentsWithPendingFees.map(student => `
                    <div class="report-list-item">
                        <span class="item-name">${student.name || 'N/A'}</span>
                        <span class="item-value">₹${(parseFloat(student.remainingAmount) || 0).toFixed(2)}</span>
                    </div>
                `).join('');
            }
        }
        
        // Update total students count
        const totalStudentsElement = document.getElementById('totalStudents');
        if (totalStudentsElement) {
            totalStudentsElement.textContent = students.length;
        }
        
        // Initialize student growth chart
        initializeStudentGrowthChart(students);
        
    } catch (error) {
        console.error('Error loading reports:', error);
        showNotification('Error loading reports: ' + error.message, true);
    }
}

function loadMonthEnquiries(enquiries, month) {
    console.log('Loading enquiries for month:', month);
    const currentYear = new Date().getFullYear();
    const monthEnquiries = enquiries.filter(enquiry => {
        const enquiryDate = new Date(enquiry.createdAt);
        return enquiryDate.getMonth() === month && 
               enquiryDate.getFullYear() === currentYear;
    });
    console.log('Filtered enquiries for month:', monthEnquiries);
    
    // Update count
    const countElement = document.getElementById('currentMonthEnquiries');
    if (countElement) {
        countElement.textContent = monthEnquiries.length;
    }
    
    // Update chart
    initializeEnquiriesChart(monthEnquiries);
}

function initializeEnquiriesChart(enquiries) {
    console.log('Initializing enquiries chart with data:', enquiries);
    const ctx = document.getElementById('enquiriesChart');
    if (!ctx) {
        console.error('Enquiries chart canvas not found');
        return;
    }
    
    // Group enquiries by date
    const enquiriesByDate = {};
    enquiries.forEach(enquiry => {
        if (enquiry.createdAt) {
            const date = new Date(enquiry.createdAt).toLocaleDateString();
            enquiriesByDate[date] = (enquiriesByDate[date] || 0) + 1;
        }
    });
    console.log('Enquiries grouped by date:', enquiriesByDate);
    
    // Sort dates
    const sortedDates = Object.keys(enquiriesByDate).sort((a, b) => new Date(a) - new Date(b));
    
    // Destroy existing chart if it exists
    if (enquiriesChart instanceof Chart) {
        enquiriesChart.destroy();
    }
    
    // Create new chart
    enquiriesChart = new Chart(ctx.getContext('2d'), {
        type: 'line',
        data: {
            labels: sortedDates,
            datasets: [{
                label: 'Enquiries',
                data: sortedDates.map(date => enquiriesByDate[date]),
                borderColor: '#1976d2',
                backgroundColor: 'rgba(25, 118, 210, 0.1)',
                tension: 0.4,
                fill: true
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
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

function initializeStudentGrowthChart(students) {
    console.log('Initializing student growth chart with data:', students);
    const ctx = document.getElementById('studentGrowthChart');
    if (!ctx) {
        console.error('Student growth chart canvas not found');
        return;
    }
    
    // Group students by month
    const studentsByMonth = {};
    students.forEach(student => {
        if (student.createdAt) {
            const date = new Date(student.createdAt);
            const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
            studentsByMonth[monthYear] = (studentsByMonth[monthYear] || 0) + 1;
        }
    });
    console.log('Students grouped by month:', studentsByMonth);
    
    // Sort months chronologically
    const sortedMonths = Object.keys(studentsByMonth).sort((a, b) => {
        const [monthA, yearA] = a.split('/');
        const [monthB, yearB] = b.split('/');
        return new Date(yearA, monthA - 1) - new Date(yearB, monthB - 1);
    });
    
    // Destroy existing chart if it exists
    if (studentGrowthChart instanceof Chart) {
        studentGrowthChart.destroy();
    }
    
    // Create new chart
    studentGrowthChart = new Chart(ctx.getContext('2d'), {
        type: 'bar',
        data: {
            labels: sortedMonths,
            datasets: [{
                label: 'New Students',
                data: sortedMonths.map(month => studentsByMonth[month]),
                backgroundColor: '#42a5f5',
                borderRadius: 5
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
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

// Function to display student profile in a modal
async function showStudentProfile(studentId) {
    console.log('Showing profile for student ID:', studentId);
    const student = allStudents.find(s => s.id === studentId);
    const modal = document.getElementById('studentProfileModal');
    const profileContent = document.getElementById('studentProfileContent');

    if (!student || !modal || !profileContent) {
        console.error('Could not find student data or modal elements');
        showNotification('Error loading student profile', true);
        return;
    }

    // Format student details for display
    profileContent.innerHTML = `
        <div class="modal-header">
            <h5 class="modal-title">Student Profile</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
            <div class="row">
                <div class="col-md-6 mb-4">
                    <div class="card h-100">
                        <div class="card-header bg-primary text-white">
                            <h6 class="mb-0"><i class="fas fa-user me-2"></i>Personal Information</h6>
                        </div>
                        <div class="card-body">
                            <p class="mb-2"><strong>Name:</strong> ${toUpperCase(student.name) || 'N/A'}</p>
                            <p class="mb-2"><strong>Student ID:</strong> STU${String(student.id).padStart(4, '0')}</p>
                            <p class="mb-2"><strong>Father's Name:</strong> ${toUpperCase(student.fatherName) || 'N/A'}</p>
                            <p class="mb-2"><strong>Mother's Name:</strong> ${toUpperCase(student.motherName) || 'N/A'}</p>
                            <p class="mb-0"><strong>Date of Birth:</strong> ${student.dob || 'N/A'}</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-6 mb-4">
                    <div class="card h-100">
                        <div class="card-header bg-info text-white">
                            <h6 class="mb-0"><i class="fas fa-address-card me-2"></i>Contact Information</h6>
                        </div>
                        <div class="card-body">
                            <p class="mb-2"><strong>Phone Number:</strong> ${student.phoneNumber || 'N/A'}</p>
                            <p class="mb-2"><strong>Email Address:</strong> ${toUpperCase(student.email) || 'N/A'}</p>
                            <p class="mb-0"><strong>Address:</strong> ${student.address || 'N/A'}</p>
                        </div>
                    </div>
                </div>
            </div>
            <div class="row">
                <div class="col-md-6 mb-4">
                    <div class="card h-100">
                        <div class="card-header bg-success text-white">
                            <h6 class="mb-0"><i class="fas fa-graduation-cap me-2"></i>Course Information</h6>
                        </div>
                        <div class="card-body">
                            <p class="mb-2"><strong>Course(s):</strong> ${toUpperCase(student.courses) || 'N/A'}</p>
                            <p class="mb-2"><strong>Course Duration:</strong> ${student.courseDuration || 'N/A'}</p>
                            <p class="mb-0"><strong>Total Course Fee:</strong> ₹${formatCurrency(student.totalCourseFee) || 'N/A'}</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-6 mb-4">
                    <div class="card h-100">
                        <div class="card-header bg-warning text-dark">
                            <h6 class="mb-0"><i class="fas fa-money-bill-wave me-2"></i>Fee Status</h6>
                        </div>
                        <div class="card-body">
                            <p class="mb-2"><strong>Paid Amount:</strong> ₹${formatCurrency(student.paidAmount) || 'N/A'}</p>
                            <p class="mb-2"><strong>Remaining Amount:</strong> ₹${formatCurrency(student.remainingAmount) || 'N/A'}</p>
                            <div class="progress mt-3" style="height: 10px;">
                                <div class="progress-bar bg-success" role="progressbar" 
                                     style="width: ${(parseFloat(student.paidAmount) / parseFloat(student.totalCourseFee)) * 100 || 0}%" 
                                     aria-valuenow="${(parseFloat(student.paidAmount) / parseFloat(student.totalCourseFee)) * 100 || 0}" 
                                     aria-valuemin="0" 
                                     aria-valuemax="100">
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            <button type="button" class="btn btn-primary" onclick="showIdCard(${student.id})">
                <i class="fas fa-id-card me-2"></i>View ID Card
            </button>
        </div>
    `;

    // Initialize Bootstrap modal
    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();
}

// Add these new functions for ID card functionality
function showIdCard(studentId) {
    // Use the global allStudents variable
    const student = allStudents.find(s => s.id === studentId);
    
    if (!student) {
        console.error('Student not found for ID card:', studentId);
        showNotification('Student data not found for ID card', true);
        return;
    }

    console.log('Found student for ID card:', student);
    
    // Calculate valid till date based on course duration
    const validTill = calculateValidTillDate(student.courseDuration);
    
    // Update ID card content
    document.getElementById('idCardName').textContent = student.name;
    document.getElementById('idCardId').textContent = `STU${String(student.id).padStart(4, '0')}`;
    document.getElementById('idCardCourse').textContent = student.courses;
    document.getElementById('idCardDuration').textContent = student.courseDuration;
    document.getElementById('idCardValidTill').textContent = validTill;
    
    // Show modal
    const modal = document.getElementById('idCardModal');
    // Initialize Bootstrap modal
    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();
}

function calculateValidTillDate(duration) {
    const today = new Date();
    let months = 0;
    
    if (duration.includes('Month')) {
        months = parseInt(duration);
    } else if (duration.includes('Year')) {
        months = parseInt(duration) * 12;
    }
    
    const validTill = new Date(today.setMonth(today.getMonth() + months));
    return validTill.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

// Add event listeners for ID card modal
document.getElementById('downloadIdCard').addEventListener('click', async () => {
    const idCard = document.querySelector('.id-card');
    
    try {
        // Use html2canvas to capture the ID card
        const canvas = await html2canvas(idCard, {
            scale: 2,
            useCORS: true,
            logging: false
        });
        
        // Convert canvas to blob
        canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `student_id_card_${Date.now()}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }, 'image/png');
    } catch (error) {
        console.error('Error generating ID card:', error);
        showNotification('Error generating ID card', 'error');
    }
});

document.getElementById('shareIdCard').addEventListener('click', async () => {
    const idCard = document.querySelector('.id-card');
    
    try {
        // Use html2canvas to capture the ID card
        const canvas = await html2canvas(idCard, {
            scale: 2,
            useCORS: true,
            logging: false
        });
        
        // Convert canvas to blob
        canvas.toBlob((blob) => {
            const file = new File([blob], 'student_id_card.png', { type: 'image/png' });
            
            if (navigator.share) {
                navigator.share({
                    title: 'Student ID Card',
                    text: 'Check out this student ID card',
                    files: [file]
                }).catch(error => {
                    console.error('Error sharing:', error);
                    showNotification('Error sharing ID card', 'error');
                });
            } else {
                showNotification('Sharing is not supported on this browser', 'error');
            }
        }, 'image/png');
    } catch (error) {
        console.error('Error sharing ID card:', error);
        showNotification('Error sharing ID card', 'error');
    }
});

// Add html2canvas library to your HTML file
const html2canvasScript = document.createElement('script');
html2canvasScript.src = 'https://html2canvas.hertzen.com/dist/html2canvas.min.js';
document.head.appendChild(html2canvasScript);

// Payment form submission
document.getElementById('paymentForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const form = e.target;
    if (!form.checkValidity()) {
        e.stopPropagation();
        form.classList.add('was-validated');
        return;
    }
    
    const formData = {
        studentId: document.getElementById('paymentStudentSelect').value,
        amount: parseFloat(document.getElementById('paymentAmount').value),
        paymentMethod: document.getElementById('paymentMethod').value,
        description: document.getElementById('paymentDescription').value,
        paymentDate: new Date().toISOString()
    };
    
    try {
        const response = await fetch('http://localhost:4456/api/payments', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        if (!response.ok) {
            throw new Error('Failed to add payment');
        }
        
        // Hide payment form
        document.getElementById('paymentFormContainer').style.display = 'none';
        
        // Refresh payments list
        fetchPayments();
        
        // Also refresh the student list to show updated fee info
        fetchStudents();
        
        // Show success notification
        showNotification('Payment added successfully');
        
        // Reset form
        form.reset();
        form.classList.remove('was-validated');
        
    } catch (error) {
        console.error('Error adding payment:', error);
        showNotification('Error adding payment: ' + error.message, true);
    }
});

// Add payment button click handler
document.getElementById('addPaymentBtn')?.addEventListener('click', () => {
    const paymentFormContainer = document.getElementById('paymentFormContainer');
    if (paymentFormContainer) {
        paymentFormContainer.style.display = paymentFormContainer.style.display === 'none' ? 'block' : 'none';
        if (paymentFormContainer.style.display === 'block') {
            loadStudentsForPayment();
        }
    }
});

// Cancel payment button click handler
document.getElementById('cancelPaymentBtn')?.addEventListener('click', () => {
    const paymentFormContainer = document.getElementById('paymentFormContainer');
    const paymentForm = document.getElementById('paymentForm');
    if (paymentFormContainer && paymentForm) {
        paymentFormContainer.style.display = 'none';
        paymentForm.reset();
        paymentForm.classList.remove('was-validated');
    }
});

// Payment search functionality
document.getElementById('paymentSearchInput')?.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const rows = document.querySelectorAll('#paymentsTable tbody tr');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
    });
});

// View payment details
async function viewPayment(paymentId) {
    try {
        console.log('Fetching payment details for ID:', paymentId);
        const response = await fetch(`http://localhost:4456/api/payments/${paymentId}`);
        console.log('View payment response status:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error response:', errorText);
            throw new Error(`Failed to fetch payment details: ${response.status} - ${errorText}`);
        }
        
        const payment = await response.json();
        console.log('Payment details:', payment);
        
        // Format the date properly
        let paymentDate = 'N/A';
        const dateField = payment.createdAt || payment.created_at || payment.date || payment.paymentDate;
        if (dateField) {
            try {
                const date = new Date(dateField);
                if (!isNaN(date.getTime())) {
                    paymentDate = date.toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                    });
                }
            } catch (error) {
                console.error('Error formatting date:', error);
            }
        } else {
            paymentDate = new Date().toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        }
        
        // Show payment details in a modal or alert
        alert(`
            Payment Details:
            Receipt No: ${payment.id || 'N/A'}
            Student: ${payment.student?.name || 'N/A'}
            Amount: ₹${formatCurrency(payment.amount)}
            Method: ${payment.paymentMethod || 'N/A'}
            Date: ${paymentDate}
            Status: ${payment.status || 'PENDING'}
            Description: ${payment.description || 'N/A'}
        `);
    } catch (error) {
        console.error('Error viewing payment:', error);
        showNotification('Error viewing payment details: ' + error.message, true);
    }
}

// Delete payment
async function deletePayment(paymentId) {
    if (!confirm('Are you sure you want to delete this payment?')) {
        return;
    }
    
    try {
        const response = await fetch(`http://localhost:4456/api/payments/${paymentId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error('Failed to delete payment');
        }
        
        // Refresh payments list
        fetchPayments();
        
        // Show success notification
        showNotification('Payment deleted successfully');
        
    } catch (error) {
        console.error('Error deleting payment:', error);
        showNotification('Error deleting payment: ' + error.message, true);
    }
}

// Placeholder function for downloading receipt
async function downloadReceipt(paymentId) {
    console.log('Download receipt clicked for payment ID:', paymentId);
    try {
        const response = await fetch(`http://localhost:4456/api/payments/${paymentId}`);
        if (!response.ok) {
            throw new Error('Failed to fetch payment details for receipt');
        }
        const payment = await response.json();
        console.log('Fetched payment data for receipt:', payment);

        // Format the date properly
        let paymentDate = 'N/A';
        const dateField = payment.createdAt || payment.created_at || payment.date || payment.paymentDate;
        if (dateField) {
            try {
                const date = new Date(dateField);
                if (!isNaN(date.getTime())) {
                    paymentDate = date.toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                    });
                }
            } catch (error) {
                console.error('Error formatting date:', error);
            }
        } else {
            paymentDate = new Date().toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        }

        // Generate simple HTML for the receipt
        const receiptHtml = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Payment Receipt - ${payment.id}</title>
                <style>
                    body { font-family: 'Arial', sans-serif; line-height: 1.6; margin: 0; padding: 0; background-color: #f8f9fa; }
                    .receipt-container { max-width: 600px; margin: 40px auto; padding: 30px; background-color: #fff; border-radius: 8px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); }
                    .receipt-header { text-align: center; margin-bottom: 25px; padding-bottom: 20px; border-bottom: 2px solid #e9ecef; }
                    .receipt-header h2 { margin: 0 0 8px 0; color: #343a40; font-size: 1.8em; }
                    .receipt-header p { margin: 0; color: #6c757d; font-size: 1em; }
                    .receipt-details { margin-bottom: 25px; padding-bottom: 20px; border-bottom: 1px dashed #ced4da; }
                    .receipt-details p { margin-bottom: 12px; display: flex; justify-content: space-between; padding: 5px 0; }
                    .receipt-details p strong { font-weight: 600; color: #495057; }
                    .receipt-footer { text-align: center; padding-top: 20px; font-size: 0.9em; color: #868e96; }
                    .amount { font-size: 1.3em; font-weight: bold; color: #28a745; }
                </style>
            </head>
            <body>
                <div class="receipt-container">
                    <div class="receipt-header">
                        <h2>Saha Institute of Management & Technology</h2>
                        <p>Payment Receipt</p>
                        <p>House No. 2219, Sector 3, Faridabad, Haryana | Phone: 9871260599 | Email: sahaedu@gmail.com</p>
                    </div>
                    
                    <div class="receipt-details">
                        <p><strong>Receipt No:</strong> <span>${payment.id || 'N/A'}</span></p>
                        <p><strong>Date:</strong> <span>${paymentDate}</span></p>
                        <p><strong>Student Name:</strong> <span>${payment.student?.name || 'N/A'}</span></p>
                        <p><strong>Amount Paid:</strong> <span class="amount">₹${formatCurrency(payment.amount) || 'N/A'}</span></p>
                        <p><strong>Payment Method:</strong> <span>${payment.paymentMethod || 'N/A'}</span></p>
                        <p><strong>Description:</strong> <span>${payment.description || 'N/A'}</span></p>
                    </div>
                    
                    <div class="receipt-footer">
                        <p>Thank you for your payment.</p>
                        <p>&copy; ${new Date().getFullYear()} Saha Institute of Management & Technology</p>
                    </div>
                 </div>
            </body>
            </html>
        `;

        // Open in a new window
        const newWindow = window.open('', '_blank');
        if (newWindow) {
            newWindow.document.write(receiptHtml);
            newWindow.document.close(); // Close the document stream
        } else {
            showNotification('Could not open new window. Please allow pop-ups.', true);
        }

    } catch (error) {
        console.error('Error downloading receipt:', error);
        showNotification('Error generating receipt: ' + error.message, true);
    }
}

// Check for enquiry data when loading add student panel
function checkForEnquiryData() {
    console.log('Checking for enquiry data in localStorage...');
    const enquiryData = localStorage.getItem('enquiryToStudent');
    
    if (enquiryData) {
        console.log('Enquiry data found in localStorage:', enquiryData);
        const data = JSON.parse(enquiryData);
        console.log('Parsed enquiry data:', data);
        
        // Add a small delay to ensure the form is ready
        setTimeout(() => {
            // Pre-fill the form
            const phoneNumberInput = document.getElementById('phoneNumber');
            console.log('Phone number input element:', phoneNumberInput);
            if (phoneNumberInput) {
                phoneNumberInput.value = data.phoneNumber || '';
                console.log('Phone number input value after setting:', phoneNumberInput.value);
            }
            
            const coursesSelect = document.getElementById('courses');
            console.log('Courses select element:', coursesSelect);
            if (coursesSelect) {
                coursesSelect.value = data.courses || '';
                console.log('Courses select value after setting:', coursesSelect.value);
            }
            
            const courseDurationSelect = document.getElementById('courseDuration');
            console.log('Course duration select element:', courseDurationSelect);
            if (courseDurationSelect) {
                courseDurationSelect.value = data.courseDuration || '';
                console.log('Course duration select value after setting:', courseDurationSelect.value);
            }
            
            const remarksTextarea = document.getElementById('remarks');
            console.log('Remarks textarea element:', remarksTextarea);
            if (remarksTextarea) {
                remarksTextarea.value = data.remarks || '';
                console.log('Remarks textarea value after setting:', remarksTextarea.value);
            }
            
            // Also set the name field if available
            const nameInput = document.getElementById('name');
            if (nameInput && data.name) {
                nameInput.value = data.name;
                console.log('Name input value after setting:', nameInput.value);
            }
            
            // Clear the stored data
            localStorage.removeItem('enquiryToStudent');
            console.log('Enquiry data removed from localStorage.');
            
            // Show notification
            showNotification('Enquiry details pre-filled in the form');
        }, 100); // 100ms delay
    } else {
        console.log('No enquiry data found in localStorage.');
    }
}

const logoutContainer = document.getElementById('logoutContainer');
if (logoutContainer && !logoutContainer.querySelector('.logout-btn')) { // Prevent adding multiple logout buttons
    logoutContainer.appendChild(logoutBtn);
}
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

const API_URL = 'http://192.168.0.100:8080/api/students'; // Adjust as needed

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
    // Update active tab button
    tabButtons.forEach(btn => {
        if (btn.getAttribute('data-tab') === tabId) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    // Show corresponding content
    tabContents.forEach(content => {
        if (content) {
            content.classList.remove('active');
            if (content.id === `${tabId}-panel`) {
                content.classList.add('active');
            }
        }
    });
    activeTabId = tabId; // Update the active tab ID
}

// Tab switching functionality (Update event listener)
tabButtons.forEach(button => {
    button.addEventListener('click', (e) => {
        const tabId = button.getAttribute('data-tab');
        if (tabId === 'teachers') {
            const modal = document.getElementById('maintenanceModal');
            if (modal) {
                modal.style.display = 'block';
            }
            return;
        }
        activateTab(tabId); // Use the new activateTab function
    });
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

// On page load, check for panel parameter and activate the corresponding tab
document.addEventListener('DOMContentLoaded', () => {
    const panelParam = getUrlParameter('panel');
    if (panelParam) {
        activateTab(panelParam);
    } else {
        // If no panel parameter is provided, do not activate any tab by default.
        // The index.html page will appear empty until a panel is selected from the dashboard.
        // Default to the list panel if no parameter is provided
        // activateTab(activeTabId);
    }

    // Initial data fetch based on active tab (if needed)
    // This logic should ideally be called within the activateTab function
    // whenever a tab becomes active, not just on DOMContentLoaded.
    // Example: if (activeTabId === 'list') { fetchStudents(); }
    // You might need to add similar logic for other tabs when they become active initially
});

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
        const row = document.createElement('tr');
        
        // Calculate fee progress
        const totalFee = parseFloat(student.totalCourseFee) || 0;
        const paidAmount = parseFloat(student.paidAmount) || 0;
        const progress = totalFee > 0 ? (paidAmount / totalFee) * 100 : 0;
        
        row.innerHTML = `
            <td>
                <div class="student-info">
                    <div class="student-avatar">
                        <i class="fas fa-user"></i>
                    </div>
                    <div class="student-details">
                        <span class="student-name clickable" data-id="${student.id}">${toUpperCase(student.name) || 'N/A'}</span>
                        <span class="student-id">ID: STU${String(student.id).padStart(4, '0')}</span>
                    </div>
                </div>
            </td>
            <td>
                <div class="contact-info">
                    <div class="contact-item">
                        <i class="fas fa-phone"></i>
                        <span>${student.phoneNumber || 'N/A'}</span>
                    </div>
                    <div class="contact-item">
                        <i class="fas fa-envelope"></i>
                        <span>${toUpperCase(student.email) || 'N/A'}</span>
                    </div>
                </div>
            </td>
            <td>
                <div class="course-info">
                    <span class="course-name">${toUpperCase(student.courses) || 'N/A'}</span>
                    <span class="course-duration">${student.courseDuration || 'N/A'}</span>
                </div>
            </td>
            <td>
                <div class="fee-status">
                    <span class="fee-amount">₹${formatCurrency(paidAmount)} / ₹${formatCurrency(totalFee)}</span>
                    <div class="fee-progress">
                        <div class="fee-progress-bar" style="width: ${progress}%"></div>
                    </div>
                </div>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn view-profile-btn" data-id="${student.id}" title="View Profile">
                        <i class="fas fa-user"></i> View Profile
                    </button>
                    <button class="action-btn edit-btn" data-id="${student.id}" title="Edit Student">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn payment-btn" data-id="${student.id}" data-name="${toUpperCase(student.name)}" data-phone="${student.phoneNumber}" title="Add Payment">
                        <i class="fas fa-money-bill"></i>
                    </button>
                    <button class="action-btn delete-btn" data-id="${student.id}" title="Delete Student">
                        <i class="fas fa-trash"></i>
                    </button>
                    <button class="action-btn id-card-btn" data-id="${student.id}" title="View ID Card">
                        <i class="fas fa-id-card"></i>
                    </button>
                </div>
            </td>
        `;
        
        // Delete event
        const deleteBtn = row.querySelector('.delete-btn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => deleteStudent(student.id));
        }
        
        // Edit event
        const editBtn = row.querySelector('.edit-btn');
        if (editBtn) {
            editBtn.addEventListener('click', () => {
                console.log('Edit button clicked for student:', student);
                loadEditStudent(student);
            });
        }

        // Payment event
        const paymentBtn = row.querySelector('.payment-btn');
        if (paymentBtn) {
            paymentBtn.addEventListener('click', () => {
                // Switch to payments tab
                document.querySelector('[data-tab="payments"]').click();
                // Show payment form
                document.querySelector('.payment-form').style.display = 'block';
                // Pre-select the student
                const studentSelect = document.getElementById('studentSelect');
                const option = new Option(toUpperCase(student.name), student.id);
                option.setAttribute('data-phone', student.phoneNumber);
                studentSelect.innerHTML = '';
                studentSelect.appendChild(option);
            });
        }
        
        // ID Card event
        const idCardBtn = row.querySelector('.id-card-btn');
        if (idCardBtn) {
            idCardBtn.addEventListener('click', () => {
                console.log('ID Card button clicked for student:', student);
                showIdCard(student.id);
            });
        }
        
        // View Profile button event
        const viewProfileBtn = row.querySelector('.view-profile-btn');
        if (viewProfileBtn) {
            viewProfileBtn.addEventListener('click', () => {
                showStudentProfile(student.id);
            });
        }

        // Clickable student name event
        const studentNameSpan = row.querySelector('.student-name.clickable');
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
        remainingAmount: parseFloat(document.getElementById('totalCourseFee').value) || 0
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
                    const convertResponse = await fetch(`http://192.168.0.100:8080/api/enquiries/${enquiry.id}/convert`, {
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
    const searchInput = document.getElementById('searchInput');
    const searchFilter = document.getElementById('searchFilter');
    const clearSearchBtn = document.querySelector('.clear-search');
    
    if (!searchInput || !searchFilter || !clearSearchBtn) return;
    
    let searchTimeout;
    
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            const searchTerm = e.target.value;
            const filterType = searchFilter.value;
            const filteredStudents = filterStudents(allStudents, searchTerm, filterType);
            displayStudents(filteredStudents);
            
            // Show/hide clear button
            clearSearchBtn.style.display = searchTerm ? 'flex' : 'none';
        }, 300); // Debounce search for better performance
    });
    
    searchFilter.addEventListener('change', () => {
        const searchTerm = searchInput.value;
        const filterType = searchFilter.value;
        const filteredStudents = filterStudents(allStudents, searchTerm, filterType);
        displayStudents(filteredStudents);
    });
    
    clearSearchBtn.addEventListener('click', () => {
        searchInput.value = '';
        clearSearchBtn.style.display = 'none';
        displayStudents(allStudents);
    });
    
    // Hide clear button initially
    clearSearchBtn.style.display = 'none';
}

// Update the DOMContentLoaded event listener
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded - Initializing application');
    
    // Initialize search functionality
    initializeSearch();
    
    // Initialize tab buttons
    const tabButtons = document.querySelectorAll('.tab-btn');
    console.log('Found tab buttons:', tabButtons.length);
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.getAttribute('data-tab');
            
            // Update active tab button
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Show corresponding content
            tabContents.forEach(content => {
                if (content) {
                    content.classList.remove('active');
                    if (content.id === `${tabId}-panel`) {
                        content.classList.add('active');
                    }
                }
            });

            // Special handling for teachers tab
            if (tabId === 'teachers') {
                const teachersSection = document.getElementById('teachers-section');
                if (teachersSection) {
                    teachersSection.style.display = 'block';
                    loadTeachers();
                }
            } else {
                const teachersSection = document.getElementById('teachers-section');
                if (teachersSection) {
                    teachersSection.style.display = 'none';
                }
            }

            // If the activated tab is the add tab, scroll to the form
            if (tabId === 'add') {
                const addStudentSection = document.querySelector('#add-panel .add-student-section');
                if (addStudentSection) {
                    addStudentSection.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });

    // Load initial data
    console.log('Loading initial data...');
    fetchStudents();
    
    if (document.getElementById('teachersTableBody')) {
        console.log('Loading teachers...');
        loadTeachers();
    }

    const teachersBtn = document.querySelector('.tab-btn[data-tab="teachers"]');
    const modal = document.getElementById('maintenanceModal');
    const closeModal = document.getElementById('closeMaintenanceModal');
    
    if (teachersBtn && modal && closeModal) {
        teachersBtn.addEventListener('click', function(e) {
            e.preventDefault();
            modal.style.display = 'block';
        });
        
        closeModal.addEventListener('click', function() {
            modal.style.display = 'none';
        });
        
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    }

    // Check if we need to auto-fill the Add Student form from enquiry
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('addStudentFromEnquiry') === '1') {
        const enquiryData = localStorage.getItem('enquiryToStudent');
        if (enquiryData) {
            const enquiry = JSON.parse(enquiryData);

            // Switch to Add Student tab
            const addTab = document.querySelector('[data-tab="add"]');
            if (addTab) {
                addTab.click();
            }

            // Fill the form fields
            const nameInput = document.getElementById('name');
            const phoneInput = document.getElementById('phoneNumber');
            const coursesInput = document.getElementById('courses');
            const durationInput = document.getElementById('courseDuration');
            const remarksInput = document.getElementById('remarks');

            if (nameInput) nameInput.value = enquiry.name || '';
            if (phoneInput) phoneInput.value = enquiry.phoneNumber || '';
            if (coursesInput) coursesInput.value = enquiry.course || '';
            if (durationInput) durationInput.value = enquiry.courseDuration || '';
            if (remarksInput) remarksInput.value = enquiry.remarks || '';
        }
    }
});

// Payment related constants
const PAYMENT_API_URL = 'http://192.168.0.100:8080/api/payments';
const paymentForm = document.getElementById('paymentForm');
const addPaymentBtn = document.getElementById('addPaymentBtn');
const cancelPaymentBtn = document.getElementById('cancelPaymentBtn');
const studentSelect = document.getElementById('studentSelect');
const paymentsTableBody = document.querySelector('#paymentsTable tbody');

// Initialize payment form
if (paymentForm) {
    paymentForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const studentId = studentSelect.value;
        if (!studentId) {
            showNotification('Please select a student', true);
            return;
        }

        const studentName = studentSelect.options[studentSelect.selectedIndex].text;
        const studentPhone = studentSelect.options[studentSelect.selectedIndex].getAttribute('data-phone');
        const paymentAmount = parseFloat(document.getElementById('amount').value);

        if (!paymentAmount || paymentAmount <= 0) {
            showNotification('Please enter a valid amount', true);
            return;
        }

        const paymentData = {
            student: { 
                id: studentId,
                name: studentName,
                phoneNumber: studentPhone
            },
            amount: paymentAmount,
            paymentMethod: document.getElementById('paymentMethod').value,
            description: document.getElementById('description').value || 'Course fee payment'
        };

        try {
            // First, get the current student data
            const studentResponse = await fetch(`${API_URL}/${studentId}`);
            if (!studentResponse.ok) {
                throw new Error('Failed to fetch student data');
            }
            const student = await studentResponse.json();

            // Update student's payment information
            const updatedStudent = {
                ...student,
                paidAmount: (student.paidAmount || 0) + paymentAmount,
                remainingAmount: (student.totalCourseFee || 0) - ((student.paidAmount || 0) + paymentAmount)
            };

            // Update the student record
            const updateResponse = await fetch(`${API_URL}/${studentId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedStudent)
            });

            if (!updateResponse.ok) {
                throw new Error('Failed to update student payment information');
            }

            // Then add the payment record
            const paymentResponse = await fetch(PAYMENT_API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(paymentData)
            });

            if (paymentResponse.ok) {
                const payment = await paymentResponse.json();
                showNotification('Payment added successfully!');
                document.querySelector('.payment-form').style.display = 'none';
                paymentForm.reset();
                fetchPayments();
                fetchStudents(); // Refresh the student list to show updated payment info
                generateReceipt(payment);
            } else {
                throw new Error('Failed to create payment record');
            }
        } catch (error) {
            showNotification(error.message || 'Error adding payment', true);
            console.error(error);
        }
    });
}

// Initialize add payment button
if (addPaymentBtn) {
    addPaymentBtn.addEventListener('click', () => {
        document.querySelector('.payment-form').style.display = 'block';
        loadStudentsForPayment();
    });
}

// Initialize cancel payment button
if (cancelPaymentBtn) {
    cancelPaymentBtn.addEventListener('click', () => {
        document.querySelector('.payment-form').style.display = 'none';
        paymentForm.reset();
    });
}

// Load students for payment form
async function loadStudentsForPayment() {
    try {
        const response = await fetch(API_URL);
        const students = await response.json();
        studentSelect.innerHTML = '<option value="">Select Student</option>';
        students.forEach(student => {
            const option = document.createElement('option');
            option.value = student.id;
            option.textContent = student.name;
            option.setAttribute('data-phone', student.phoneNumber);
            studentSelect.appendChild(option);
        });
    } catch (error) {
        showNotification('Error loading students', true);
        console.error(error);
    }
}

// Fetch and display payments
async function fetchPayments() {
    try {
        const response = await fetch(PAYMENT_API_URL);
        if (!response.ok) {
            throw new Error('Failed to fetch payments');
        }
        const payments = await response.json();
        displayPayments(payments);
    } catch (error) {
        console.error('Error fetching payments:', error);
        showNotification('Error fetching payments', true);
    }
}

// Display payments in table
function displayPayments(payments) {
    const filterText = document.getElementById('paymentSearchInput').value.toLowerCase();
    paymentsTableBody.innerHTML = '';
    
    if (!Array.isArray(payments) || payments.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td colspan="7" style="text-align: center; padding: 20px;">
                No payments found
            </td>
        `;
        paymentsTableBody.appendChild(row);
        return;
    }
    
    const filteredPayments = payments.filter(p => 
        (p.receiptNumber && p.receiptNumber.toLowerCase().includes(filterText)) ||
        (p.student && p.student.name && p.student.name.toLowerCase().includes(filterText)) ||
        (p.amount && p.amount.toString().includes(filterText)) ||
        (p.paymentMethod && p.paymentMethod.toLowerCase().includes(filterText)) ||
        (p.status && p.status.toLowerCase().includes(filterText))
    );

    if (filteredPayments.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td colspan="7" style="text-align: center; padding: 20px;">
                No payments match your search criteria
            </td>
        `;
        paymentsTableBody.appendChild(row);
        return;
    }

    filteredPayments.forEach(payment => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${payment.receiptNumber || 'N/A'}</td>
            <td>${payment.student ? payment.student.name : 'N/A'}</td>
            <td>₹${payment.amount || 0}</td>
            <td>${payment.paymentMethod || 'N/A'}</td>
            <td>${payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString() : 'N/A'}</td>
            <td>${payment.status || 'N/A'}</td>
            <td>
                <button class="view-receipt-btn" data-id="${payment.id}">
                    <i class="fas fa-receipt"></i> View Receipt
                </button>
                <button class="delete-payment-btn" data-id="${payment.id}">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </td>
        `;
        
        const viewReceiptBtn = row.querySelector('.view-receipt-btn');
        viewReceiptBtn.addEventListener('click', () => {
            fetchPaymentAndGenerateReceipt(payment.id);
        });

        const deletePaymentBtn = row.querySelector('.delete-payment-btn');
        deletePaymentBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to delete this payment?')) {
                deletePayment(payment.id);
            }
        });
        
        paymentsTableBody.appendChild(row);
    });
}

// Generate receipt for a payment
async function fetchPaymentAndGenerateReceipt(paymentId) {
    try {
        const response = await fetch(`${PAYMENT_API_URL}/${paymentId}`);
        const payment = await response.json();
        generateReceipt(payment);
    } catch (error) {
        showNotification('Error generating receipt', true);
        console.error(error);
    }
}

// Generate and display receipt
function generateReceipt(payment) {
    const receiptWindow = window.open('', '_blank');
    receiptWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Payment Receipt</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 40px; }
                .receipt { border: 1px solid #ccc; padding: 20px; max-width: 600px; margin: 0 auto; }
                .header { text-align: center; margin-bottom: 20px; }
                .details { margin: 20px 0; }
                .details div { margin: 10px 0; }
                .footer { text-align: center; margin-top: 40px; }
                @media print {
                    .no-print { display: none; }
                }
            </style>
        </head>
        <body>
            <div class="receipt">
                <div class="header">
                    <h1>Saha Computer Of Mgmt. & Tech</h1>
                    <h2>Payment Receipt</h2>
                </div>
                <div class="details">
                    <div><strong>Receipt No:</strong> ${payment.receiptNumber}</div>
                    <div><strong>Date:</strong> ${new Date(payment.paymentDate).toLocaleString()}</div>
                    <div><strong>Student Name:</strong> ${payment.student.name}</div>
                    <div><strong>Student Phone:</strong> ${payment.student.phoneNumber}</div>
                    <div><strong>Amount:</strong> ₹${payment.amount}</div>
                    <div><strong>Payment Method:</strong> ${payment.paymentMethod}</div>
                    <div><strong>Description:</strong> ${payment.description}</div>
                    <div><strong>Status:</strong> ${payment.status}</div>
                </div>
                <div class="footer">
                    <p>Thank you for your payment!</p>
                    <p>This is a computer-generated receipt and does not require a signature.</p>
                </div>
                <div class="no-print" style="text-align: center; margin-top: 20px;">
                    <button onclick="window.print()">Print Receipt</button>
                </div>
            </div>
        </body>
        </html>
    `);
}

// Initialize payments when payments tab is clicked
document.querySelector('[data-tab="payments"]').addEventListener('click', () => {
    fetchPayments();
});

// Delete payment
async function deletePayment(id) {
    try {
        const response = await fetch(`${PAYMENT_API_URL}/${id}`, {
            method: 'DELETE'
        });
        if (response.ok) {
            showNotification('Payment deleted successfully!');
            fetchPayments();
        } else {
            showNotification('Error deleting payment', true);
        }
    } catch (error) {
        showNotification('Error deleting payment', true);
        console.error(error);
    }
}

// Add payment search functionality
document.getElementById('paymentSearchInput').addEventListener('input', () => {
    fetchPayments();
});

// Teacher Management Functions
function showAddTeacherForm() {
    document.getElementById('teacher-form').style.display = 'block';
    document.getElementById('teacherForm').reset();
    document.getElementById('teacherId').value = '';
}

function hideTeacherForm() {
    document.getElementById('teacher-form').style.display = 'none';
}

function loadTeachers() {
    fetch('/api/teachers')
        .then(response => response.json())
        .then(teachers => {
            const tableBody = document.getElementById('teachersTableBody');
            tableBody.innerHTML = '';
            
            teachers.forEach(teacher => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>
                        <img src="${teacher.photoUrl || '/uploads/teachers/default-teacher.png'}" 
                             alt="${teacher.name}" 
                             class="teacher-photo"
                             onerror="this.src='/uploads/teachers/default-teacher.png'">
                    </td>
                    <td>${teacher.name}</td>
                    <td>${teacher.email}</td>
                    <td>${teacher.phoneNumber}</td>
                    <td>${teacher.qualification}</td>
                    <td>${teacher.specialization}</td>
                    <td>${new Date(teacher.joiningDate).toLocaleDateString()}</td>
                    <td>₹${teacher.salary.toLocaleString()}</td>
                    <td>
                        <span class="teacher-status status-${teacher.status.toLowerCase()}">
                            ${teacher.status}
                        </span>
                    </td>
                    <td class="teacher-role">${teacher.role}</td>
                    <td class="teacher-actions">
                        <button class="edit-teacher-btn" onclick="editTeacher(${teacher.id})">
                            Edit
                        </button>
                        <button class="delete-teacher-btn" onclick="deleteTeacher(${teacher.id})">
                            Delete
                        </button>
                    </td>
                `;
                tableBody.appendChild(row);
            });
        })
        .catch(error => {
            console.error('Error loading teachers:', error);
            showNotification('Error loading teachers', 'error');
        });
}

function editTeacher(id) {
    fetch(`/api/teachers/${id}`)
        .then(response => response.json())
        .then(teacher => {
            document.getElementById('teacherId').value = teacher.id;
            document.getElementById('teacherName').value = teacher.name;
            document.getElementById('teacherEmail').value = teacher.email;
            document.getElementById('teacherPhone').value = teacher.phoneNumber;
            document.getElementById('teacherAddress').value = teacher.address;
            document.getElementById('teacherQualification').value = teacher.qualification;
            document.getElementById('teacherSpecialization').value = teacher.specialization;
            document.getElementById('teacherJoiningDate').value = teacher.joiningDate;
            document.getElementById('teacherSalary').value = teacher.salary;
            document.getElementById('teacherStatus').value = teacher.status;
            document.getElementById('teacherRole').value = teacher.role;
            
            document.getElementById('teacher-form').style.display = 'block';
        })
        .catch(error => {
            console.error('Error loading teacher details:', error);
            showNotification('Error loading teacher details', 'error');
        });
}

function deleteTeacher(id) {
    if (confirm('Are you sure you want to delete this teacher?')) {
        fetch(`/api/teachers/${id}`, {
            method: 'DELETE'
        })
        .then(response => {
            if (response.ok) {
                showNotification('Teacher deleted successfully', 'success');
                loadTeachers();
            } else {
                throw new Error('Failed to delete teacher');
            }
        })
        .catch(error => {
            console.error('Error deleting teacher:', error);
            showNotification('Error deleting teacher', 'error');
        });
    }
}

const teacherFormEl = document.getElementById('teacherForm');
if (teacherFormEl) {
    teacherFormEl.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = new FormData();
        const teacherId = document.getElementById('teacherId').value;
        
        const teacher = {
            name: document.getElementById('teacherName').value,
            email: document.getElementById('teacherEmail').value,
            phoneNumber: document.getElementById('teacherPhone').value,
            address: document.getElementById('teacherAddress').value,
            qualification: document.getElementById('teacherQualification').value,
            specialization: document.getElementById('teacherSpecialization').value,
            joiningDate: document.getElementById('teacherJoiningDate').value,
            salary: parseFloat(document.getElementById('teacherSalary').value),
            status: document.getElementById('teacherStatus').value,
            role: document.getElementById('teacherRole').value
        };
        
        formData.append('teacher', new Blob([JSON.stringify(teacher)], {
            type: 'application/json'
        }));
        
        const photoFile = document.getElementById('teacherPhoto').files[0];
        if (photoFile) {
            formData.append('photo', photoFile);
        }
        
        const url = teacherId ? `/api/teachers/${teacherId}` : '/api/teachers';
        const method = teacherId ? 'PUT' : 'POST';
        
        fetch(url, {
            method: method,
            body: formData
        })
        .then(response => {
            if (response.ok) {
                showNotification(
                    `Teacher ${teacherId ? 'updated' : 'added'} successfully`, 
                    'success'
                );
                hideTeacherForm();
                loadTeachers();
            } else {
                throw new Error(`Failed to ${teacherId ? 'update' : 'add'} teacher`);
            }
        })
        .catch(error => {
            console.error('Error saving teacher:', error);
            showNotification('Error saving teacher', 'error');
        });
    });
}

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    fetchStudents();
    fetchPayments();
});

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
    modal.style.display = 'block';
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
document.getElementById('closeIdCardModal').addEventListener('click', () => {
    document.getElementById('idCardModal').style.display = 'none';
});

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

// Reports functionality
async function loadReports() {
    try {
        console.log('Loading reports...');
        
        // Fetch enquiries
        const enquiriesResponse = await fetch('http://192.168.0.100:8080/api/enquiries');
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
                        <td colspan="4" style="text-align: center;">No pending enquiries</td>
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
        } else {
            console.error('Pending enquiries list element not found');
        }
        
        // Fetch students for pending fees
        const studentsResponse = await fetch(API_URL);
        if (!studentsResponse.ok) {
            throw new Error(`Failed to fetch students: ${studentsResponse.status}`);
        }
        const students = await studentsResponse.json();
        console.log('Fetched students:', students);
        
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

// Add event listener for reports tab
document.querySelector('[data-tab="reports"]').addEventListener('click', () => {
    loadReports();
});

// Add Chart.js library
const chartScript = document.createElement('script');
chartScript.src = 'https://cdn.jsdelivr.net/npm/chart.js';
document.head.appendChild(chartScript);

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
        <div class="profile-section">
            <h3><i class="fas fa-user"></i> Personal Information</h3>
            <p><strong>Name:</strong> ${toUpperCase(student.name) || 'N/A'}</p>
            <p><strong>Student ID:</strong> STU${String(student.id).padStart(4, '0')}</p>
            <p><strong>Father's Name:</strong> ${toUpperCase(student.fatherName) || 'N/A'}</p>
            <p><strong>Mother's Name:</strong> ${toUpperCase(student.motherName) || 'N/A'}</p>
            <p><strong>Date of Birth:</strong> ${student.dob || 'N/A'}</p>
        </div>

        <div class="profile-section">
            <h3><i class="fas fa-address-card"></i> Contact Information</h3>
            <p><strong>Phone Number:</strong> ${student.phoneNumber || 'N/A'}</p>
            <p><strong>Email Address:</strong> ${toUpperCase(student.email) || 'N/A'}</p>
            <p><strong>Address:</strong> ${student.address || 'N/A'}</p>
        </div>

        <div class="profile-section">
            <h3><i class="fas fa-graduation-cap"></i> Course Information</h3>
            <p><strong>Course(s):</strong> ${toUpperCase(student.courses) || 'N/A'}</p>
            <p><strong>Course Duration:</strong> ${student.courseDuration || 'N/A'}</p>
            <p><strong>Total Course Fee:</strong> ₹${formatCurrency(student.totalCourseFee) || 'N/A'}</p>
        </div>

        <div class="profile-section">
            <h3><i class="fas fa-money-bill-wave"></i> Fee Status</h3>
            <p><strong>Paid Amount:</strong> ₹${formatCurrency(student.paidAmount) || 'N/A'}</p>
            <p><strong>Remaining Amount:</strong> ₹${formatCurrency(student.remainingAmount) || 'N/A'}</p>
            <div class="fee-progress" style="width: 100%; height: 10px; margin-top: 10px;">
                 <div class="fee-progress-bar" style="width: ${(parseFloat(student.paidAmount) / parseFloat(student.totalCourseFee)) * 100 || 0}%"></div>
            </div>
        </div>
    `;

    modal.style.display = 'block';
}

// Event listener for closing the student profile modal
document.getElementById('closeStudentProfileModal').addEventListener('click', () => {
    document.getElementById('studentProfileModal').style.display = 'none';
});

// Close modal when clicking outside
window.addEventListener('click', (event) => {
    const modal = document.getElementById('studentProfileModal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});
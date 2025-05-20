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

const API_URL = 'http://localhost:8080/api/enquiries';

const enquiryForm = document.getElementById('enquiryForm');
const enquiriesTableBody = document.querySelector('#enquiriesTable tbody');
const tabButtons = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');
const notification = document.getElementById('notification');
const notificationMessage = document.getElementById('notificationMessage');
const searchEnquiryInput = document.getElementById('searchEnquiryInput');

// Add logout button to header
const header = document.querySelector('header');
const logoutBtn = document.createElement('button');
logoutBtn.textContent = 'Logout';
logoutBtn.className = 'logout-btn';
logoutBtn.onclick = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('username');
    window.location.href = 'login.html';
};
header.appendChild(logoutBtn);

// Show notification function
function showNotification(message, isError = false) {
    notificationMessage.textContent = message;
    notification.className = 'notification' + (isError ? ' error' : '');
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Tab switching functionality
tabButtons.forEach(button => {
    button.addEventListener('click', () => {
        const tabId = button.getAttribute('data-tab');
        
        tabButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        tabContents.forEach(content => {
            content.classList.remove('active');
            if (content.id === `${tabId}-panel`) {
                content.classList.add('active');
            }
        });

        if (tabId === 'enquiry-list') {
            fetchEnquiries();
        }
    });
});

// Search functionality
searchEnquiryInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const rows = enquiriesTableBody.getElementsByTagName('tr');
    
    Array.from(rows).forEach(row => {
        const name = row.cells[0].textContent.toLowerCase();
        const phone = row.cells[2].textContent.toLowerCase();
        const remarks = row.cells[3].textContent.toLowerCase();
        
        if (name.includes(searchTerm) || phone.includes(searchTerm) || remarks.includes(searchTerm)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
});

// Fetch and display enquiries
async function fetchEnquiries() {
    try {
        const response = await fetch(API_URL);
        const enquiries = await response.json();
        displayEnquiries(enquiries);
    } catch (error) {
        console.error('Error fetching enquiries:', error);
        showNotification('Error fetching enquiries', true);
    }
}

// Display enquiries in table
function displayEnquiries(enquiries) {
    enquiriesTableBody.innerHTML = '';
    
    enquiries.forEach(enquiry => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${enquiry.name}</td>
            <td>${new Date(enquiry.dateOfEnquiry).toLocaleDateString()}</td>
            <td>${enquiry.phoneNumber}</td>
            <td>${enquiry.course || ''}</td>
            <td>${enquiry.courseDuration || ''}</td>
            <td>${enquiry.remarks || ''}</td>
            <td>
                <span class="badge ${enquiry.convertedToStudent ? 'bg-success' : 'bg-warning'}">
                    ${enquiry.convertedToStudent ? 'Confirmed' : 'Pending'}
                </span>
            </td>
            <td>
                <div class="action-buttons">
                    ${!enquiry.convertedToStudent ? `
                        <button class="action-btn convert-btn" data-id="${enquiry.id}" title="Convert to Student">
                            <i class="fas fa-user-plus"></i>
                            <span>Convert</span>
                        </button>
                    ` : `
                        <button class="action-btn reverse-btn" data-id="${enquiry.id}" title="Reverse Conversion">
                            <i class="fas fa-undo"></i>
                            <span>Reverse</span>
                        </button>
                    `}
                </div>
            </td>
            <td>
                ${!enquiry.convertedToStudent ? `
                    <input type="checkbox" class="convert-checkbox" data-id="${enquiry.id}" title="Mark as Confirmed">
                ` : ''}
            </td>
        `;
        
        const convertBtn = row.querySelector('.convert-btn');
        if (convertBtn) {
            convertBtn.addEventListener('click', () => convertToStudent(enquiry.id));
        }
        
        const reverseBtn = row.querySelector('.reverse-btn');
        if (reverseBtn) {
            reverseBtn.addEventListener('click', () => reverseConversion(enquiry.id));
        }

        // Add event listener for the new checkbox
        const convertCheckbox = row.querySelector('.convert-checkbox');
        if (convertCheckbox) {
            convertCheckbox.addEventListener('change', async (e) => {
                if (e.target.checked) {
                    try {
                        const response = await fetch(`${API_URL}/${enquiry.id}/convert`, {
                            method: 'POST'
                        });
                        if (response.ok) {
                            showNotification('Enquiry marked as Confirmed!');
                            fetchEnquiries(); // Refresh the list
                        } else {
                            const errorText = await response.text();
                            throw new Error(errorText || 'Failed to mark enquiry as confirmed');
                        }
                    } catch (error) {
                        console.error('Error marking enquiry as confirmed:', error);
                        showNotification('Error marking enquiry as confirmed: ' + error.message, true);
                        e.target.checked = false; // Uncheck the box on error
                    }
                }
            });
        }
        
        enquiriesTableBody.appendChild(row);
    });
}

// Handle form submission
enquiryForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    try {
        const formData = {
            name: document.getElementById('name').value,
            phoneNumber: document.getElementById('phoneNumber').value,
            course: document.getElementById('course').value,
            courseDuration: document.getElementById('courseDuration').value,
            remarks: document.getElementById('remarks').value,
            dateOfEnquiry: new Date().toISOString().split('T')[0],
            convertedToStudent: false
        };

        console.log('Submitting enquiry:', formData); // Debug log

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to submit enquiry');
        }

        const result = await response.json();
        console.log('Enquiry submitted successfully:', result); // Debug log

        showNotification('Enquiry submitted successfully!');
        enquiryForm.reset();
        // Switch to enquiry list tab
        document.querySelector('[data-tab="enquiry-list"]').click();
    } catch (error) {
        console.error('Error submitting enquiry:', error);
        showNotification('Error submitting enquiry: ' + error.message, true);
    }
});

// Convert enquiry to student
async function convertToStudent(id) {
    try {
        // Get the enquiry data first
        const response = await fetch(`${API_URL}/${id}`);
        if (!response.ok) throw new Error('Failed to fetch enquiry data');
        const enquiry = await response.json();

        // Store enquiry data in localStorage
        localStorage.setItem('enquiryToStudent', JSON.stringify(enquiry));

        // Redirect to main dashboard (index.html) and open Add Student tab
        window.location.href = 'index.html?addStudentFromEnquiry=1';
    } catch (error) {
        console.error('Error preparing to convert enquiry:', error);
        showNotification('Error preparing to convert enquiry', true);
    }
}

// Add reverse conversion function
async function reverseConversion(id) {
    if (!confirm('Are you sure you want to reverse this conversion? This will mark the enquiry as pending again.')) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/${id}/reverse`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            showNotification('Enquiry conversion reversed successfully!');
            fetchEnquiries();
            // Also refresh the student list in the main window if available
            if (window.opener && typeof window.opener.fetchStudents === 'function') {
                window.opener.fetchStudents();
            } else if (window.parent && typeof window.parent.fetchStudents === 'function') {
                window.parent.fetchStudents();
            } else if (window.fetchStudents) {
                window.fetchStudents();
            }
        } else {
            const errorText = await response.text();
            throw new Error(errorText || 'Failed to reverse conversion');
        }
    } catch (error) {
        console.error('Error reversing conversion:', error);
        showNotification('Error reversing conversion: ' + error.message, true);
    }
}

// Initial load of enquiries
fetchEnquiries(); 
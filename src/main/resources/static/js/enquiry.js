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

const API_URL = 'http://localhost:4456/api/enquiries';

const enquiryForm = document.getElementById('enquiryForm');
const enquiriesTableBody = document.querySelector('#enquiriesTable tbody');
const searchInput = document.getElementById('searchInput');
const addEnquiryBtn = document.getElementById('addEnquiryBtn');
const saveEnquiryBtn = document.getElementById('saveEnquiryBtn');
const enquiryModal = new bootstrap.Modal(document.getElementById('enquiryModal'));
const notification = document.getElementById('notification');
const notificationMessage = document.getElementById('notificationMessage');

// Declare a global variable to store enquiries
let allEnquiries = [];

// Show notification function
function showNotification(message, isError = false) {
    notificationMessage.textContent = message;
    notification.className = 'toast' + (isError ? ' bg-danger text-white' : ' bg-success text-white');
    const bsToast = new bootstrap.Toast(notification);
    bsToast.show();
}

// Format phone number
function formatPhoneNumber(phoneNumber) {
    if (!phoneNumber) return 'N/A';
    // Remove any non-digit characters
    const cleaned = phoneNumber.replace(/\D/g, '');
    // Format as XXX-XXX-XXXX
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
        return `${match[1]}-${match[2]}-${match[3]}`;
    }
    return phoneNumber;
}

// Function to format Indian phone number
function formatIndianPhoneNumber(input) {
    if (!input) return 'N/A';
    // Remove all non-digit characters
    let number = input.toString().replace(/\D/g, '');
    
    // Limit to 10 digits
    number = number.substring(0, 10);
    
    // Format as XXX-XXX-XXXX
    if (number.length > 0) {
        if (number.length <= 3) {
            return number;
        } else if (number.length <= 6) {
            return `${number.substring(0, 3)}-${number.substring(3)}`;
        } else {
            return `${number.substring(0, 3)}-${number.substring(3, 6)}-${number.substring(6)}`;
        }
    }
    return 'N/A';
}

// Fetch and display enquiries
async function fetchEnquiries() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error('Failed to fetch enquiries');
        }
        const enquiries = await response.json();
        console.log("Fetched enquiries:", enquiries);
        // Store fetched enquiries in the global variable
        allEnquiries = enquiries;

        // Check localStorage for a saved state and use it if available
        const savedState = localStorage.getItem('enquiriesState');
        if (savedState) {
            try {
                const parsedState = JSON.parse(savedState);
                // Simple check to see if the saved state matches the fetched data structure
                if (Array.isArray(parsedState) && parsedState.length === allEnquiries.length) {
                     // A more robust check would compare IDs, but this is a start.
                     // For simplicity, we'll assume if the lengths match, we use the saved state.
                     // A better approach might involve merging or comparing timestamps.
                    console.log("Using saved state from localStorage.");
                    allEnquiries = parsedState;
                } else {
                    console.log("Saved state in localStorage does not match fetched data, discarding saved state.");
                    localStorage.removeItem('enquiriesState');
                }
            } catch (e) {
                console.error("Error parsing localStorage state:", e);
                localStorage.removeItem('enquiriesState'); // Clear invalid state
            }
        }

        displayEnquiries(allEnquiries);
        updateEnquiryStats(allEnquiries);
        initializeEnquirySearch();
    } catch (error) {
        console.error('Error fetching enquiries:', error);
        showNotification('Error fetching enquiries', true);
    }
}

// Display enquiries in table
function displayEnquiries(enquiries) {
    const tbody = document.querySelector('#enquiriesTable tbody');
    if (!tbody) {
        console.error('Enquiries table body not found');
        return;
    }
    
    tbody.innerHTML = '';
    
    enquiries.forEach(enquiry => {
        const row = document.createElement('tr');
        const formattedPhone = formatIndianPhoneNumber(enquiry.phoneNumber);
        const formattedDate = enquiry.dateOfEnquiry ? new Date(enquiry.dateOfEnquiry).toLocaleDateString() : 
                            (enquiry.createdAt ? new Date(enquiry.createdAt).toLocaleDateString() : 'N/A');
        
        row.innerHTML = `
            <td>${enquiry.name || 'N/A'}</td>
            <td>${formattedPhone}</td>
            <td>${enquiry.email || 'N/A'}</td>
            <td>${enquiry.course || 'N/A'}</td>
            <td>${enquiry.courseDuration || 'N/A'}</td>
            <td>${formattedDate}</td>
            <td>
                <span class="badge ${enquiry.status === 'CONVERTED' ? 'bg-success' : 'bg-warning'}">
                    ${enquiry.status || 'PENDING'}
                </span>
            </td>
            <td>
                <input
                    type="checkbox"
                    ${enquiry.status === 'CONVERTED' ? 'checked' : ''}
                    onclick="toggleEnquiryStatus(this, ${enquiry.id})"
                />
            </td>
            <td>
                <div class="btn-group">
                    ${enquiry.status !== 'CONVERTED' ? `
                        <button class="btn btn-sm btn-success" onclick="convertToStudent(${enquiry.id})">
                            <i class="fas fa-user-plus"></i>
                        </button>
                    ` : `
                        <button class="btn btn-sm btn-warning" onclick="reverseConversion(${enquiry.id})">
                            <i class="fas fa-undo"></i>
                        </button>
                    `}
                    <button class="btn btn-sm btn-danger" onclick="deleteEnquiry(${enquiry.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Function to visually toggle enquiry status (client-side only)
function toggleEnquiryStatus(checkbox, enquiryId) {
    const row = checkbox.closest('tr');
    const statusCell = row.cells[6]; // Assuming Status is the 7th column (index 6)
    const statusBadge = statusCell.querySelector('.badge');

    // Find the enquiry in the allEnquiries array
    const enquiry = allEnquiries.find(e => e.id === enquiryId);

    if (enquiry) {
        if (checkbox.checked) {
            // Mark as Confirmed visually
            if (statusBadge) {
                statusBadge.textContent = 'CONVERTED';
                statusBadge.classList.remove('bg-warning');
                statusBadge.classList.add('bg-success');
            }
            // Update the status in the frontend array
            enquiry.status = 'CONVERTED';
            enquiry.convertedToStudent = true;

            // Call the API to mark the enquiry as converted
            fetch(`http://localhost:4455/api/enquiries/${enquiryId}/convert`, {
                method: 'POST'
            }).then(response => {
                if (!response.ok) {
                    throw new Error('Failed to mark enquiry as converted');
                }
                // Refresh the student list if we're on the students page
                if (window.fetchStudents) {
                    window.fetchStudents();
                }
            }).catch(error => {
                console.error('Error marking enquiry as converted:', error);
                // Revert the checkbox if the API call fails
                checkbox.checked = false;
                if (statusBadge) {
                    statusBadge.textContent = 'PENDING';
                    statusBadge.classList.remove('bg-success');
                    statusBadge.classList.add('bg-warning');
                }
                enquiry.status = 'PENDING';
                enquiry.convertedToStudent = false;
                showNotification('Failed to update enquiry status', true);
            });
        } else {
            // Mark as Pending visually
            if (statusBadge) {
                statusBadge.textContent = 'PENDING';
                statusBadge.classList.remove('bg-success');
                statusBadge.classList.add('bg-warning');
            }
            // Update the status in the frontend array
            enquiry.status = 'PENDING';
            enquiry.convertedToStudent = false;

            // Call the API to reverse the conversion
            fetch(`http://localhost:4455/api/enquiries/${enquiryId}/reverse`, {
                method: 'POST'
            }).then(response => {
                if (!response.ok) {
                    throw new Error('Failed to reverse enquiry conversion');
                }
                // Refresh the student list if we're on the students page
                if (window.fetchStudents) {
                    window.fetchStudents();
                }
            }).catch(error => {
                console.error('Error reversing enquiry conversion:', error);
                // Revert the checkbox if the API call fails
                checkbox.checked = true;
                if (statusBadge) {
                    statusBadge.textContent = 'CONVERTED';
                    statusBadge.classList.remove('bg-warning');
                    statusBadge.classList.add('bg-success');
                }
                enquiry.status = 'CONVERTED';
                enquiry.convertedToStudent = true;
                showNotification('Failed to update enquiry status', true);
            });
        }
        // Save the updated enquiries list to localStorage
        localStorage.setItem('enquiriesState', JSON.stringify(allEnquiries));
    }
}

// Update enquiry statistics
function updateEnquiryStats(enquiries) {
    const totalEnquiries = document.getElementById('totalEnquiries');
    const convertedEnquiries = document.getElementById('convertedEnquiries');
    const pendingEnquiries = document.getElementById('pendingEnquiries');

    if (totalEnquiries) totalEnquiries.textContent = enquiries.length;
    if (convertedEnquiries) {
        convertedEnquiries.textContent = enquiries.filter(e => e.status === 'CONVERTED').length;
    }
    if (pendingEnquiries) {
        pendingEnquiries.textContent = enquiries.filter(e => e.status !== 'CONVERTED').length;
    }
}

// Add new enquiry
addEnquiryBtn.addEventListener('click', () => {
    document.getElementById('enquiryForm').reset();
    document.getElementById('enquiryId').value = '';
    document.getElementById('enquiryModalTitle').textContent = 'Add New Enquiry';
    enquiryModal.show();
});

// Save enquiry
saveEnquiryBtn.addEventListener('click', async () => {
    const form = document.getElementById('enquiryForm');
    if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return;
    }

    try {
        const nameInput = document.getElementById('name');
        const phoneNumberInput = document.getElementById('phoneNumber');
        const emailInput = document.getElementById('email');
        const courseSelect = document.getElementById('course');
        const courseDurationSelect = document.getElementById('courseDuration');
        const remarksTextarea = document.getElementById('remarks');
        const dateOfEnquiryInput = document.getElementById('dateOfEnquiry');

        // Basic check to ensure elements exist
        if (!nameInput || !phoneNumberInput || !courseSelect || !courseDurationSelect || !dateOfEnquiryInput) {
            console.error("One or more required form elements not found!");
            showNotification("Error: Missing form elements.", true);
            return;
        }

        const name = nameInput.value.trim();
        const phoneNumber = phoneNumberInput.value.replace(/\D/g, ''); // Remove non-digits
        const email = emailInput ? emailInput.value.trim() : ''; // Email is not required, so check if element exists
        const course = courseSelect.value;
        const courseDuration = courseDurationSelect.value;
        const remarks = remarksTextarea ? remarksTextarea.value.trim() : ''; // Remarks is not required

        // Get date of enquiry, default to today's date if not set
        let dateOfEnquiry = dateOfEnquiryInput.value;
        if (!dateOfEnquiry) {
            const today = new Date();
            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
            const day = String(today.getDate()).padStart(2, '0');
            dateOfEnquiry = `${year}-${month}-${day}`;
        }

        // Validate required fields (already handled by needs-validation, but good to have a JS check)
        if (!name || !phoneNumber || !course || !courseDuration || !dateOfEnquiry) {
             showNotification("Please fill in all required fields.", true);
             form.classList.add('was-validated');
             return;
        }

        const enquiryData = {
            name: name.toUpperCase(),
            phoneNumber: phoneNumber,
            email: email.toUpperCase(),
            course: course,
            courseDuration: courseDuration,
            remarks: remarks.toUpperCase(),
            status: 'PENDING',
            dateOfEnquiry: dateOfEnquiry // Include date of enquiry
        };

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(enquiryData)
        });

        if (!response.ok) {
            throw new Error('Failed to add enquiry');
        }

        // Close modal and reset form
        const modal = bootstrap.Modal.getInstance(document.getElementById('enquiryModal'));
        modal.hide();
        form.reset();
        form.classList.remove('was-validated');

        // Refresh enquiries list
        fetchEnquiries();

        showNotification('Enquiry added successfully!');
    } catch (error) {
        console.error('Error adding enquiry:', error);
        showNotification('Error adding enquiry: ' + error.message, true);
    }
});

// Convert enquiry to student
async function convertToStudent(id) {
    try {
        // First, get the enquiry details
        const response = await fetch(`${API_URL}/${id}`);
        if (!response.ok) {
            throw new Error('Failed to fetch enquiry details');
        }
        const enquiry = await response.json();

        console.log('Fetched enquiry for conversion:', enquiry);

        // Store enquiry data in localStorage for pre-filling the add student form
        localStorage.setItem('enquiryToStudent', JSON.stringify({
            name: enquiry.name,
            phoneNumber: enquiry.phoneNumber,
            courses: enquiry.course,
            courseDuration: enquiry.courseDuration,
            remarks: enquiry.remarks
        }));

        console.log('Enquiry data stored in localStorage:', localStorage.getItem('enquiryToStudent'));

        // Redirect to add student page
        window.location.href = 'index.html?panel=add';

    } catch (error) {
        console.error('Error converting enquiry:', error);
        showNotification('Error converting enquiry', true);
    }
}

// Reverse conversion
async function reverseConversion(id) {
    try {
        // Fetch the latest enquiry data
        const enquiryResponse = await fetch(`${API_URL}/${id}`);
        if (!enquiryResponse.ok) {
            throw new Error('Failed to fetch enquiry details');
        }
        const enquiry = await enquiryResponse.json();

        if (!enquiry) {
            showNotification('Enquiry not found', true);
            return;
        }

        if (enquiry.status !== 'CONVERTED') {
            showNotification('This enquiry is not converted to a student yet', true);
            return;
        }

        if (!confirm('Are you sure you want to reverse this conversion? This will remove the student record and cannot be undone.')) {
            return;
        }

        // Get the student ID from the enquiry data
        const studentId = enquiry.studentId;
        if (!studentId) {
            throw new Error('No associated student found for this enquiry');
        }

        // Check if student has any payments
        const paymentsResponse = await fetch(`http://localhost:4456/api/payments/student/${studentId}`);
        if (!paymentsResponse.ok) {
            throw new Error('Failed to check student payments');
        }
        const payments = await paymentsResponse.json();

        if (payments && payments.length > 0) {
            if (!confirm(`This student has ${payments.length} payment record(s). Reversing the conversion will also delete all associated payment records. Do you want to continue?`)) {
                return;
            }
        }

        const response = await fetch(`${API_URL}/${id}/reverse`, {
            method: 'POST'
        });

        if (!response.ok) {
            const errorData = await response.text();
            throw new Error(errorData || 'Failed to reverse conversion');
        }

        const updatedEnquiry = await response.json();
        showNotification('Conversion reversed successfully');
        fetchEnquiries();
        
        // Refresh the student list if we're on the students page
        if (window.fetchStudents) {
            window.fetchStudents();
        }
    } catch (error) {
        console.error('Error reversing conversion:', error);
        showNotification(error.message || 'Error reversing conversion', true);
    }
}

// Delete enquiry
async function deleteEnquiry(id) {
    if (!confirm('Are you sure you want to delete this enquiry?')) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error('Failed to delete enquiry');
        }

        showNotification('Enquiry deleted successfully');
        fetchEnquiries();
    } catch (error) {
        console.error('Error deleting enquiry:', error);
        showNotification('Error deleting enquiry', true);
    }
}

// Add event listener for form reset when modal is hidden
document.getElementById('enquiryModal')?.addEventListener('hidden.bs.modal', () => {
    const form = document.getElementById('enquiryForm');
    if (form) {
        form.reset();
        form.classList.remove('was-validated');
    }
});

// Initial load
fetchEnquiries();

// Consider moving this to dashboard.html and index.html separately if header structure differs
const logoutContainer = document.getElementById('logoutContainer');
if (logoutContainer && !logoutContainer.querySelector('.logout-btn')) { // Prevent adding multiple logout buttons
    const logoutBtn = document.createElement('button');
    logoutBtn.textContent = 'Logout';
    logoutBtn.className = 'logout-btn';
    logoutBtn.onclick = () => {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('username');
        window.location.replace('login.html');
    };
    logoutContainer.appendChild(logoutBtn);
}

// Function to filter enquiries
function filterEnquiries(enquiries, searchTerm) {
    console.log('Filtering enquiries with term:', searchTerm);
    if (!searchTerm) return enquiries;

    searchTerm = searchTerm.toLowerCase().trim();

    return enquiries.filter(enquiry => {
        return (
            enquiry.name?.toLowerCase().includes(searchTerm) ||
            enquiry.phoneNumber?.includes(searchTerm) ||
            enquiry.email?.toLowerCase().includes(searchTerm) ||
            enquiry.course?.toLowerCase().includes(searchTerm) ||
            enquiry.courseDuration?.toLowerCase().includes(searchTerm) ||
            enquiry.remarks?.toLowerCase().includes(searchTerm)
        );
    });
}

// Initialize search functionality for enquiries
function initializeEnquirySearch() {
    console.log('Initializing enquiry search...');
    const searchInput = document.getElementById('searchInput');

    if (!searchInput) {
        console.error('Enquiry search input element not found');
        return;
    }

    let searchTimeout;

    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            const searchTerm = e.target.value;
            console.log('Enquiry search input:', searchTerm, 'All enquiries:', allEnquiries);
            const filteredEnquiries = filterEnquiries(allEnquiries, searchTerm);
            console.log('Filtered enquiries:', filteredEnquiries);
            displayEnquiries(filteredEnquiries);
        }, 300); // Debounce search
    });
} 
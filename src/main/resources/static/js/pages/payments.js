// DOM Elements
const searchPaymentInput = document.getElementById('searchPaymentInput');
const paymentsTable = document.getElementById('paymentsTable').getElementsByTagName('tbody')[0];
const totalPayments = document.getElementById('totalPayments');
const todayPayments = document.getElementById('todayPayments');
const pendingPayments = document.getElementById('pendingPayments');
const addPaymentModal = document.getElementById('addPaymentModal');
const viewReceiptModal = document.getElementById('viewReceiptModal');
const addPaymentForm = document.getElementById('addPaymentForm');
const studentSelect = document.getElementById('studentSelect');

// State
let payments = [];
let filteredPayments = [];
let students = [];

// Fetch payments from API
async function fetchPayments() {
    try {
        const response = await fetch('/api/payments');
        payments = await response.json();
        filteredPayments = [...payments];
        updatePaymentsTable();
        updatePaymentStats();
    } catch (error) {
        console.error('Error fetching payments:', error);
        showNotification('Error loading payments', 'error');
    }
}

// Fetch students for payment form
async function fetchStudents() {
    try {
        const response = await fetch('/api/students');
        students = await response.json();
        populateStudentSelect();
    } catch (error) {
        console.error('Error fetching students:', error);
        showNotification('Error loading students', 'error');
    }
}

// Populate student select dropdown
function populateStudentSelect() {
    studentSelect.innerHTML = '<option value="">Choose a student...</option>';
    students.forEach(student => {
        const option = document.createElement('option');
        option.value = student.id;
        option.textContent = `${student.name} (ID: ${student.id})`;
        studentSelect.appendChild(option);
    });
}

// Update payments table
function updatePaymentsTable() {
    paymentsTable.innerHTML = '';
    
    filteredPayments.forEach(payment => {
        const row = document.createElement('tr');
        
        // Receipt Number Cell
        const receiptCell = document.createElement('td');
        receiptCell.textContent = payment.receiptNo;
        
        // Student Info Cell
        const studentInfoCell = document.createElement('td');
        const student = students.find(s => s.id === payment.studentId);
        studentInfoCell.innerHTML = `
            <div class="student-info">
                <div class="student-avatar">
                    ${student ? student.name.charAt(0).toUpperCase() : '?'}
                </div>
                <div class="student-details">
                    <div class="student-name">${student ? student.name : 'Unknown Student'}</div>
                    <div class="student-id">ID: ${payment.studentId}</div>
                </div>
            </div>
        `;
        
        // Payment Details Cell
        const paymentDetailsCell = document.createElement('td');
        paymentDetailsCell.innerHTML = `
            <div class="payment-details">
                <div class="payment-date">
                    <i class="fas fa-calendar"></i>
                    ${new Date(payment.date).toLocaleDateString()}
                </div>
                <div class="payment-mode">
                    <i class="fas fa-money-bill"></i>
                    ${payment.mode.charAt(0).toUpperCase() + payment.mode.slice(1)}
                </div>
            </div>
        `;
        
        // Amount Cell
        const amountCell = document.createElement('td');
        amountCell.innerHTML = `
            <div class="amount">₹${payment.amount}</div>
        `;
        
        // Status Cell
        const statusCell = document.createElement('td');
        statusCell.innerHTML = `
            <span class="status-badge ${payment.status}">
                ${payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
            </span>
        `;
        
        // Actions Cell
        const actionsCell = document.createElement('td');
        actionsCell.innerHTML = `
            <div class="action-buttons">
                <button class="action-btn view-btn" onclick="viewReceipt(${payment.id})">
                    <i class="fas fa-eye"></i>
                    View
                </button>
                <button class="action-btn delete-btn" onclick="deletePayment(${payment.id})">
                    <i class="fas fa-trash"></i>
                    Delete
                </button>
            </div>
        `;
        
        row.appendChild(receiptCell);
        row.appendChild(studentInfoCell);
        row.appendChild(paymentDetailsCell);
        row.appendChild(amountCell);
        row.appendChild(statusCell);
        row.appendChild(actionsCell);
        
        paymentsTable.appendChild(row);
    });
}

// Update payment statistics
function updatePaymentStats() {
    const total = payments.reduce((sum, payment) => sum + payment.amount, 0);
    totalPayments.textContent = `₹${total}`;
    
    const today = new Date().toLocaleDateString();
    const todayTotal = payments
        .filter(payment => new Date(payment.date).toLocaleDateString() === today)
        .reduce((sum, payment) => sum + payment.amount, 0);
    todayPayments.textContent = `₹${todayTotal}`;
    
    const pending = payments.filter(payment => payment.status === 'pending').length;
    pendingPayments.textContent = pending;
}

// Search functionality
function handlePaymentSearch() {
    const searchTerm = searchPaymentInput.value.toLowerCase();
    
    filteredPayments = payments.filter(payment => {
        const student = students.find(s => s.id === payment.studentId);
        return (
            payment.receiptNo.toLowerCase().includes(searchTerm) ||
            (student && student.name.toLowerCase().includes(searchTerm)) ||
            payment.studentId.toString().includes(searchTerm)
        );
    });
    
    updatePaymentsTable();
}

// Modal functions
function showAddPaymentModal() {
    addPaymentModal.style.display = 'block';
    document.getElementById('paymentDate').valueAsDate = new Date();
}

function closeAddPaymentModal() {
    addPaymentModal.style.display = 'none';
    addPaymentForm.reset();
}

function showViewReceiptModal() {
    viewReceiptModal.style.display = 'block';
}

function closeViewReceiptModal() {
    viewReceiptModal.style.display = 'none';
}

// Form submission
addPaymentForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
        studentId: studentSelect.value,
        amount: document.getElementById('paymentAmount').value,
        date: document.getElementById('paymentDate').value,
        mode: document.getElementById('paymentMode').value,
        notes: document.getElementById('paymentNotes').value
    };
    
    try {
        const response = await fetch('/api/payments', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        if (response.ok) {
            const newPayment = await response.json();
            payments.push(newPayment);
            filteredPayments = [...payments];
            updatePaymentsTable();
            updatePaymentStats();
            closeAddPaymentModal();
            showNotification('Payment added successfully', 'success');
        } else {
            throw new Error('Failed to add payment');
        }
    } catch (error) {
        console.error('Error adding payment:', error);
        showNotification('Error adding payment', 'error');
    }
});

// View receipt
function viewReceipt(paymentId) {
    const payment = payments.find(p => p.id === paymentId);
    const student = students.find(s => s.id === payment.studentId);
    
    const receiptContent = document.querySelector('.receipt-content');
    receiptContent.innerHTML = `
        <div class="receipt">
            <div class="receipt-header">
                <h3>Saha Institute of Management & Technology</h3>
                <p>Payment Receipt</p>
            </div>
            <div class="receipt-body">
                <div class="receipt-info">
                    <p><strong>Receipt No:</strong> ${payment.receiptNo}</p>
                    <p><strong>Date:</strong> ${new Date(payment.date).toLocaleDateString()}</p>
                </div>
                <div class="student-info">
                    <p><strong>Student Name:</strong> ${student ? student.name : 'Unknown'}</p>
                    <p><strong>Student ID:</strong> ${payment.studentId}</p>
                </div>
                <div class="payment-info">
                    <p><strong>Amount:</strong> ₹${payment.amount}</p>
                    <p><strong>Payment Mode:</strong> ${payment.mode.charAt(0).toUpperCase() + payment.mode.slice(1)}</p>
                    ${payment.notes ? `<p><strong>Notes:</strong> ${payment.notes}</p>` : ''}
                </div>
            </div>
            <div class="receipt-footer">
                <p>This is a computer-generated receipt and does not require a signature.</p>
            </div>
        </div>
    `;
    
    showViewReceiptModal();
}

// Print receipt
function printReceipt() {
    const receiptContent = document.querySelector('.receipt-content').innerHTML;
    const printWindow = window.open('', '_blank');
    
    printWindow.document.write(`
        <html>
            <head>
                <title>Payment Receipt</title>
                <style>
                    body { font-family: Arial, sans-serif; }
                    .receipt { max-width: 800px; margin: 0 auto; padding: 20px; }
                    .receipt-header { text-align: center; margin-bottom: 20px; }
                    .receipt-body { margin-bottom: 20px; }
                    .receipt-footer { text-align: center; font-size: 12px; color: #666; }
                    @media print {
                        body { margin: 0; padding: 20px; }
                    }
                </style>
            </head>
            <body>
                ${receiptContent}
            </body>
        </html>
    `);
    
    printWindow.document.close();
    printWindow.print();
}

// Delete payment
async function deletePayment(paymentId) {
    if (confirm('Are you sure you want to delete this payment?')) {
        try {
            const response = await fetch(`/api/payments/${paymentId}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                payments = payments.filter(payment => payment.id !== paymentId);
                filteredPayments = filteredPayments.filter(payment => payment.id !== paymentId);
                updatePaymentsTable();
                updatePaymentStats();
                showNotification('Payment deleted successfully', 'success');
            } else {
                throw new Error('Failed to delete payment');
            }
        } catch (error) {
            console.error('Error deleting payment:', error);
            showNotification('Error deleting payment', 'error');
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

// Event Listeners
searchPaymentInput.addEventListener('input', handlePaymentSearch);

// Close modals when clicking outside
window.addEventListener('click', (e) => {
    if (e.target === addPaymentModal) {
        closeAddPaymentModal();
    }
    if (e.target === viewReceiptModal) {
        closeViewReceiptModal();
    }
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    fetchPayments();
    fetchStudents();
}); 
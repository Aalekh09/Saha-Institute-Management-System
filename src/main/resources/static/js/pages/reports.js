// DOM Elements
const reportPeriod = document.getElementById('reportPeriod');
const customDateRange = document.getElementById('customDateRange');
const startDate = document.getElementById('startDate');
const endDate = document.getElementById('endDate');
const tabButtons = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

// Chart instances
let revenueChart, studentChart, courseChart, paymentMethodChart;

// Initialize charts
function initializeCharts() {
    // Revenue Chart
    const revenueCtx = document.getElementById('revenueChart').getContext('2d');
    revenueChart = new Chart(revenueCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Revenue',
                data: [],
                borderColor: '#3498db',
                tension: 0.4,
                fill: false
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
                        callback: value => '₹' + value.toLocaleString()
                    }
                }
            }
        }
    });

    // Student Chart
    const studentCtx = document.getElementById('studentChart').getContext('2d');
    studentChart = new Chart(studentCtx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: 'New Students',
                data: [],
                backgroundColor: '#2ecc71'
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

    // Course Chart
    const courseCtx = document.getElementById('courseChart').getContext('2d');
    courseChart = new Chart(courseCtx, {
        type: 'doughnut',
        data: {
            labels: [],
            datasets: [{
                data: [],
                backgroundColor: [
                    '#3498db',
                    '#2ecc71',
                    '#e74c3c',
                    '#f1c40f',
                    '#9b59b6'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right'
                }
            }
        }
    });

    // Payment Method Chart
    const paymentCtx = document.getElementById('paymentMethodChart').getContext('2d');
    paymentMethodChart = new Chart(paymentCtx, {
        type: 'pie',
        data: {
            labels: [],
            datasets: [{
                data: [],
                backgroundColor: [
                    '#3498db',
                    '#2ecc71',
                    '#e74c3c',
                    '#f1c40f'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right'
                }
            }
        }
    });
}

// Fetch and update data
async function fetchReportData() {
    try {
        const period = reportPeriod.value;
        let url = '/api/reports';
        
        if (period === 'custom') {
            url += `?startDate=${startDate.value}&endDate=${endDate.value}`;
        } else {
            url += `?period=${period}`;
        }

        const response = await fetch(url);
        const data = await response.json();

        updateCharts(data);
        updateTables(data);
    } catch (error) {
        console.error('Error fetching report data:', error);
        showNotification('Error loading report data', 'error');
    }
}

// Update charts with new data
function updateCharts(data) {
    // Update Revenue Chart
    revenueChart.data.labels = data.revenue.labels;
    revenueChart.data.datasets[0].data = data.revenue.values;
    revenueChart.update();

    // Update Student Chart
    studentChart.data.labels = data.students.labels;
    studentChart.data.datasets[0].data = data.students.values;
    studentChart.update();

    // Update Course Chart
    courseChart.data.labels = data.courses.labels;
    courseChart.data.datasets[0].data = data.courses.values;
    courseChart.update();

    // Update Payment Method Chart
    paymentMethodChart.data.labels = data.paymentMethods.labels;
    paymentMethodChart.data.datasets[0].data = data.paymentMethods.values;
    paymentMethodChart.update();
}

// Update tables with new data
function updateTables(data) {
    // Revenue Table
    const revenueTable = document.querySelector('#revenue-tab tbody');
    revenueTable.innerHTML = data.revenue.details.map(item => `
        <tr>
            <td>${item.date}</td>
            <td>₹${item.totalRevenue.toLocaleString()}</td>
            <td>${item.newStudents}</td>
            <td>₹${item.averagePayment.toLocaleString()}</td>
        </tr>
    `).join('');

    // Students Table
    const studentsTable = document.querySelector('#students-tab tbody');
    studentsTable.innerHTML = data.students.details.map(item => `
        <tr>
            <td>${item.course}</td>
            <td>${item.totalStudents}</td>
            <td>${item.activeStudents}</td>
            <td>${item.completionRate}%</td>
        </tr>
    `).join('');

    // Courses Table
    const coursesTable = document.querySelector('#courses-tab tbody');
    coursesTable.innerHTML = data.courses.details.map(item => `
        <tr>
            <td>${item.name}</td>
            <td>${item.enrollments}</td>
            <td>₹${item.revenue.toLocaleString()}</td>
            <td>${item.popularity}%</td>
        </tr>
    `).join('');

    // Payments Table
    const paymentsTable = document.querySelector('#payments-tab tbody');
    paymentsTable.innerHTML = data.paymentMethods.details.map(item => `
        <tr>
            <td>${item.method}</td>
            <td>${item.count}</td>
            <td>₹${item.totalAmount.toLocaleString()}</td>
            <td>${item.percentage}%</td>
        </tr>
    `).join('');
}

// Tab switching
function switchTab(tabName) {
    tabButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabName);
    });

    tabContents.forEach(content => {
        content.classList.toggle('active', content.id === `${tabName}-tab`);
    });
}

// Export report
function exportReport(format) {
    const period = reportPeriod.value;
    let url = `/api/reports/export?format=${format}`;
    
    if (period === 'custom') {
        url += `&startDate=${startDate.value}&endDate=${endDate.value}`;
    } else {
        url += `&period=${period}`;
    }

    window.location.href = url;
}

// Event Listeners
// reportPeriod.addEventListener('change', () => {
//     customDateRange.style.display = reportPeriod.value === 'custom' ? 'flex' : 'none';
//     fetchReportData();
// });

// startDate.addEventListener('change', fetchReportData);
// endDate.addEventListener('change', fetchReportData);

// tabButtons.forEach(btn => {
//     btn.addEventListener('click', () => switchTab(btn.dataset.tab));
// });

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Only load the charts/tables that exist in the current HTML
    loadStudentAdmissions();
    loadMonthlyPayments();
    loadPendingFees();
    // loadEnquirySummary(); // Only if you add this table to the HTML
    
    // Students by month picker
    const monthPicker = document.getElementById('studentsMonthPicker');
    if (monthPicker) {
        monthPicker.value = getCurrentMonthString();
        loadStudentsByMonth();
        monthPicker.addEventListener('change', loadStudentsByMonth);
    }
    
    // Pending fees month picker
    const pendingFeesMonthPicker = document.getElementById('pendingFeesMonthPicker');
    if (pendingFeesMonthPicker) {
        pendingFeesMonthPicker.value = getCurrentMonthString();
        pendingFeesMonthPicker.addEventListener('change', loadPendingFeesByMonth);
    }
});

// Notification system
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Reports.js - Professional Reports Dashboard
const API_BASE = '/api/reports';

// 1. Monthly Student Admissions
async function loadStudentAdmissions() {
    const res = await fetch(`${API_BASE}/monthly-student-admissions`);
    const data = await res.json();
    const labels = data.map(row => row.month);
    const counts = data.map(row => row.count);
    // Chart
    renderBarChart('studentAdmissionsChart', labels, counts, 'New Students');
    // Table
    const tbody = document.querySelector('#studentAdmissionsTable tbody');
    let total = counts.reduce((sum, val) => sum + val, 0);
    tbody.innerHTML = data.map(row => `<tr><td>${row.month}</td><td>${row.count}</td></tr>`).join('');
    tbody.innerHTML += `<tr style='font-weight:bold;background:#f9f9f9;'><td style='text-align:right;'>Total</td><td>${total}</td></tr>`;
}

// 2. Monthly Payments Collected
async function loadMonthlyPayments() {
    const res = await fetch(`${API_BASE}/monthly-payments`);
    const data = await res.json();
    const labels = data.map(row => row.month);
    const totals = data.map(row => row.totalPayments);
    // Chart
    renderBarChart('monthlyPaymentsChart', labels, totals, 'Total Payments (₹)');
    // Table
    const tbody = document.querySelector('#monthlyPaymentsTable tbody');
    tbody.innerHTML = data.map(row => `<tr><td>${row.month}</td><td>₹${row.totalPayments.toLocaleString('en-IN', {minimumFractionDigits:2})}</td></tr>`).join('');
}

// 3. Pending Fees
async function loadPendingFees() {
    const res = await fetch(`${API_BASE}/pending-fees`);
    const data = await res.json();
    const tbody = document.querySelector('#pendingFeesTable tbody');
    const countDiv = document.getElementById('pendingFeesCount');
    
    if (data.length) {
        let total = 0;
        tbody.innerHTML = data.map(row => {
            total += Number(row.pendingAmount);
            const admissionDate = row.admissionDate ? new Date(row.admissionDate).toLocaleDateString('en-IN') : 'N/A';
            return `<tr><td>${row.studentName}</td><td>${row.course}</td><td>₹${row.pendingAmount}</td><td>${admissionDate}</td></tr>`;
        }).join('');
        tbody.innerHTML += `<tr style='font-weight:bold;background:#f9f9f9;'><td colspan='3' style='text-align:right;'>Total Pending Fees</td><td>₹${total.toLocaleString('en-IN', {minimumFractionDigits:2})}</td></tr>`;
        countDiv.textContent = `Total Students with Pending Fees: ${data.length}`;
    } else {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:#888;">No pending fees</td></tr>';
        countDiv.textContent = 'Total Students with Pending Fees: 0';
    }
}

// 3.1. Pending Fees by Month
async function loadPendingFeesByMonth() {
    const month = document.getElementById('pendingFeesMonthPicker').value;
    const tbody = document.querySelector('#pendingFeesTable tbody');
    const countDiv = document.getElementById('pendingFeesCount');
    
    if (!month) {
        await loadPendingFees();
        return;
    }
    
    tbody.innerHTML = '<tr><td colspan="4">Loading...</td></tr>';
    countDiv.textContent = '';
    
    try {
        const response = await fetch(`${API_BASE}/pending-fees-by-month?month=${month}`);
        const data = await response.json();
        
        if (data.length) {
            let total = 0;
            tbody.innerHTML = data.map(row => {
                total += Number(row.pendingAmount);
                const admissionDate = row.admissionDate ? new Date(row.admissionDate).toLocaleDateString('en-IN') : 'N/A';
                return `<tr><td>${row.studentName}</td><td>${row.course}</td><td>₹${row.pendingAmount}</td><td>${admissionDate}</td></tr>`;
            }).join('');
            tbody.innerHTML += `<tr style='font-weight:bold;background:#f9f9f9;'><td colspan='3' style='text-align:right;'>Total Pending Fees</td><td>₹${total.toLocaleString('en-IN', {minimumFractionDigits:2})}</td></tr>`;
            countDiv.textContent = `Students with Pending Fees (${month}): ${data.length}`;
        } else {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:#888;">No pending fees found for this month.</td></tr>';
            countDiv.textContent = `Students with Pending Fees (${month}): 0`;
        }
    } catch (err) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:#888;">Error loading data.</td></tr>';
        countDiv.textContent = '';
    }
}

// 4. Enquiry Summary
async function loadEnquirySummary() {
    const res = await fetch(`${API_BASE}/monthly-enquiries`);
    const data = await res.json();
    const tbody = document.querySelector('#enquirySummaryTable tbody');
    tbody.innerHTML = data.map(row => `<tr><td>${row.month}</td><td>${row.totalEnquiries}</td></tr>`).join('');
}

// Chart.js Bar Chart Helper
function renderBarChart(canvasId, labels, data, label) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (window[canvasId + '_chart']) window[canvasId + '_chart'].destroy();
    window[canvasId + '_chart'] = new Chart(ctx, {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                label,
                data,
                backgroundColor: 'rgba(54, 162, 235, 0.6)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1,
                borderRadius: 6,
                maxBarThickness: 32
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false },
                title: { display: false }
            },
            scales: {
                x: { grid: { display: false } },
                y: { beginAtZero: true, grid: { color: '#eee' } }
            }
        }
    });
}

// Excel Export Helper
function exportTableToExcel(tableId) {
    const table = document.getElementById(tableId);
    if (!table) return;
    const wb = XLSX.utils.table_to_book(table, {sheet: "Report"});
    XLSX.writeFile(wb, `${tableId}_${new Date().toISOString().slice(0,10)}.xlsx`);
}

// === Students By Month Feature ===
function getCurrentMonthString() {
    const now = new Date();
    return now.toISOString().slice(0, 7); // 'YYYY-MM'
}

async function loadStudentsByMonth() {
    const month = document.getElementById('studentsMonthPicker').value;
    const tableBody = document.querySelector('#studentsByMonthTable tbody');
    const countDiv = document.getElementById('studentsByMonthCount');
    tableBody.innerHTML = '<tr><td colspan="4">Loading...</td></tr>';
    countDiv.textContent = '';
    try {
        const response = await fetch(`/api/reports/students-by-month?month=${month}`);
        const students = await response.json();
        if (students.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="4">No students found for this month.</td></tr>';
            countDiv.textContent = 'Total Students: 0';
            return;
        }
        countDiv.textContent = `Total Students: ${students.length}`;
        tableBody.innerHTML = students.map((s, idx) => `
            <tr>
                <td>${idx + 1}</td>
                <td>${s.name || ''}</td>
                <td>${s.fatherName || ''}</td>
                <td>${s.courses || ''}</td>
            </tr>
        `).join('');
    } catch (err) {
        tableBody.innerHTML = '<tr><td colspan="4">Error loading data.</td></tr>';
        countDiv.textContent = '';
    }
}
window.loadStudentsByMonth = loadStudentsByMonth;
window.loadPendingFeesByMonth = loadPendingFeesByMonth; 
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
reportPeriod.addEventListener('change', () => {
    customDateRange.style.display = reportPeriod.value === 'custom' ? 'flex' : 'none';
    fetchReportData();
});

startDate.addEventListener('change', fetchReportData);
endDate.addEventListener('change', fetchReportData);

tabButtons.forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializeCharts();
    fetchReportData();
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
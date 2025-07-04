// Attendance Panel JS

document.addEventListener('DOMContentLoaded', () => {
    loadBatches();
    document.getElementById('loadAttendanceBtn').addEventListener('click', loadAttendance);
    document.getElementById('submitAttendanceBtn').addEventListener('click', submitAttendance);
    // Set default date to today
    document.getElementById('attendanceDate').value = new Date().toISOString().slice(0, 10);
    // History filter setup
    loadHistoryBatches();
    document.getElementById('historyBatchSelect').addEventListener('change', loadHistoryStudents);
    document.getElementById('showHistoryBtn').addEventListener('click', showAttendanceHistory);
    loadAllStudents();
    loadAssignBatches();
    document.getElementById('assignToBatchBtn').addEventListener('click', assignSelectedToBatch);
    document.getElementById('selectAllStudents').addEventListener('change', function() {
        const checked = this.checked;
        document.querySelectorAll('#allStudentsTable tbody input[type=checkbox]').forEach(cb => cb.checked = checked);
    });
});

let currentStudents = [];
let attendanceLocked = false;

async function loadBatches() {
    const batchSelect = document.getElementById('batchSelect');
    batchSelect.innerHTML = '<option>Loading...</option>';
    const res = await fetch('/api/batches');
    const batches = await res.json();
    batchSelect.innerHTML = batches.map(b => `<option value="${b.id}">${b.name} (${b.startTime} - ${b.endTime})</option>`).join('');
    if (batches.length > 0) loadAttendance();
}

async function loadAttendance() {
    const batchId = document.getElementById('batchSelect').value;
    const date = document.getElementById('attendanceDate').value;
    if (!batchId || !date) return;
    // Load students in batch
    const res = await fetch(`/api/batches/${batchId}/students`);
    currentStudents = await res.json();
    // Load existing attendance
    const attRes = await fetch(`/api/attendance?batchId=${batchId}&date=${date}`);
    const attendance = await attRes.json();
    // Map studentId to attendance
    const attMap = {};
    attendance.forEach(a => { attMap[a.student.id] = a; });
    // Check if attendance is locked (any record older than 24h)
    attendanceLocked = attendance.some(a => a.lastUpdated && (new Date() - new Date(a.lastUpdated)) > 24*3600*1000);
    renderAttendanceTable(currentStudents, attMap);
    document.getElementById('submitAttendanceBtn').disabled = attendanceLocked;
    document.getElementById('attendanceMessage').textContent = attendanceLocked ? 'Attendance is locked for this date/batch (older than 24 hours).' : '';
}

function renderAttendanceTable(students, attMap) {
    const tbody = document.querySelector('#attendanceTable tbody');
    if (!students.length) {
        tbody.innerHTML = '<tr><td colspan="2">No students in this batch.</td></tr>';
        return;
    }
    tbody.innerHTML = students.map(s => {
        const checked = attMap[s.id]?.status === 'present' ? 'checked' : '';
        const disabled = attendanceLocked ? 'disabled' : '';
        return `<tr>
            <td>${s.name}</td>
            <td><input type="checkbox" data-student-id="${s.id}" ${checked} ${disabled}></td>
        </tr>`;
    }).join('');
}

async function submitAttendance() {
    if (attendanceLocked) return;
    const batchId = document.getElementById('batchSelect').value;
    const date = document.getElementById('attendanceDate').value;
    const checkboxes = document.querySelectorAll('#attendanceTable input[type=checkbox]');
    const attendanceList = Array.from(checkboxes).map(cb => ({
        studentId: Number(cb.getAttribute('data-student-id')),
        status: cb.checked ? 'present' : 'absent'
    }));
    const res = await fetch(`/api/attendance/mark?batchId=${batchId}&date=${date}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(attendanceList)
    });
    const msg = await res.text();
    document.getElementById('attendanceMessage').textContent = msg;
    loadAttendance(); // Refresh
}

window.toggleHistoryPanel = function() {
    const panel = document.getElementById('historyPanel');
    panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
};

async function loadHistoryBatches() {
    const batchSelect = document.getElementById('historyBatchSelect');
    batchSelect.innerHTML = '<option>Loading...</option>';
    const res = await fetch('/api/batches');
    const batches = await res.json();
    batchSelect.innerHTML = batches.map(b => `<option value="${b.id}">${b.name} (${b.startTime} - ${b.endTime})</option>`).join('');
    loadHistoryStudents();
}

async function loadHistoryStudents() {
    const batchId = document.getElementById('historyBatchSelect').value;
    const studentSelect = document.getElementById('historyStudentSelect');
    if (!batchId) { studentSelect.innerHTML = '<option value="">All</option>'; return; }
    const res = await fetch(`/api/batches/${batchId}/students`);
    const students = await res.json();
    studentSelect.innerHTML = '<option value="">All</option>' + students.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
}

async function showAttendanceHistory() {
    const batchId = document.getElementById('historyBatchSelect').value;
    const studentId = document.getElementById('historyStudentSelect').value;
    const startDate = document.getElementById('historyStartDate').value;
    const endDate = document.getElementById('historyEndDate').value;
    let records = [];
    if (studentId) {
        // Fetch all attendance for student, filter by batch and date range
        const res = await fetch(`/api/attendance/student/${studentId}`);
        records = await res.json();
        if (batchId) records = records.filter(r => r.batch.id == batchId);
    } else {
        // Fetch all attendance for batch, filter by date range
        if (!batchId) return;
        // For each date in range, fetch attendance for batch
        if (startDate && endDate) {
            let cur = new Date(startDate);
            const end = new Date(endDate);
            while (cur <= end) {
                const dateStr = cur.toISOString().slice(0,10);
                const res = await fetch(`/api/attendance?batchId=${batchId}&date=${dateStr}`);
                const dayRecords = await res.json();
                records = records.concat(dayRecords);
                cur.setDate(cur.getDate() + 1);
            }
        } else {
            // If no range, just today
            const dateStr = new Date().toISOString().slice(0,10);
            const res = await fetch(`/api/attendance?batchId=${batchId}&date=${dateStr}`);
            records = await res.json();
        }
    }
    // Filter by date range if needed
    if (startDate) records = records.filter(r => r.date >= startDate);
    if (endDate) records = records.filter(r => r.date <= endDate);
    renderAttendanceHistory(records);
}

function renderAttendanceHistory(records) {
    const tbody = document.querySelector('#attendanceHistoryTable tbody');
    if (!records.length) {
        tbody.innerHTML = '<tr><td colspan="4">No records found.</td></tr>';
        return;
    }
    tbody.innerHTML = records.map(r => `
        <tr>
            <td>${r.date}</td>
            <td>${r.batch?.name || ''}</td>
            <td>${r.student?.name || ''}</td>
            <td>${r.status === 'present' ? 'Present' : 'Absent'}</td>
        </tr>
    `).join('');
}

async function loadAllStudents() {
    const res = await fetch('/api/students');
    const students = await res.json();
    const tbody = document.querySelector('#allStudentsTable tbody');
    tbody.innerHTML = students.map((s, i) => `
        <tr class="${i % 2 === 0 ? 'even' : 'odd'}">
            <td><input type="checkbox" data-student-id="${s.id}"></td>
            <td>${s.name}</td>
            <td>${s.fatherName || ''}</td>
            <td>${s.admissionDate || ''}</td>
            <td>${(s.batches || []).map(b => b.name).join(', ')}</td>
        </tr>
    `).join('');
}

async function loadAssignBatches() {
    const batchSelect = document.getElementById('assignBatchSelect');
    const noBatchesMsg = document.getElementById('noBatchesMsg');
    batchSelect.innerHTML = '<option value="">Select Batch</option>';
    const res = await fetch('/api/batches');
    const batches = await res.json();
    if (batches.length === 0) {
        noBatchesMsg.style.display = '';
        document.getElementById('assignToBatchBtn').disabled = true;
    } else {
        noBatchesMsg.style.display = 'none';
        batchSelect.innerHTML = '<option value="">Select Batch</option>' + batches.map(b => `<option value="${b.id}">${b.name} (${b.startTime} - ${b.endTime})</option>`).join('');
        document.getElementById('assignToBatchBtn').disabled = true;
    }
    batchSelect.addEventListener('change', function() {
        document.getElementById('assignToBatchBtn').disabled = !this.value;
    });
}

async function assignSelectedToBatch() {
    const batchId = document.getElementById('assignBatchSelect').value;
    const checkboxes = document.querySelectorAll('#allStudentsTable tbody input[type=checkbox]:checked');
    const studentIds = Array.from(checkboxes).map(cb => Number(cb.getAttribute('data-student-id')));
    const assignMsg = document.getElementById('assignMsg');
    if (!batchId || studentIds.length === 0) {
        assignMsg.textContent = 'Please select at least one student and a batch.';
        assignMsg.style.color = '#c00';
        return;
    }
    await fetch(`/api/batches/${batchId}/students`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(studentIds)
    });
    loadAllStudents(); // Refresh assignments
    loadBatches(); // Refresh batch dropdowns
    assignMsg.textContent = 'Students assigned to batch successfully!';
    assignMsg.style.color = '#080';
    setTimeout(() => assignMsg.textContent = '', 2000);
} 
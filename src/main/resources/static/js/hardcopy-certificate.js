// Helper: Title Case
function titleCase(str) {
    return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
}

// Test function to manually show certificate details panel
function testCertificateDetails() {
    console.log('Test function called');
    const testData = {
        name: 'John Doe',
        registration: 'REG123456',
        certificate: 'Computer Science',
        Grade: 'A+'
    };
    
    console.log('Showing test certificate details with data:', testData);
    showCertificateDetails(testData, 'TEST-CERT-001');
}

// Function to show certificate details panel
function showCertificateDetails(data, certificateId) {
    console.log('showCertificateDetails called with:', data, certificateId);
    
    const detailsPanel = document.getElementById('certificateDetailsPanel');
    console.log('Details panel element:', detailsPanel);
    
    if (!detailsPanel) {
        console.error('Certificate details panel not found!');
        return;
    }
    
    // Populate certificate details with only essential information
    document.getElementById('detailStudentName').textContent = titleCase(data.name);
    document.getElementById('detailRegistrationNo').textContent = data.registration;
    document.getElementById('detailIssueDate').textContent = new Date().toLocaleDateString();
    document.getElementById('detailCertificateId').textContent = certificateId || 'CERT-' + data.registration;
    document.getElementById('detailCourseName').textContent = titleCase(data.certificate);
    document.getElementById('detailGrade').textContent = data.Grade;
    document.getElementById('detailStatus').textContent = 'Issued';
    
    console.log('Certificate details populated successfully');
    
    // Panel is always visible, no need to show/hide
    console.log('Certificate details panel updated');
}

// Function to load existing certificate data
async function loadExistingCertificates() {
    try {
        console.log('Loading existing certificates...');
        const response = await fetch('/api/certificates');
        
        if (response.ok) {
            const certificates = await response.json();
            console.log('Loaded certificates:', certificates);
            
            if (certificates.length > 0) {
                // Show the most recent certificate
                const latestCertificate = certificates[certificates.length - 1];
                displayCertificateData(latestCertificate);
            } else {
                // No certificates found, show empty state
                displayEmptyCertificateData();
            }
        } else {
            console.error('Failed to load certificates');
            displayEmptyCertificateData();
        }
    } catch (error) {
        console.error('Error loading certificates:', error);
        displayEmptyCertificateData();
    }
}

// Function to display certificate data in the panel
function displayCertificateData(certificate) {
    console.log('Displaying certificate data:', certificate);
    
    document.getElementById('detailStudentName').textContent = certificate.student ? certificate.student.name : certificate.registrationNumber || '-';
    document.getElementById('detailRegistrationNo').textContent = certificate.registrationNumber || '-';
    document.getElementById('detailIssueDate').textContent = certificate.issueDate ? new Date(certificate.issueDate).toLocaleDateString() : '-';
    document.getElementById('detailCertificateId').textContent = certificate.id ? 'CERT-' + certificate.id : '-';
    document.getElementById('detailCourseName').textContent = certificate.type || '-';
    document.getElementById('detailGrade').textContent = certificate.grade || '-';
    document.getElementById('detailStatus').textContent = certificate.status || 'Active';
    
    // Update status badge
    const statusElement = document.getElementById('certificateStatus');
    if (statusElement) {
        statusElement.textContent = certificate.status || 'Active';
        statusElement.className = `certificate-status ${certificate.status === 'Issued' ? 'status-issued' : 'status-pending'}`;
    }
}

// Function to display empty certificate data
function displayEmptyCertificateData() {
    console.log('Displaying empty certificate data');
    
    document.getElementById('detailStudentName').textContent = 'No certificates found';
    document.getElementById('detailRegistrationNo').textContent = '-';
    document.getElementById('detailIssueDate').textContent = '-';
    document.getElementById('detailCertificateId').textContent = '-';
    document.getElementById('detailCourseName').textContent = '-';
    document.getElementById('detailGrade').textContent = '-';
    document.getElementById('detailStatus').textContent = 'No Data';
    
    // Update status badge
    const statusElement = document.getElementById('certificateStatus');
    if (statusElement) {
        statusElement.textContent = 'No Data';
        statusElement.className = 'certificate-status status-pending';
    }
}

// Function to save certificate to backend
async function saveCertificateToBackend(data) {
    try {
        const certificateData = {
            type: data.certificate,
            issueDate: new Date().toISOString().split('T')[0],
            validUntil: null,
            remarks: `Course: ${data.certificate}, Duration: ${data.duration}, Grade: ${data.Grade}`,
            status: "Issued",
            // Additional fields for hardcopy certificate
            registrationNumber: data.registration,
            rollNumber: data.rollno,
            examRollNumber: data.erollno,
            courseDuration: data.duration,
            performance: data.performance,
            grade: data.Grade,
            issueSession: data.IssueSession,
            issueDay: parseInt(data.IssueDay),
            issueMonth: data.IssueMonth,
            issueYear: parseInt(data.IssueYear),
            fathersName: data.fathersname,
            mothersName: data.mothersname,
            dateOfBirth: data.dob
        };
        
        const response = await fetch('/api/certificates', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(certificateData)
        });
        
        if (response.ok) {
            const savedCertificate = await response.json();
            return savedCertificate.id;
        } else {
            console.error('Failed to save certificate to backend');
            return null;
        }
    } catch (error) {
        console.error('Error saving certificate:', error);
        return null;
    }
}

// Ensure the DOM is fully loaded before running the script
document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM loaded, initializing certificate page...');
    
    // Load existing certificates when page loads
    await loadExistingCertificates();
    
    // Add subject rows logic
    const subjectsArea = document.getElementById('subjectsArea');
    const addSubjectBtn = document.getElementById('addSubjectBtn');
    let subjectCount = 0;

    function addSubjectRow() {
        if (subjectCount >= 6) return;
        const tr = document.createElement('tr');
        tr.className = 'subject-row';
        tr.innerHTML = `
            <td><input type="text" name="subject${subjectCount}" placeholder="Subject Name" required></td>
            <td><input type="number" name="theory${subjectCount}" placeholder="Theory" min="0" max="30" required class="marks-input"></td>
            <td><input type="number" name="practical${subjectCount}" placeholder="Practical" min="0" max="70" required class="marks-input"></td>
            <td><input type="number" name="obtained${subjectCount}" placeholder="Obtained" min="0" max="100" required readonly style="background:#e9ecef;"></td>
            <td><button type="button" onclick="this.closest('tr').remove(); subjectCount--;">Remove</button></td>
        `;
        subjectsArea.appendChild(tr);
        subjectCount++;
    }

    // Add event listener to the table body for delegation
    subjectsArea.addEventListener('input', function(e) {
        if (e.target.classList.contains('marks-input')) {
            const row = e.target.closest('tr');
            const theoryInput = row.querySelector('input[name^="theory"]');
            const practicalInput = row.querySelector('input[name^="practical"]');
            const obtainedInput = row.querySelector('input[name^="obtained"]');

            const theory = parseInt(theoryInput.value, 10) || 0;
            const practical = parseInt(practicalInput.value, 10) || 0;

            // Cap the values to their max
            if (theory > 30) theoryInput.value = 30;
            if (practical > 70) practicalInput.value = 70;

            obtainedInput.value = (parseInt(theoryInput.value, 10) || 0) + (parseInt(practicalInput.value, 10) || 0);
        }
    });

    if (addSubjectBtn) {
        addSubjectBtn.onclick = addSubjectRow;
        // Add one row by default
        addSubjectRow();
    }

    // Custom file input label
    const fileInput = document.getElementById('photo');
    const fileInputLabel = document.querySelector('.file-input-label');
    if (fileInput && fileInputLabel) {
        fileInput.addEventListener('change', function() {
            fileInputLabel.textContent = this.files[0] ? this.files[0].name : 'Choose File';
        });
    }

    // Certificate details panel action buttons
    const viewCertificateBtn = document.getElementById('viewCertificateBtn');
    const downloadCertificateBtn = document.getElementById('downloadCertificateBtn');
    const printCertificateBtn = document.getElementById('printCertificateBtn');
    const editCertificateBtn = document.getElementById('editCertificateBtn');

    if (viewCertificateBtn) {
        viewCertificateBtn.addEventListener('click', function() {
            // Open certificate in new window for viewing
            window.open(`certificate_${document.getElementById('detailRegistrationNo').textContent}.pdf`, '_blank');
        });
    }

    if (downloadCertificateBtn) {
        downloadCertificateBtn.addEventListener('click', function() {
            // Trigger download of the generated PDF
            const link = document.createElement('a');
            link.href = `certificate_${document.getElementById('detailRegistrationNo').textContent}.pdf`;
            link.download = `certificate_${document.getElementById('detailRegistrationNo').textContent}.pdf`;
            link.click();
        });
    }

    if (printCertificateBtn) {
        printCertificateBtn.addEventListener('click', function() {
            // Open print dialog for the certificate
            const printWindow = window.open(`certificate_${document.getElementById('detailRegistrationNo').textContent}.pdf`, '_blank');
            printWindow.onload = function() {
                printWindow.print();
            };
        });
    }

    if (editCertificateBtn) {
        editCertificateBtn.addEventListener('click', function() {
            // Hide details panel and show form for editing
            document.getElementById('certificateDetailsPanel').style.display = 'none';
            document.getElementById('certificateForm').scrollIntoView({ behavior: 'smooth' });
        });
    }

    const certificateForm = document.getElementById('certificateForm');
    if (certificateForm) {
        console.log('Certificate form found and event listener attached');
        certificateForm.onsubmit = async function(e) {
            console.log('Certificate form submitted');
            e.preventDefault();
            const form = e.target;
            // Gather form data
            const data = {};
            for (const el of form.elements) {
                if (el.name && el.type !== 'file') data[el.name] = el.value;
            }
            console.log('Form data gathered:', data);
            
            // Gather subjects
            const rows = [];
            for (let i = 0; i < 6; i++) {
                const subject = form[`subject${i}`];
                if (subject) {
                    rows.push({
                        subject: subject.value,
                        theory: form[`theory${i}`].value,
                        practical: form[`practical${i}`].value,
                        obtained: form[`obtained${i}`].value
                    });
                }
            }
            data.rows = rows;
            console.log('Subject rows gathered:', rows);
            
            // Prepare QR data as a formatted string for readability
            const qrDataString = `
SAHA INSTITUTE CERTIFICATE VERIFICATION
---------------------------------------
Student Name: ${data.name}
Registration No: ${data.registration}
Roll No: ${data.rollno}
Session: ${data.IssueSession}
Certificate: ${data.certificate}
Grade: ${data.Grade}
            `.trim();

            // Generate QR code
            const qrDataUrl = await new Promise((resolve, reject) => {
                QRCode.toDataURL(qrDataString, { width: 200, margin: 2 }, (err, url) => {
                    if (err) reject(err);
                    else resolve(url);
                });
            });
            // Generate barcode (using registration number for reliability)
            JsBarcode("#barcodeCanvas", data.registration, { format: "CODE128", displayValue: false });
            const barcodeDataUrl = document.getElementById('barcodeCanvas').toDataURL("image/png");
            // Watermark
            const watermarkCanvas = document.getElementById('watermarkCanvas');
            const ctx = watermarkCanvas.getContext('2d');
            ctx.clearRect(0, 0, 400, 400);
            ctx.fillStyle = 'rgba(200, 200, 200, 0.1)';
            ctx.font = 'bold 48px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('SAHA INSTITUTE', 200, 200);
            const watermarkDataUrl = watermarkCanvas.toDataURL('image/png');
            // Photo
            let photoDataUrl = watermarkDataUrl;
            const photoInput = form['photo'];
            if (photoInput.files && photoInput.files[0]) {
                photoDataUrl = await new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onload = e => resolve(e.target.result);
                    reader.readAsDataURL(photoInput.files[0]);
                });
            }
            // Generate PDF
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4', margin: 1 });
            // Add images
            doc.addImage(barcodeDataUrl, 'PNG', 450, 70, 85, 14);
            doc.addImage(qrDataUrl, 'JPEG', 80, 100, 85, 80);
            doc.addImage(photoDataUrl, "JPEG", 450, 100, 85, 70);
            // Add text fields
            doc.setFontSize(14);
            doc.text(`${data.registration}`, 80, 80);
            doc.text(`${titleCase(data.name)}`, 220, 180);
            doc.text(`${titleCase(data.fathersname)}`, 220, 205);
            doc.text(`${titleCase(data.mothersname)}`, 220, 230);
            doc.text(`${data.dob}`, 440, 230);
            doc.text(`${data.rollno}`, 145, 260);
            doc.text(`${data.erollno}`, 310, 260);
            doc.text(`${data.IssueSession}`, 440, 260);
            doc.text(`${data.duration}`, 220, 290);
            doc.text(`${titleCase(data.performance)}`, 345, 340);
            doc.setFont("helvetica", "bold");
            doc.text(`${titleCase(data.certificate)}`, 300, 430, null, null, "center");
            // Table Headers
            const tableStartY = 465;
            const pageWidth = doc.internal.pageSize.width;
            const rectangleWidth = 440;
            const x = ((pageWidth - rectangleWidth) / 2) + 10;
            doc.setFontSize(11);
            doc.setLineWidth(2);
            doc.rect(x, tableStartY, rectangleWidth, 15);
            doc.text("S.NO", 95, tableStartY + 10);
            doc.text("Subject", 130, tableStartY + 10);
            doc.text("Total", 330, tableStartY + 10);
            doc.text("Theory", 365, tableStartY + 10);
            doc.text("Practical", 410, tableStartY + 10);
            doc.text("Obtained", 465, tableStartY + 10);
            // Add Rows
            let totalTheory = 0;
            let totalPractical = 0;
            let totalObtained = 0;
            const maxRows = 6;
            let maxMarks = 0;
            doc.setFont("times", "normal");
            for (let index = 0; index < maxRows; index++) {
                const rowY = tableStartY + 15 + index * 15;
                doc.rect(x, rowY, rectangleWidth, 15);
                if (rows[index] !== undefined) {
                    doc.text(`${index + 1}`, 95, rowY + 10);
                    doc.text(`${titleCase(rows[index].subject) || ""}`, 130, rowY + 10);
                    doc.text(`100`, 330, rowY + 10);
                    doc.text(`${rows[index].theory || ""}`, 365, rowY + 10);
                    doc.text(`${rows[index].practical || ""}`, 410, rowY + 10);
                    doc.text(`${rows[index].obtained || ""}`, 465, rowY + 10);
                    maxMarks += 100;
                    totalTheory += rows[index].theory ? parseInt(rows[index].theory, 10) : 0;
                    totalPractical += rows[index].practical ? parseInt(rows[index].practical, 10) : 0;
                    totalObtained += rows[index].obtained ? parseInt(rows[index].obtained, 10) : 0;
                }
            }
            // Add Total Row
            const totalRowY = tableStartY + 15 + maxRows * 15;
            doc.rect(x, totalRowY, rectangleWidth, 15);
            doc.text("Total", 130, totalRowY + 10);
            doc.text(`${maxMarks}`, 320, totalRowY + 10);
            doc.text(`${totalTheory}`, 365, totalRowY + 10);
            doc.text(`${totalPractical}`, 410, totalRowY + 10);
            doc.text(`${totalObtained}`, 465, totalRowY + 10);
            // Add Issue Details
            doc.setFontSize(16);
            doc.text(`${data.Grade}`, 240, 610);
            doc.text(`${data.IssueDay}`, 240, 635);
            doc.text(` ${titleCase(data.IssueMonth)} ${data.IssueYear}`, 355, 635);
            // Save PDF
            doc.save(`certificate_${data.registration}.pdf`);
            console.log('PDF saved successfully');
            
            // Save certificate to backend and show details panel
            console.log('Attempting to save certificate to backend...');
            const certificateId = await saveCertificateToBackend(data);
            console.log('Certificate saved to backend, ID:', certificateId);
            
            console.log('Calling showCertificateDetails...');
            showCertificateDetails(data, certificateId);
            console.log('Certificate details panel should now be visible');
            
            // Refresh the certificate list to show the new certificate
            await loadExistingCertificates();
        };
    } else {
        console.error('Certificate form not found!');
    }
}); 
// Helper: Title Case
function titleCase(str) {
    return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
}

// Ensure the DOM is fully loaded before running the script
document.addEventListener('DOMContentLoaded', () => {
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

    const certificateForm = document.getElementById('certificateForm');
    if (certificateForm) {
        certificateForm.onsubmit = async function(e) {
            e.preventDefault();
            const form = e.target;
            // Gather form data
            const data = {};
            for (const el of form.elements) {
                if (el.name && el.type !== 'file') data[el.name] = el.value;
            }
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
        };
    }
}); 
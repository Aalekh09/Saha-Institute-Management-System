document.addEventListener('DOMContentLoaded', function() {
    // Initialize variables
    const certificateForm = document.getElementById('certificateForm');
    const studentName = document.getElementById('studentName');
    const courseName = document.getElementById('courseName');
    const certificateType = document.getElementById('certificateType');
    const previewCertificateBtn = document.getElementById('previewCertificate');
    const downloadCertificateBtn = document.getElementById('downloadCertificate');
    const printCertificateBtn = document.getElementById('printCertificate');

    // Tab Navigation
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            tabButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Get the target panel from data attribute
            const targetPanel = this.getAttribute('data-target');
            
            // Hide all panels
            document.querySelectorAll('.tab-content').forEach(panel => {
                panel.classList.remove('active');
            });
            
            // Show target panel
            if (targetPanel) {
                const panel = document.getElementById(targetPanel);
                if (panel) {
                    panel.classList.add('active');
                    
                    // Load content based on panel
                    switch(targetPanel) {
                        case 'dashboard-panel':
                            loadStudentList();
                            break;
                        case 'students-panel':
                            loadStudentList();
                            break;
                        case 'attendance-panel':
                            loadAttendanceList();
                            break;
                        case 'results-panel':
                            loadResultsList();
                            break;
                        case 'courses-panel':
                            loadCoursesList();
                            break;
                        case 'schedule-panel':
                            loadScheduleList();
                            break;
                        case 'certificates-panel':
                            loadCertificatesList();
                            break;
                        case 'templates-panel':
                            loadTemplatesList();
                            break;
                    }
                }
            }
        });
    });

    // Function to load student list
    async function loadStudentList() {
        try {
            const response = await fetch('/api/students');
            if (response.ok) {
                const students = await response.json();
                displayStudentList(students);
            } else {
                throw new Error('Failed to load students');
            }
        } catch (error) {
            console.error('Error loading students:', error);
            showNotification('Error loading student list', 'error');
        }
    }

    // Function to display student list
    function displayStudentList(students) {
        const dashboardPanel = document.getElementById('dashboard-panel');
        if (!dashboardPanel) return;

        const tableBody = dashboardPanel.querySelector('tbody');
        if (!tableBody) return;

        tableBody.innerHTML = students.map(student => `
            <tr>
                <td>${student.name}</td>
                <td>${student.rollNumber || '-'}</td>
                <td>${student.course || '-'}</td>
                <td>${student.email || '-'}</td>
                <td>${student.phone || '-'}</td>
                <td>
                    <button class="btn-icon" onclick="viewStudent('${student.id}')" title="View">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-icon" onclick="editStudent('${student.id}')" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    // Set default dates
    // const today = new Date(); // Removed
    // issueDate.valueAsDate = today; // Removed
    // validUntil.valueAsDate = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate()); // Removed

    // Event Listeners
    certificateForm.addEventListener('submit', handleCertificateGeneration);
    previewCertificateBtn.addEventListener('click', showCertificatePreview);
    downloadCertificateBtn.addEventListener('click', downloadCertificate);
    printCertificateBtn.addEventListener('click', printCertificate);

    // Add real-time preview updates
    // Remove event listeners for date fields
    studentName.addEventListener('input', updatePreview);
    courseName.addEventListener('input', updatePreview);
    certificateType.addEventListener('change', updatePreview);
    // issueDate.addEventListener('change', updatePreview); // Removed
    // validUntil.addEventListener('change', updatePreview); // Removed
    const studentIdInput = document.getElementById('studentIdInput');
    studentIdInput.addEventListener('input', updatePreview);

    // Functions
    function updatePreview() {
        console.log('updatePreview called');
        const data = {
            student: {
                name: studentName.value || '[Student Name]',
                courseName: courseName.value || '[Course Name]',
                studentId: studentIdInput.value || '[ID]'
            },
            type: certificateType.value || 'Completion',
            // issueDate: issueDate.value || '[Date]', // Removed
            // validUntil: validUntil.value || '[Date]' // Removed
        };
     
        updatePreviewContent(data);
    }

    async function handleCertificateGeneration(e) {
        e.preventDefault();

        const certificateData = {
            student: {
                name: studentName.value,
                courseName: courseName.value
            },
            type: certificateType.value,
            // issueDate: issueDate.value, // Removed
            // validUntil: validUntil.value, // Removed
            status: 'Active',
            certificateId: generateCertificateId({
                type: certificateType.value
            })
        };

        try {
            const response = await fetch('/api/certificates', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(certificateData)
            });

            if (response.ok) {
                const certificate = await response.json();
                showNotification('Certificate generated successfully!', 'success');
                updatePreviewContent(certificateData);
                loadCertificates(); // Reload the certificate list
            } else {
                const errorText = await response.text();
                throw new Error(`Failed to generate certificate: ${response.status} - ${errorText}`);
            }
        } catch (error) {
            console.error('Error generating certificate:', error);
            showNotification(`Error generating certificate: ${error.message}`, 'error');
        }
    }

    function showCertificatePreview() {
        updatePreview();
    }

    function updatePreviewContent(data) {
        console.log('updatePreviewContent called with data:', data);
        
        // Update student ID
        const studentIdElement = document.getElementById('certificateId');
        if (studentIdElement) {
            studentIdElement.textContent = data.student.studentId;
            console.log('Updated student ID to:', studentIdElement.textContent);
        }
        
        // Update certificate type
        const certificateTypeElement = document.querySelector('.certificate-type-professional');
        console.log('Certificate type element:', certificateTypeElement);
        if (certificateTypeElement) {
            certificateTypeElement.textContent = `CERTIFICATE OF ${data.type.toUpperCase()}`;
            console.log('Updated certificate type to:', certificateTypeElement.textContent);
        }

        // Update certificate ID
        const certificateIdElement = document.getElementById('certificateId');
        console.log('Certificate ID element:', certificateIdElement);
        if (certificateIdElement) {
             // Keep the placeholder or generate if needed elsewhere
             // For preview, we can just show a placeholder or generated ID
             certificateIdElement.textContent = `SIMT-${data.student.studentId}`;
             console.log('Updated certificate ID to:', certificateIdElement.textContent);
        }

        // Update student name
        const studentNameElement = document.querySelector('.student-name-professional');
        console.log('Student name element:', studentNameElement);
        if (studentNameElement) {
            studentNameElement.textContent = data.student.name.toUpperCase(); // Assuming student name should be uppercase
            console.log('Updated student name to:', studentNameElement.textContent);
        }

        // Update course name
        const courseNameElement = document.querySelector('.course-name-professional');
        console.log('Course name element:', courseNameElement);
        if (courseNameElement) {
            courseNameElement.textContent = data.student.courseName;
            console.log('Updated course name to:', courseNameElement.textContent);
        }

        // Update dates (removed)
        // const issueDateElement = document.getElementById('previewIssueDate');
        // if (issueDateElement) issueDateElement.textContent = '';
        // const validUntilElement = document.getElementById('previewValidUntilDate');
        // if (validUntilElement) validUntilElement.textContent = '';

        // Update logo (using the new class)
        const logoImg = document.querySelector('.professional-logo');
        console.log('Logo element:', logoImg);
        if (logoImg) {
             // Assuming the logo path is correct in the HTML, no change needed here for path
             // If you want to dynamically change logo based on institute, add logic here
             console.log('Logo element found, path should be set in HTML');
        }

        // Remove updates for elements that no longer exist in the new design
        const verificationIdElement = document.getElementById('verificationId');
        if (verificationIdElement) verificationIdElement.textContent = ''; // Clear if it somehow exists

        // Signature image, QR code, Watermark, old seal images are removed in HTML
        // No need to update them here. The placeholder text in HTML can be kept or removed.

         // Update completion details text (adjusting since date is removed)
        const completionDetailsElement = document.querySelector('.completion-details-professional');
        if (completionDetailsElement) {
             // Removed date from this text
             completionDetailsElement.textContent = 'with outstanding performance.';
              console.log('Updated completion details to:', completionDetailsElement.textContent);
        }

         // Update signatory name and title (assuming static for now or needs input fields)
         const signatoryNameElement = document.querySelector('.signatory-name-professional');
         if(signatoryNameElement) {
              signatoryNameElement.textContent = '[Signatory Name]'; // Replace with actual data source
               console.log('Signatory name element found');
         }

         const signatoryTitleElement = document.querySelector('.signatory-title-professional');
          if(signatoryTitleElement) {
              signatoryTitleElement.textContent = '[Signatory Title]'; // Replace with actual data source
               console.log('Signatory title element found');
         }

         // Seals are image elements, their src is set in HTML. If dynamic update is needed,
         // add logic similar to the logo update based on data.
         const sealsSection = document.querySelector('.seals-section');
         if (sealsSection) {
              // console.log('Seals section found, images should be set in HTML or updated dynamically');
              // If you have image elements with specific classes/IDs within sealsSection,
              // you would select and update their src here based on your data.
         }

    }

    function formatDate(dateString) {
        // This function might not be needed if dates are removed, but keeping it for now
        if (!dateString || dateString === '[Date]') return '[Date]';
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    }


     // This function might not be needed for the professional portrait if there's no verification ID displayed
     // Keeping it in case it's used elsewhere or for future additions.
    // function generateVerificationId(certificateId) {
    //     // Generate a shorter verification ID based on the certificate ID
    //     return certificateId.split('-')[0] + '-' + Math.random().toString(36).substr(2, 6).toUpperCase();
    // }

    async function downloadCertificate() {
        const certificateElement = document.querySelector('.certificate-template');

        if (!certificateElement) {
            console.error('Certificate template element not found.');
            showNotification('Error: Certificate template not found for download.', 'error');
            return;
        }

        try {
            // Use html2canvas to capture the preview
            const canvas = await html2canvas(certificateElement, {
                scale: 2, // Increase scale for better resolution
                useCORS: true,
                allowTaint: true,
                logging: true, // Enable logging for debugging html2canvas
                // scrollY: -window.scrollY // Account for scroll position if needed
            });
            const imgData = canvas.toDataURL('image/jpeg', 1.0); // Get image data as JPEG

            // Create a link to download the image
            const link = document.createElement('a');
            link.href = imgData;
            link.download = `${studentName.value || 'certificate'}_${certificateType.value || 'completion'}.jpg`; // Dynamic filename
            link.click();
            
            showNotification('Certificate downloaded successfully!', 'success');
        } catch (error) {
            console.error('Error downloading certificate as JPG:', error);
            showNotification(`Error downloading certificate: ${error.message}`, 'error');
        }
    }

    function printCertificate() {
        try {
            const certificateElement = document.querySelector('.certificate-template');
             if (!certificateElement) {
                 console.error('Certificate template element not found for printing.');
                 showNotification('Error: Certificate template not found for printing.', 'error');
                 return;
            }

            const printWindow = window.open('', '_blank');
            
            printWindow.document.write(`
                <html>
                    <head>
                        <title>Certificate Print</title>
                        <style>
                            /* Add necessary print styles here */
                            body { margin: 0; padding: 0; }
                            .certificate-template {
                                width: 100%;
                                margin: 0;
                                box-shadow: none;
                                border: none; /* Remove border for print */
                            }
                            /* Adjust font sizes, margins, etc. for print if needed */
                        </style>
                    </head>
                    <body>
                        <div class="certificate-template"> ${certificateElement.innerHTML} </div>
                        <script>
                            window.onload = function() {
                                window.print();
                                window.onafterprint = function() {
                                    window.close();
                                };
                            };
                        </script>
                    </body>
                </html>
            `);
             printWindow.document.close(); // Close the document opened with .write()
             // printWindow.print(); // This might be called after onload in the new window script

             showNotification('Print window opened.', 'info');

        } catch (error) {
            console.error('Error printing certificate:', error);
            showNotification('Error printing certificate', 'error');
        }
    }

    function showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Use a small delay to allow the element to be added before adding the show class for transition
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        // Automatically remove the notification after a few seconds
        setTimeout(() => {
            notification.classList.remove('show');
            // Remove the element after the transition ends
            notification.addEventListener('transitionend', () => {
                notification.remove();
            });
        }, 3000); // Notification stays for 3 seconds
    }

    // Add a placeholder viewCertificateDetails function if needed for the button
    // Keeping it in case it's called from other parts of the application
    window.viewCertificateDetails = function(certificateId) {
        console.log('View certificate details for ID:', certificateId);
        // Implement logic to show certificate details or preview for a generated certificate
        // This could involve fetching the certificate data by ID and populating the preview.
         showNotification(`Viewing details for certificate ID: ${certificateId}`, 'info');
    };


    // Load certificates when the page loads (Removed)
    // loadCertificates();

    // Initial preview update
    updatePreview();
});

document.addEventListener('DOMContentLoaded', () => {
    const notification = document.getElementById('notification');
    const notificationMessage = document.getElementById('notificationMessage');
    const loginForm = document.getElementById('loginForm');
    const studentLoginForm = document.getElementById('studentLoginForm');
    const adminOption = document.getElementById('adminOption');
    const studentOption = document.getElementById('studentOption');
    const adminLoginBox = document.getElementById('adminLoginBox');
    const studentLoginBox = document.getElementById('studentLoginBox');
    const backBtn = document.getElementById('backBtn');
    const studentBackBtn = document.getElementById('studentBackBtn');

    // Show notification function
    function showNotification(message, isError = false) {
        notificationMessage.textContent = message;
        notification.className = 'notification' + (isError ? ' error' : '');
        notification.classList.add('show');
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }

    // Show login box and hide options
    function showLoginBox(box) {
        document.querySelector('.login-options').style.display = 'none';
        box.style.display = 'block';
    }

    // Show options and hide login box
    function showOptions() {
        document.querySelector('.login-options').style.display = 'flex';
        adminLoginBox.style.display = 'none';
        studentLoginBox.style.display = 'none';
    }

    // Event Listeners for login options
    if (adminOption) {
        adminOption.addEventListener('click', () => {
            showLoginBox(adminLoginBox);
        });
    }

    if (studentOption) {
        studentOption.addEventListener('click', () => {
            showLoginBox(studentLoginBox);
        });
    }

    // Back button handlers
    if (backBtn) {
        backBtn.addEventListener('click', showOptions);
    }

    if (studentBackBtn) {
        studentBackBtn.addEventListener('click', showOptions);
    }

    // Handle admin login form submission
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            // Check credentials
            if (username === 'aalekh' && password === '0001') {
                // Store login state
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('username', username);
                localStorage.setItem('userType', 'admin');
                
                // Redirect to index.html with add panel
                window.location.href = 'index.html?panel=add';
            } else {
                showNotification('Invalid username or password', true);
            }
        });
    }

    // Handle student login form submission
    if (studentLoginForm) {
        studentLoginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const studentId = document.getElementById('studentUsername').value;
            const password = document.getElementById('studentPassword').value;
            
            // For now, just show a message that student login is not implemented
            showNotification('Student login functionality coming soon!', true);
        });
    }
}); 
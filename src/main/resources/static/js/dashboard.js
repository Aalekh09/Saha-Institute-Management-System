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
if (header && !header.querySelector('.logout-btn')) { // Prevent adding multiple logout buttons
    header.appendChild(logoutBtn);
} 
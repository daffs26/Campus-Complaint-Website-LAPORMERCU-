/* ============================================================
   login-admin.js — JS khusus Login Admin
   ============================================================ */

const ADMINS = [
  { username: 'admin', password: 'admin123', name: 'Administrator' },
];

function handleLogin() {
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;

  if (!username || !password) {
    showError('errorMsg', 'Username dan password tidak boleh kosong.');
    return;
  }

  const admin = ADMINS.find(a => a.username === username && a.password === password);
  if (admin) {
    sessionStorage.setItem('loggedUser', JSON.stringify({ role: 'admin', ...admin }));
    window.location.href = 'dashboard-admin.html';
  } else {
    showError('errorMsg', 'Username atau password salah.');
  }
}

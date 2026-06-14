/* ============================================================
   main.js — JS Global #LAPORMERCU
   Fungsi yang dipakai bersama di semua halaman
   ============================================================ */

/**
 * Cek apakah user sudah login
 * @returns {object|null} data user atau null
 */
function getLoggedUser() {
  const data = sessionStorage.getItem('loggedUser');
  return data ? JSON.parse(data) : null;
}

/**
 * Logout dan redirect ke halaman utama
 */
function logout() {
  sessionStorage.removeItem('loggedUser');
  window.location.href = 'index.html';
}

/**
 * Toggle show/hide password input
 * @param {string} inputId - id dari input password
 */
function togglePassword(inputId = 'password') {
  const input = document.getElementById(inputId);
  if (input) {
    input.type = input.type === 'password' ? 'text' : 'password';
  }
}

/**
 * Format tanggal ke format lokal Indonesia
 * @param {string} dateStr - tanggal dalam format YYYY-MM-DD
 * @returns {string}
 */
function formatTanggal(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

/**
 * Dapatkan tanggal hari ini dalam format YYYY-MM-DD
 * @returns {string}
 */
function getTodayDate() {
  return new Date().toISOString().split('T')[0];
}

/**
 * Tampilkan pesan error pada elemen
 * @param {string} elId - id elemen error
 * @param {string} msg - pesan error
 */
function showError(elId, msg) {
  const el = document.getElementById(elId);
  if (el) {
    el.style.display = 'flex';
    const span = el.querySelector('span') || el.querySelector('#errorText');
    if (span) span.textContent = msg;
  }
}

/**
 * Sembunyikan pesan error
 * @param {string} elId - id elemen error
 */
function hideError(elId) {
  const el = document.getElementById(elId);
  if (el) el.style.display = 'none';
}

// Support Enter key untuk form login
document.addEventListener('keydown', function(e) {
  if (e.key === 'Enter') {
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) loginBtn.click();
  }
});

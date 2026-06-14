  //User login//

const USERS = [
  { nim: '2024001', password: 'mahasiswa123', name: 'Daffa', prodi: 'Sistem Informasi' },
];

function handleLogin() {
  const nim      = document.getElementById('nim').value.trim();
  const password = document.getElementById('password').value;

  if (!nim || !password) {
    showError('errorMsg', 'NIM dan password tidak boleh kosong.');
    return;
  }

  const user = USERS.find(u => u.nim === nim && u.password === password);
  if (user) {
    sessionStorage.setItem('loggedUser', JSON.stringify({ role: 'user', ...user }));
    window.location.href = 'dashboard-user.html';
  } else {
    showError('errorMsg', 'NIM atau password salah. Silakan coba lagi.');
  }
}

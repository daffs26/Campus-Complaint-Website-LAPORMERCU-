/* ============================================================
   dashboard-user.js — JS khusus Dashboard Mahasiswa
   ============================================================ */

let laporan = [
  { id: 1, nim: '2024001', judul: 'AC Rusak Tidak Berfungsi', kategori: 'Laboratorium', lokasi: 'Lab Komputer Lt.2', deskripsi: 'AC di lab komputer sudah 3 hari tidak berfungsi, ruangan sangat panas.', tanggal: '2025-01-15', status: 'Diproses' },
  { id: 2, nim: '2024001', judul: 'Proyektor Bermasalah', kategori: 'Gedung / Ruang Kelas', lokasi: 'Ruang 301 Gedung A', deskripsi: 'Proyektor tidak bisa menampilkan gambar dengan jelas.', tanggal: '2025-01-10', status: 'Selesai' },
];

let currentUser = null;

window.onload = function () {
  currentUser = getLoggedUser();
  if (!currentUser) { window.location.href = 'login-user.html'; return; }
  if (currentUser.role !== 'user') { window.location.href = 'login-user.html'; return; }

  // Isi info user di navbar & form
  document.getElementById('navName').textContent  = currentUser.name;
  document.getElementById('navNIM').textContent   = currentUser.nim;
  document.getElementById('userName').textContent = currentUser.name.split(' ')[0];
  document.getElementById('formName').textContent  = currentUser.name;
  document.getElementById('formNIM').textContent   = currentUser.nim;
  document.getElementById('formProdi').textContent = currentUser.prodi;

  renderLaporan();
};

function showTab(tab) {
  document.getElementById('panel-laporan').classList.toggle('hidden', tab !== 'laporan');
  document.getElementById('panel-buat').classList.toggle('hidden', tab !== 'buat');
  document.getElementById('tab-laporan').className = tab === 'laporan'
    ? 'tab-active px-5 py-2 rounded-lg text-sm font-semibold transition-all'
    : 'px-5 py-2 rounded-lg text-sm font-semibold text-gray-500 transition-all';
  document.getElementById('tab-buat').className = tab === 'buat'
    ? 'tab-active px-5 py-2 rounded-lg text-sm font-semibold transition-all'
    : 'px-5 py-2 rounded-lg text-sm font-semibold text-gray-500 transition-all';
}

function renderLaporan() {
  const myLaporan = laporan.filter(l => l.nim === currentUser.nim);
  const list    = document.getElementById('laporanList');
  const empty   = document.getElementById('emptyState');
  const count   = document.getElementById('laporanCount');

  document.getElementById('statTotal').textContent   = myLaporan.length;
  document.getElementById('statProses').textContent  = myLaporan.filter(l => l.status === 'Diproses').length;
  document.getElementById('statSelesai').textContent = myLaporan.filter(l => l.status === 'Selesai').length;
  count.textContent = `${myLaporan.length} laporan`;

  if (myLaporan.length === 0) {
    list.innerHTML = '';
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';

  list.innerHTML = myLaporan.map(l => {
    const statusClass = l.status === 'Baru' ? 'status-baru' : l.status === 'Diproses' ? 'status-diproses' : 'status-selesai';
    return `
      <div class="px-6 py-4 hover:bg-gray-50 transition-colors">
        <div class="flex items-start justify-between gap-4">
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-1">
              <h3 class="font-semibold text-gray-800 text-sm">${l.judul}</h3>
              <span class="text-xs px-2 py-0.5 rounded-full font-medium ${statusClass}">${l.status}</span>
            </div>
            <div class="flex items-center gap-3 text-xs text-gray-400">
              <span>📌 ${l.kategori}</span>
              <span>📍 ${l.lokasi}</span>
              <span>${l.tanggal}</span>
            </div>
            <p class="text-xs text-gray-500 mt-1">${l.deskripsi}</p>
          </div>
        </div>
      </div>`;
  }).join('');
}

function handleFoto(input) {
  const file = input.files[0];
  if (file) {
    document.getElementById('fotoLabel').textContent = `✅ ${file.name}`;
    document.getElementById('dropzone').classList.add('border-blue-300', 'bg-blue-50');
  }
}

function submitLaporan() {
  const kategori  = document.getElementById('kategori').value;
  const lokasi    = document.getElementById('lokasi').value.trim();
  const judul     = document.getElementById('judul').value.trim();
  const deskripsi = document.getElementById('deskripsi').value.trim();
  const errorEl   = document.getElementById('formError');

  if (!kategori || !lokasi || !judul || !deskripsi) {
    errorEl.textContent = '⚠️ Semua field bertanda * wajib diisi.';
    errorEl.classList.remove('hidden');
    return;
  }
  errorEl.classList.add('hidden');

  laporan.push({
    id: laporan.length + 1,
    nim: currentUser.nim,
    judul, kategori, lokasi, deskripsi,
    tanggal: getTodayDate(),
    status: 'Baru'
  });

  // Reset form
  ['kategori', 'lokasi', 'judul', 'deskripsi'].forEach(id => {
    document.getElementById(id).value = '';
  });
  document.getElementById('fotoLabel').textContent = 'Klik untuk upload foto';
  document.getElementById('fotoInput').value = '';
  document.getElementById('dropzone').classList.remove('border-blue-300', 'bg-blue-50');

  document.getElementById('modalSukses').classList.add('active');
  renderLaporan();
}

function tutupModal() {
  document.getElementById('modalSukses').classList.remove('active');
  showTab('laporan');
}

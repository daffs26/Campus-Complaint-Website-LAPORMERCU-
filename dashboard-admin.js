/* ============================================================
   dashboard-admin.js — JS khusus Dashboard Admin
   ============================================================ */

let allLaporan = [
  { id: 1, nim: '2024001', nama: 'Muhammad Daffa Aulia Syahrul', prodi: 'Teknik Informatika', judul: 'AC Rusak Tidak Berfungsi', kategori: 'Laboratorium', lokasi: 'Lab Komputer Lt.2', deskripsi: 'AC di lab komputer sudah 3 hari tidak berfungsi, ruangan sangat panas saat siang hari.', tanggal: '2025-01-15', status: 'Diproses' },
  { id: 2, nim: '2024001', nama: 'Muhammad Daffa Aulia Syahrul', prodi: 'Teknik Informatika', judul: 'Proyektor Bermasalah', kategori: 'Gedung / Ruang Kelas', lokasi: 'Ruang 301 Gedung A', deskripsi: 'Proyektor tidak bisa menampilkan gambar dengan jelas, layar tampak buram dan redup.', tanggal: '2025-01-10', status: 'Selesai' },
  { id: 3, nim: '2024002', nama: 'Daffa Aulia', prodi: 'Sistem Informasi', judul: 'Toilet Mampet Lantai 2', kategori: 'Toilet', lokasi: 'Toilet Gedung B Lt.2', deskripsi: 'Toilet mampet dan mengeluarkan bau tidak sedap sudah 2 hari.', tanggal: '2025-01-16', status: 'Baru' },
  { id: 4, nim: '2024002', nama: 'Daffa Aulia', prodi: 'Sistem Informasi', judul: 'Lampu Parkir Mati', kategori: 'Parkiran', lokasi: 'Parkiran Belakang Kampus', deskripsi: 'Lampu penerangan di parkiran belakang mati sejak seminggu lalu.', tanggal: '2025-01-12', status: 'Selesai' },
  { id: 5, nim: '2024001', nama: 'Muhammad Daffa Aulia Syahrul', prodi: 'Teknik Informatika', judul: 'Wifi Perpustakaan Lambat', kategori: 'Perpustakaan', lokasi: 'Perpustakaan Pusat', deskripsi: 'Koneksi wifi di perpustakaan sangat lambat.', tanggal: '2025-01-17', status: 'Baru' },
  { id: 6, nim: '2024002', nama: 'Daffa Aulia', prodi: 'Sistem Informasi', judul: 'Meja Kantin Rusak', kategori: 'Kantin', lokasi: 'Kantin Utama', deskripsi: 'Banyak meja dan kursi di kantin yang rusak dan kotor.', tanggal: '2025-01-14', status: 'Diproses' },
];

let selectedId = null;

window.onload = function () {
  const user = getLoggedUser();
  if (!user) { window.location.href = 'login-admin.html'; return; }
  if (user.role !== 'admin') { window.location.href = 'login-user.html'; return; }
  document.getElementById('navAdminName').textContent = user.name || 'Administrator';
  updateStats();
  renderTable(allLaporan);
};

function updateStats() {
  document.getElementById('statTotal').textContent   = allLaporan.length;
  document.getElementById('statBaru').textContent    = allLaporan.filter(l => l.status === 'Baru').length;
  document.getElementById('statProses').textContent  = allLaporan.filter(l => l.status === 'Diproses').length;
  document.getElementById('statSelesai').textContent = allLaporan.filter(l => l.status === 'Selesai').length;
}

function statusBadge(status) {
  const map = {
    'Baru':     'background:#fee2e2;color:#dc2626;',
    'Diproses': 'background:#fef3c7;color:#d97706;',
    'Selesai':  'background:#dcfce7;color:#16a34a;'
  };
  return `<span style="${map[status] || ''}font-size:11px;font-weight:700;padding:3px 10px;border-radius:999px;white-space:nowrap;">${status}</span>`;
}

function renderTable(data) {
  const tbody = document.getElementById('laporanTable');
  const cards = document.getElementById('laporanCards');
  const empty = document.getElementById('emptyTable');

  if (data.length === 0) {
    tbody.innerHTML = '';
    cards.innerHTML = '';
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';

  // Desktop table
  tbody.innerHTML = data.map(l => `
    <tr onclick="bukaDetail(${l.id})" class="cursor-pointer">
      <td class="px-4 sm:px-6 py-3" style="color:#9ca3af;font-family:monospace;font-size:12px;">#${String(l.id).padStart(3,'0')}</td>
      <td class="px-4 sm:px-6 py-3">
        <div style="font-weight:600;color:#111827;font-size:13px;">${l.nama}</div>
        <div style="font-size:11px;color:#9ca3af;">${l.nim} · ${l.prodi}</div>
      </td>
      <td class="px-4 sm:px-6 py-3">
        <div style="font-weight:600;color:#111827;font-size:13px;">${l.judul}</div>
        <div style="font-size:11px;color:#9ca3af;">📍 ${l.lokasi}</div>
      </td>
      <td class="px-4 sm:px-6 py-3 hidden md:table-cell" style="color:#4b5563;font-size:13px;">${l.kategori}</td>
      <td class="px-4 sm:px-6 py-3 hidden lg:table-cell" style="color:#9ca3af;font-size:12px;">${l.tanggal}</td>
      <td class="px-4 sm:px-6 py-3">${statusBadge(l.status)}</td>
      <td class="px-4 sm:px-6 py-3"><span style="color:#2563eb;font-size:12px;font-weight:600;">Detail →</span></td>
    </tr>`).join('');

  // Mobile cards
  cards.innerHTML = data.map(l => `
    <div class="laporan-card" onclick="bukaDetail(${l.id})">
      <div class="laporan-card-header">
        <div>
          <div class="laporan-card-title">${l.judul}</div>
          <div style="font-size:12px;color:#6b7280;margin-top:2px;">${l.nama}</div>
        </div>
        ${statusBadge(l.status)}
      </div>
      <div class="laporan-card-meta">
        <span>📍 ${l.lokasi}</span>
        <span>📌 ${l.kategori}</span>
        <span>${l.tanggal}</span>
      </div>
    </div>`).join('');
}

function filterLaporan() {
  const search   = document.getElementById('searchInput').value.toLowerCase();
  const status   = document.getElementById('filterStatus').value;
  const kategori = document.getElementById('filterKategori').value;

  const filtered = allLaporan.filter(l =>
    (!search   || l.judul.toLowerCase().includes(search) || l.nama.toLowerCase().includes(search) || l.nim.includes(search) || l.lokasi.toLowerCase().includes(search)) &&
    (!status   || l.status === status) &&
    (!kategori || l.kategori === kategori)
  );
  renderTable(filtered);
}

function bukaDetail(id) {
  const l = allLaporan.find(x => x.id === id);
  if (!l) return;
  selectedId = id;

  document.getElementById('modalContent').innerHTML = `
    <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px;flex-wrap:wrap;">
      <h4 style="font-family:'Plus Jakarta Sans',sans-serif;font-size:15px;font-weight:700;color:#111827;margin:0;">${l.judul}</h4>
      ${statusBadge(l.status)}
    </div>
    <div class="detail-grid">
      <div class="detail-item"><div class="detail-label">Pelapor</div><div class="detail-value">${l.nama}</div></div>
      <div class="detail-item"><div class="detail-label">NIM</div><div class="detail-value">${l.nim}</div></div>
      <div class="detail-item"><div class="detail-label">Prodi</div><div class="detail-value">${l.prodi}</div></div>
      <div class="detail-item"><div class="detail-label">Tanggal</div><div class="detail-value">${l.tanggal}</div></div>
      <div class="detail-item"><div class="detail-label">Kategori</div><div class="detail-value">${l.kategori}</div></div>
      <div class="detail-item"><div class="detail-label">Lokasi</div><div class="detail-value">${l.lokasi}</div></div>
    </div>
    <div class="detail-item">
      <div class="detail-label">Deskripsi</div>
      <div style="font-size:13px;color:#374151;line-height:1.6;margin-top:4px;">${l.deskripsi}</div>
    </div>`;

  const colors = {
    'Baru':     { active: 'background:#ef4444;color:white;', idle: 'background:#fef2f2;color:#ef4444;' },
    'Diproses': { active: 'background:#f59e0b;color:white;', idle: 'background:#fffbeb;color:#d97706;' },
    'Selesai':  { active: 'background:#22c55e;color:white;', idle: 'background:#f0fdf4;color:#16a34a;' },
  };

  document.getElementById('statusBtns').innerHTML = ['Baru', 'Diproses', 'Selesai'].map(s => {
    const isActive = l.status === s;
    return `<button class="status-btn" onclick="ubahStatus('${s}')" style="${isActive ? colors[s].active : colors[s].idle}">${isActive ? '✓ ' : ''}${s}</button>`;
  }).join('');

  document.getElementById('modalDetail').classList.add('active');
}

function ubahStatus(newStatus) {
  const l = allLaporan.find(x => x.id === selectedId);
  if (l) {
    l.status = newStatus;
    updateStats();
    filterLaporan();
    bukaDetail(selectedId);
  }
}

function tutupModal() {
  document.getElementById('modalDetail').classList.remove('active');
}

// Tutup modal kalau klik overlay
document.addEventListener('click', function(e) {
  const overlay = document.getElementById('modalDetail');
  if (e.target === overlay) tutupModal();
});

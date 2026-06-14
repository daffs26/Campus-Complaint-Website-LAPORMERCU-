import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLaporan, saveLaporan } from '../utils';
import type { Laporan, User } from '../types';
import { useToast } from '../components/Toast';
import Modal from '../components/Modal';
import { TableRowSkeleton, CardSkeleton } from '../components/Skeleton';
import { PieChart, LineChart } from '../components/Charts';

export default function DashboardAdmin() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [laporanList, setLaporanList] = useState<Laporan[]>([]);
  
  // Filters
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterKategori, setFilterKategori] = useState('');
  const [filterProdi, setFilterProdi] = useState('');

  // Selected Detail & Modals
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const sessionUser = sessionStorage.getItem('loggedUser');
    if (!sessionUser) {
      navigate('/login-admin');
      return;
    }
    const userObj = JSON.parse(sessionUser) as User;
    if (userObj.role !== 'admin') {
      navigate('/login');
      return;
    }
    setCurrentUser(userObj);
    setLaporanList(getLaporan());
  }, [navigate]);

  // Jeda loading buatan untuk saringan filter admin
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 700);
    return () => clearTimeout(timer);
  }, [filterStatus, filterKategori, filterProdi, search]);

  const handleLogout = () => {
    sessionStorage.removeItem('loggedUser');
    navigate('/');
  };

  const countTotal = laporanList.length;
  const countBaru = laporanList.filter(l => l.status === 'Baru').length;
  const countProses = laporanList.filter(l => l.status === 'Diproses').length;
  const countSelesai = laporanList.filter(l => l.status === 'Selesai').length;

  // Distribusi kategori untuk Pie Chart
  const kategoriCounts: { [key: string]: number } = {};
  laporanList.forEach(l => {
    const cats = l.kategori ? l.kategori.split(', ') : [];
    cats.forEach(c => {
      kategoriCounts[c] = (kategoriCounts[c] || 0) + 1;
    });
  });
  const availableKategori = [
    { name: 'Gedung / Ruang Kelas', color: '#3b82f6' },
    { name: 'Toilet', color: '#f43f5e' },
    { name: 'Parkiran', color: '#eab308' },
    { name: 'Kantin', color: '#10b981' },
    { name: 'Laboratorium', color: '#8b5cf6' },
    { name: 'Perpustakaan', color: '#ec4899' },
    { name: 'Wifi', color: '#06b6d4' }
  ];
  const pieChartData = availableKategori.map(cat => ({
    name: cat.name,
    value: kategoriCounts[cat.name] || 0,
    color: cat.color
  })).filter(item => item.value > 0);

  // Tren harian untuk Line Chart
  const dailyCounts: { [key: string]: number } = {};
  laporanList.forEach(l => {
    dailyCounts[l.tanggal] = (dailyCounts[l.tanggal] || 0) + 1;
  });
  const sortedDates = Object.keys(dailyCounts).sort().slice(-7);
  const lineChartData = sortedDates.length > 0 
    ? sortedDates.map(date => ({
        date: date.substring(5), // MM-DD
        value: dailyCounts[date]
      }))
    : [
        { date: '06-10', value: 2 },
        { date: '06-11', value: 4 },
        { date: '06-12', value: 3 },
        { date: '06-13', value: 5 },
        { date: '06-14', value: 2 }
      ];

  const ALL_PRODI = [
    'Sistem Informasi',
    'Teknik Informatika',
    'Teknik Mesin',
    'Teknik Industri',
    'Teknik Elektro',
    'Manajemen',
    'Akuntansi',
    'Marcom',
    'Psikologi',
    'Desain Produk',
    'Desain Interior',
    'Desain Komunikasi Visual'
  ];

  const filteredLaporan = laporanList.filter(l => {
    const matchSearch =
      !search ||
      l.judul.toLowerCase().includes(search.toLowerCase()) ||
      l.nama.toLowerCase().includes(search.toLowerCase()) ||
      l.nim.includes(search) ||
      l.lokasi.toLowerCase().includes(search.toLowerCase());
    
    const matchStatus = !filterStatus || l.status === filterStatus;
    const matchKategori = !filterKategori || (l.kategori && l.kategori.split(', ').includes(filterKategori));
    const matchProdi = !filterProdi || l.prodi === filterProdi;

    return matchSearch && matchStatus && matchKategori && matchProdi;
  });

  const selectedReport = laporanList.find(x => x.id === selectedId);

  const ubahStatus = (newStatus: 'Baru' | 'Diproses' | 'Selesai') => {
    if (!selectedId) return;
    const updatedList = laporanList.map(l => {
      if (l.id === selectedId) {
        return { ...l, status: newStatus };
      }
      return l;
    });
    saveLaporan(updatedList);
    setLaporanList(updatedList);
    showToast(`Status laporan berhasil diubah ke: ${newStatus}`, 'success');
  };

  const handleDeleteLaporan = () => {
    if (!deleteTargetId) return;
    const updatedList = laporanList.filter(l => l.id !== deleteTargetId);
    saveLaporan(updatedList);
    setLaporanList(updatedList);
    showToast('Laporan berhasil dihapus!', 'success');
    setIsDeleteModalOpen(false);
    setShowDetailModal(false);
    setSelectedId(null);
  };

  const renderStatusBadge = (status: 'Baru' | 'Diproses' | 'Selesai') => {
    const map = {
      'Baru': 'bg-red-100 text-red-700',
      'Diproses': 'bg-yellow-100 text-yellow-700',
      'Selesai': 'bg-green-100 text-green-700'
    };
    return (
      <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap ${map[status] || ''}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* NAVBAR */}
      <nav className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
              </svg>
            </div>
            <span className="font-bold text-base sm:text-lg text-blue-700 font-jakarta">#LAPORMERCU</span>
            <span className="hidden sm:inline text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold">Admin Panel</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden md:flex items-center gap-2 text-sm text-gray-600">
              <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                </svg>
              </div>
              <span className="font-medium">{currentUser?.name || 'Administrator'}</span>
            </div>
            <button onClick={() => setIsLogoutModalOpen(true)} className="text-xs sm:text-sm font-medium text-red-500 hover:text-red-700 border border-red-200 px-2.5 sm:px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-1.5 cursor-pointer">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
              </svg>
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8 fade-up">
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 font-jakarta">Dashboard Admin</h1>
          <p className="text-gray-500 mt-1 text-sm sm:text-base">Kelola dan tindaklanjuti semua laporan pengaduan mahasiswa</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8 fade-up">
          <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Total</span>
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                </svg>
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-gray-900">{countTotal}</div>
            <div className="text-xs text-gray-400 mt-0.5">Total Laporan</div>
          </div>
          <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Baru</span>
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-red-50 rounded-lg flex items-center justify-center">
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                </svg>
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-red-500">{countBaru}</div>
            <div className="text-xs text-gray-400 mt-0.5">Menunggu Tindakan</div>
          </div>
          <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Proses</span>
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-yellow-50 rounded-lg flex items-center justify-center">
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-yellow-500">{countProses}</div>
            <div className="text-xs text-gray-400 mt-0.5">Sedang Diproses</div>
          </div>
          <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Selesai</span>
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-green-50 rounded-lg flex items-center justify-center">
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-green-500">{countSelesai}</div>
            <div className="text-xs text-gray-400 mt-0.5">Terselesaikan</div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 sm:mb-8 fade-up">
          <div>
            <h3 className="text-xs font-extrabold text-gray-400 uppercase tracking-wider mb-2.5">Distribusi Laporan per Kategori</h3>
            <PieChart data={pieChartData} />
          </div>
          <div>
            <LineChart data={lineChartData} />
          </div>
        </div>

        {/* Filter & Search */}
        <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 shadow-sm mb-4 fade-up">
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <h2 className="font-bold text-gray-800 text-sm sm:text-base">Semua Laporan Masuk</h2>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                {/* Search */}
                <div className="relative">
                  <svg className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                  </svg>
                  <input
                    type="text"
                    placeholder="Cari laporan..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 w-full sm:w-52"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {/* Filter status */}
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="flex-1 sm:flex-none px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 bg-white"
                  >
                    <option value="">Semua Status</option>
                    <option value="Baru">Baru</option>
                    <option value="Diproses">Diproses</option>
                    <option value="Selesai">Selesai</option>
                  </select>
                  {/* Filter kategori */}
                  <select
                    value={filterKategori}
                    onChange={(e) => setFilterKategori(e.target.value)}
                    className="flex-1 sm:flex-none px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 bg-white"
                  >
                    <option value="">Semua Kategori</option>
                    <option value="Gedung / Ruang Kelas">Gedung / Ruang Kelas</option>
                    <option value="Toilet">Toilet</option>
                    <option value="Parkiran">Parkiran</option>
                    <option value="Kantin">Kantin</option>
                    <option value="Laboratorium">Laboratorium</option>
                    <option value="Perpustakaan">Perpustakaan</option>
                    <option value="Wifi">Wifi</option>
                  </select>
                  {/* Filter prodi */}
                  <select
                    value={filterProdi}
                    onChange={(e) => setFilterProdi(e.target.value)}
                    className="flex-1 sm:flex-none px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 bg-white"
                  >
                    <option value="">Semua Prodi</option>
                    {ALL_PRODI.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Table (Desktop) */}
          {isLoading ? (
            <div>
              {/* Desktop skeleton */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">ID</th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Pelapor</th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Judul & Lokasi</th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Kategori</th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Tanggal</th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    <TableRowSkeleton />
                    <TableRowSkeleton />
                    <TableRowSkeleton />
                    <TableRowSkeleton />
                  </tbody>
                </table>
              </div>
              {/* Mobile skeleton */}
              <div className="sm:hidden p-4 space-y-4">
                <CardSkeleton />
                <CardSkeleton />
                <CardSkeleton />
              </div>
            </div>
          ) : filteredLaporan.length === 0 ? (
            <div className="py-12 sm:py-16 text-center">
              <div className="text-4xl mb-3">🔍</div>
              <p className="font-semibold text-gray-700">Tidak ada laporan ditemukan</p>
              <p className="text-sm text-gray-400 mt-1">Coba ubah filter atau kata kunci pencarian</p>
            </div>
          ) : (
            <>
              {/* Table (Desktop) */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">ID</th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Pelapor</th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Judul & Lokasi</th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Kategori</th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Tanggal</th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredLaporan.map(l => (
                      <tr key={l.id} onClick={() => { setSelectedId(l.id); setShowDetailModal(true); }} className="cursor-pointer hover:bg-gray-50 transition-colors">
                        <td className="px-4 sm:px-6 py-3 font-mono text-xs text-gray-400">#{String(l.id).padStart(3, '0')}</td>
                        <td className="px-4 sm:px-6 py-3">
                          <div className="font-semibold text-gray-900 text-[13px]">{l.nama}</div>
                          <div className="text-[11px] text-gray-400">{l.nim} · {l.prodi}</div>
                        </td>
                        <td className="px-4 sm:px-6 py-3">
                          <div className="font-semibold text-gray-900 text-[13px]">{l.judul}</div>
                          <div className="text-[11px] text-gray-400">📍 {l.lokasi}</div>
                        </td>
                        <td className="px-4 sm:px-6 py-3 hidden md:table-cell text-gray-600 text-[13px]">{l.kategori}</td>
                        <td className="px-4 sm:px-6 py-3 hidden lg:table-cell text-gray-400 text-xs">{l.tanggal}</td>
                        <td className="px-4 sm:px-6 py-3">{renderStatusBadge(l.status)}</td>
                        <td className="px-4 sm:px-6 py-3">
                          <span className="text-blue-600 text-xs font-semibold hover:underline">Detail →</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Card list (Mobile) */}
              <div className="sm:hidden divide-y divide-gray-100">
                {filteredLaporan.map(l => (
                  <div key={l.id} onClick={() => { setSelectedId(l.id); setShowDetailModal(true); }} className="p-4 active:bg-gray-50 cursor-pointer hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <div className="font-semibold text-gray-900 text-sm leading-snug">{l.judul}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{l.nama} · {l.nim}</div>
                      </div>
                      {renderStatusBadge(l.status)}
                    </div>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-400 mt-2">
                      <span>📍 {l.lokasi}</span>
                      <span>📌 {l.kategori}</span>
                      <span>📅 {l.tanggal}</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modal Detail */}
      <div className={`modal-overlay ${showDetailModal ? 'active' : ''}`}>
        <div className="bg-white rounded-2xl shadow-2xl p-5 sm:p-6 max-w-lg w-full mx-4 max-h-[85vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
            <h3 className="text-base sm:text-lg font-extrabold text-gray-900 font-jakarta">Detail Laporan</h3>
            <button onClick={() => setShowDetailModal(false)} className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          {selectedReport && (
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <h4 className="font-extrabold text-gray-900 text-base font-jakarta">{selectedReport.judul}</h4>
                {renderStatusBadge(selectedReport.status)}
              </div>

              <div className="grid grid-cols-2 gap-3 bg-gray-50 p-4 rounded-xl text-xs">
                <div>
                  <span className="text-gray-400 font-medium">Pelapor</span>
                  <p className="font-semibold text-gray-700 mt-0.5">{selectedReport.nama}</p>
                </div>
                <div>
                  <span className="text-gray-400 font-medium">NIM / Prodi</span>
                  <p className="font-semibold text-gray-700 mt-0.5">{selectedReport.nim} / {selectedReport.prodi}</p>
                </div>
                <div>
                  <span className="text-gray-400 font-medium">Kategori / Lokasi</span>
                  <p className="font-semibold text-gray-700 mt-0.5">{selectedReport.kategori} / {selectedReport.lokasi}</p>
                </div>
                <div>
                  <span className="text-gray-400 font-medium">Tanggal</span>
                  <p className="font-semibold text-gray-700 mt-0.5">{selectedReport.tanggal}</p>
                </div>
              </div>

              <div>
                <span className="text-xs text-gray-400 font-medium block">Deskripsi Masalah</span>
                <p className="text-sm text-gray-700 leading-relaxed bg-gray-50/50 p-3 rounded-xl border border-gray-100 mt-1">
                  {selectedReport.deskripsi}
                </p>
              </div>

              {/* Umpan balik rating dari mahasiswa (jika ada) */}
              {selectedReport.status === 'Selesai' && selectedReport.rating && (
                <div className="bg-green-50 border border-green-100 rounded-xl p-4 mt-3">
                  <span className="text-xs text-green-700 font-bold block mb-1">⭐ Umpan Balik Kepuasan Mahasiswa</span>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span className="text-yellow-500 font-bold text-sm">
                      {'★'.repeat(selectedReport.rating) + '☆'.repeat(5 - selectedReport.rating)}
                    </span>
                    <span className="text-xs font-semibold text-green-700">({selectedReport.rating}/5)</span>
                  </div>
                  <p className="text-xs text-gray-600 italic leading-relaxed">
                    "{selectedReport.feedback || 'Tidak ada ulasan tertulis.'}"
                  </p>
                </div>
              )}

              {/* Bukti Foto Laporan */}
              {selectedReport.foto && (
                <div>
                  <span className="text-xs text-gray-400 font-medium block mb-1">Bukti Foto</span>
                  <img
                    src={selectedReport.foto}
                    alt="Bukti Foto"
                    className="w-full max-h-60 rounded-xl border border-gray-100 object-cover cursor-zoom-in hover:opacity-95 transition-opacity"
                    onClick={() => {
                      const w = window.open();
                      if (w) {
                        w.document.write(`<title>Bukti Foto LaporMercu</title><body style="margin:0;background:#000;display:flex;align-items:center;justify-content:center;min-height:100vh;"><img src="${selectedReport.foto}" style="max-width:100%;max-height:100vh;object-fit:contain;"/></body>`);
                      }
                    }}
                  />
                </div>
              )}

              {/* Status controller */}
              <div className="pt-4 border-t border-gray-100">
                <p className="text-sm font-semibold text-gray-700 mb-2 font-jakarta">Ubah Status Laporan:</p>
                <div className="flex flex-wrap gap-2">
                  {(['Baru', 'Diproses', 'Selesai'] as const).map(s => {
                    const isActive = selectedReport.status === s;
                    const stylesMap = {
                      'Baru': isActive ? 'bg-red-500 text-white border-red-500' : 'bg-red-50 text-red-500 border-red-100 hover:bg-red-100',
                      'Diproses': isActive ? 'bg-yellow-500 text-white border-yellow-500' : 'bg-yellow-50 text-yellow-600 border-yellow-100 hover:bg-yellow-100',
                      'Selesai': isActive ? 'bg-green-500 text-white border-green-500' : 'bg-green-50 text-green-600 border-green-100 hover:bg-green-100',
                    };
                    return (
                      <button
                        key={s}
                        onClick={() => ubahStatus(s)}
                        className={`px-4 py-2 border rounded-xl text-xs font-semibold transition-all cursor-pointer ${stylesMap[s]}`}
                      >
                        {isActive ? '✓ ' : ''}{s}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tombol Hapus */}
              <div className="pt-3 border-t border-gray-100 flex justify-end">
                <button
                  onClick={() => {
                    setDeleteTargetId(selectedReport.id);
                    setIsDeleteModalOpen(true);
                  }}
                  className="px-4 py-2 border border-red-200 text-red-500 rounded-xl text-xs font-semibold hover:bg-red-50 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Hapus Laporan
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal Konfirmasi Logout */}
      <Modal
        isOpen={isLogoutModalOpen}
        title="Konfirmasi Keluar"
        message="Apakah Anda yakin ingin keluar dari sesi Administrator?"
        confirmLabel="Keluar"
        cancelLabel="Batal"
        onConfirm={handleLogout}
        onCancel={() => setIsLogoutModalOpen(false)}
        type="warning"
      />

      {/* Modal Konfirmasi Hapus Laporan */}
      <Modal
        isOpen={isDeleteModalOpen}
        title="Hapus Laporan"
        message={`Apakah Anda yakin ingin menghapus laporan #${String(deleteTargetId).padStart(3, '0')} secara permanen? Aksi ini tidak dapat dibatalkan.`}
        confirmLabel="Hapus"
        cancelLabel="Batal"
        onConfirm={handleDeleteLaporan}
        onCancel={() => {
          setIsDeleteModalOpen(false);
          setDeleteTargetId(null);
        }}
        type="danger"
      />
    </div>
  );
}

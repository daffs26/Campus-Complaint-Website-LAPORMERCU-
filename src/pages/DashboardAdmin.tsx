import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLaporan, saveLaporan, getDeletedLaporan, saveDeletedLaporan } from '../utils';
import type { Laporan, User, DeletedLaporan } from '../types';
import { useToast } from '../components/Toast';
import Modal from '../components/Modal';
import { TableRowSkeleton, CardSkeleton } from '../components/Skeleton';
import { PieChart, LineChart } from '../components/Charts';
import { ChevronDown, Search, Check, RotateCcw, Download, Trash2, History } from 'lucide-react';

export default function DashboardAdmin() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [laporanList, setLaporanList] = useState<Laporan[]>([]);
  const [deletedList, setDeletedList] = useState<DeletedLaporan[]>([]);
  const [showDeletedModal, setShowDeletedModal] = useState(false);
  
  // Filters
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterKategori, setFilterKategori] = useState('');
  const [filterProdi, setFilterProdi] = useState('');
  const [activeDropdown, setActiveDropdown] = useState<'status' | 'kategori' | 'prodi' | null>(null);

  // Selected Detail & Modals
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();

  const [tanggapanInput, setTanggapanInput] = useState('');

  useEffect(() => {
    if (selectedId) {
      const r = laporanList.find(x => x.id === selectedId);
      setTanggapanInput(r?.tanggapan || '');
    } else {
      setTanggapanInput('');
    }
  }, [selectedId, laporanList]);

  const isReportUrgent = (tanggal: string, status: string) => {
    if (status !== 'Belum Diproses') return false;
    try {
      const today = new Date();
      const reportDate = new Date(tanggal);
      const diffTime = today.getTime() - reportDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 2;
    } catch (e) {
      return false;
    }
  };

  const handleExportCSV = () => {
    if (filteredLaporan.length === 0) {
      showToast('Tidak ada data untuk diekspor', 'error');
      return;
    }
    const headers = ['ID', 'NIM', 'Nama', 'Prodi', 'Judul', 'Kategori', 'Lokasi', 'Tanggal', 'Status', 'Tanggapan'];
    const rows = filteredLaporan.map(l => [
      `#${String(l.id).padStart(3, '0')}`,
      l.nim,
      `"${l.nama.replace(/"/g, '""')}"`,
      l.prodi,
      `"${l.judul.replace(/"/g, '""')}"`,
      l.kategori,
      `"${l.lokasi.replace(/"/g, '""')}"`,
      l.tanggal,
      l.status,
      `"${(l.tanggapan || '').replace(/"/g, '""')}"`
    ]);
    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `LaporMercu_Ekspor_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Data berhasil diekspor ke CSV!', 'success');
  };

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
    setDeletedList(getDeletedLaporan());
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
  const countBaru = laporanList.filter(l => l.status === 'Belum Diproses').length;
  const countProses = laporanList.filter(l => l.status === 'Sedang Diproses').length;
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

  const ubahStatus = (newStatus: 'Belum Diproses' | 'Sedang Diproses' | 'Selesai') => {
    if (!selectedId) return;
    const updatedList = laporanList.map(l => {
      if (l.id === selectedId) {
        const historyEntry = {
          status: newStatus,
          tanggal: new Date().toISOString().split('T')[0],
          catatan: tanggapanInput.trim() || undefined
        };
        const currentHistory = l.history || [
          { status: 'Belum Diproses', tanggal: l.tanggal }
        ];
        return { 
          ...l, 
          status: newStatus,
          tanggapan: tanggapanInput.trim() || undefined,
          history: [...currentHistory, historyEntry]
        };
      }
      return l;
    });
    saveLaporan(updatedList);
    setLaporanList(updatedList);
    showToast(`Status laporan berhasil diubah ke: ${newStatus === 'Belum Diproses' ? 'Baru' : newStatus === 'Sedang Diproses' ? 'Diproses' : 'Selesai'}`, 'success');
  };

  const simpanTanggapan = () => {
    if (!selectedId) return;
    const updatedList = laporanList.map(l => {
      if (l.id === selectedId) {
        return {
          ...l,
          tanggapan: tanggapanInput.trim() || undefined
        };
      }
      return l;
    });
    saveLaporan(updatedList);
    setLaporanList(updatedList);
    showToast('Tanggapan berhasil disimpan!', 'success');
  };

  const handleDeleteLaporan = () => {
    if (!deleteTargetId) return;
    const target = laporanList.find(l => l.id === deleteTargetId);
    if (target && currentUser) {
      const newDeleted: DeletedLaporan = {
        ...target,
        deletedAt: new Date().toISOString(),
        deletedBy: currentUser.name
      };
      const updatedDeleted = [...deletedList, newDeleted];
      saveDeletedLaporan(updatedDeleted);
      setDeletedList(updatedDeleted);
    }
    const updatedList = laporanList.filter(l => l.id !== deleteTargetId);
    saveLaporan(updatedList);
    setLaporanList(updatedList);
    showToast('Laporan berhasil dihapus!', 'success');
    setIsDeleteModalOpen(false);
    setShowDetailModal(false);
    setSelectedId(null);
  };

  const renderStatusBadge = (status: 'Belum Diproses' | 'Sedang Diproses' | 'Selesai') => {
    const map = {
      'Belum Diproses': {
        bg: 'bg-red-50/70 text-red-700 border-red-100/80',
        dot: 'bg-red-500',
        label: 'Baru'
      },
      'Sedang Diproses': {
        bg: 'bg-yellow-50/70 text-yellow-700 border-yellow-100/80',
        dot: 'bg-yellow-500',
        label: 'Diproses'
      },
      'Selesai': {
        bg: 'bg-green-50/70 text-green-700 border-green-100/80',
        dot: 'bg-green-500',
        label: 'Selesai'
      }
    };
    const style = map[status] || { bg: 'bg-gray-50 text-gray-700 border-gray-100', dot: 'bg-gray-500', label: status };
    return (
      <span className={`inline-flex items-center gap-1.5 text-[10px] font-extrabold px-2.5 py-1 rounded-full border whitespace-nowrap ${style.bg}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
        {style.label}
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
          <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100/80 shadow-sm p-4 sm:p-5 hover:shadow-md transition-all duration-300 relative overflow-hidden group">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-blue-500 rounded-t-xl sm:rounded-t-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total</span>
              <div className="w-9 h-9 bg-blue-50/70 text-blue-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                </svg>
              </div>
            </div>
            <div className="text-2xl sm:text-3.5xl font-extrabold text-gray-900 font-jakarta leading-none">{countTotal}</div>
            <div className="text-[11px] text-gray-400 mt-1.5 font-medium">Laporan terdaftar</div>
          </div>
          
          <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100/80 shadow-sm p-4 sm:p-5 hover:shadow-md transition-all duration-300 relative overflow-hidden group">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-red-500 rounded-t-xl sm:rounded-t-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Belum Diproses</span>
              <div className="w-9 h-9 bg-red-50/70 text-red-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                </svg>
              </div>
            </div>
            <div className="text-2xl sm:text-3.5xl font-extrabold text-red-500 font-jakarta leading-none">{countBaru}</div>
            <div className="text-[11px] text-gray-400 mt-1.5 font-medium">Menunggu ditanggapi</div>
          </div>

          <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100/80 shadow-sm p-4 sm:p-5 hover:shadow-md transition-all duration-300 relative overflow-hidden group">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-amber-500 rounded-t-xl sm:rounded-t-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Sedang Diproses</span>
              <div className="w-9 h-9 bg-amber-50/70 text-amber-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
            </div>
            <div className="text-2xl sm:text-3.5xl font-extrabold text-amber-500 font-jakarta leading-none">{countProses}</div>
            <div className="text-[11px] text-gray-400 mt-1.5 font-medium">Sedang ditangani</div>
          </div>

          <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100/80 shadow-sm p-4 sm:p-5 hover:shadow-md transition-all duration-300 relative overflow-hidden group">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-green-500 rounded-t-xl sm:rounded-t-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Selesai</span>
              <div className="w-9 h-9 bg-green-50/70 text-green-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
            </div>
            <div className="text-2xl sm:text-3.5xl font-extrabold text-green-500 font-jakarta leading-none">{countSelesai}</div>
            <div className="text-[11px] text-gray-400 mt-1.5 font-medium">Selesai diperbaiki</div>
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
        <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 shadow-sm mb-4 fade-up overflow-visible">
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100 overflow-visible">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 overflow-visible">
              <h2 className="font-bold text-gray-800 text-sm sm:text-base">Semua Laporan Masuk</h2>
              <div className="flex flex-col xl:flex-row items-stretch xl:items-center gap-3 w-full xl:w-auto overflow-visible">
                {/* Search */}
                <div className="relative flex-1 xl:flex-none">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Search className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    placeholder="Cari pelapor, judul, lokasi..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full xl:w-60 pl-10 pr-4 py-2.5 border border-slate-100 hover:border-slate-200 focus:border-blue-400 bg-slate-50 focus:bg-white text-slate-700 font-semibold rounded-xl text-xs transition-all shadow-sm focus:outline-none"
                  />
                </div>
                
                <div className="flex flex-wrap gap-2.5 items-center overflow-visible">
                  {/* Backdrop Overlay to close dropdowns */}
                  {activeDropdown && (
                    <div 
                      className="fixed inset-0 z-30 cursor-default" 
                      onClick={() => setActiveDropdown(null)} 
                    />
                  )}

                  {/* Filter Status */}
                  <div className="relative flex-1 sm:flex-none z-40">
                    <button
                      type="button"
                      onClick={() => setActiveDropdown(activeDropdown === 'status' ? null : 'status')}
                      className={`w-full sm:w-auto min-w-[130px] flex items-center justify-between gap-2 px-4 py-2.5 border text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm focus:outline-none ${
                        filterStatus 
                          ? 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100/70' 
                          : 'border-slate-100 bg-slate-50 text-slate-700 hover:border-slate-200 hover:bg-slate-100/30'
                      }`}
                    >
                      <span>{filterStatus ? `Status: ${filterStatus === 'Belum Diproses' ? 'Baru' : filterStatus === 'Sedang Diproses' ? 'Diproses' : 'Selesai'}` : 'Semua Status'}</span>
                      <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${activeDropdown === 'status' ? 'rotate-180' : ''}`} />
                    </button>

                    {activeDropdown === 'status' && (
                      <div className="absolute right-0 sm:left-0 mt-2 w-48 bg-white border border-slate-100 rounded-xl shadow-xl z-50 py-1.5 focus:outline-none animate-in fade-in slide-in-from-top-1 duration-150">
                        {[
                          { value: '', label: 'Semua Status' },
                          { value: 'Belum Diproses', label: 'Baru' },
                          { value: 'Sedang Diproses', label: 'Diproses' },
                          { value: 'Selesai', label: 'Selesai' }
                        ].map((opt) => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => {
                              setFilterStatus(opt.value);
                              setActiveDropdown(null);
                            }}
                            className={`w-full flex items-center justify-between px-4 py-2 text-xs font-semibold text-left transition-colors cursor-pointer ${
                              filterStatus === opt.value 
                                ? 'bg-blue-50 text-blue-700' 
                                : 'text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            <span>{opt.label}</span>
                            {filterStatus === opt.value && <Check className="w-3.5 h-3.5 text-blue-600" />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Filter Kategori */}
                  <div className="relative flex-1 sm:flex-none z-40">
                    <button
                      type="button"
                      onClick={() => setActiveDropdown(activeDropdown === 'kategori' ? null : 'kategori')}
                      className={`w-full sm:w-auto min-w-[150px] flex items-center justify-between gap-2 px-4 py-2.5 border text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm focus:outline-none ${
                        filterKategori 
                          ? 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100/70' 
                          : 'border-slate-100 bg-slate-50 text-slate-700 hover:border-slate-200 hover:bg-slate-100/30'
                      }`}
                    >
                      <span className="truncate max-w-[130px]">
                        {filterKategori ? `Kategori: ${filterKategori}` : 'Semua Kategori'}
                      </span>
                      <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${activeDropdown === 'kategori' ? 'rotate-180' : ''}`} />
                    </button>

                    {activeDropdown === 'kategori' && (
                      <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-100 rounded-xl shadow-xl z-50 py-1.5 focus:outline-none animate-in fade-in slide-in-from-top-1 duration-150">
                        {[
                          { value: '', label: 'Semua Kategori' },
                          { value: 'Gedung / Ruang Kelas', label: 'Gedung / Ruang Kelas' },
                          { value: 'Toilet', label: 'Toilet' },
                          { value: 'Parkiran', label: 'Parkiran' },
                          { value: 'Kantin', label: 'Kantin' },
                          { value: 'Laboratorium', label: 'Laboratorium' },
                          { value: 'Perpustakaan', label: 'Perpustakaan' },
                          { value: 'Wifi', label: 'Wifi' }
                        ].map((opt) => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => {
                              setFilterKategori(opt.value);
                              setActiveDropdown(null);
                            }}
                            className={`w-full flex items-center justify-between px-4 py-2 text-xs font-semibold text-left transition-colors cursor-pointer ${
                              filterKategori === opt.value 
                                ? 'bg-blue-50 text-blue-700' 
                                : 'text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            <span>{opt.label}</span>
                            {filterKategori === opt.value && <Check className="w-3.5 h-3.5 text-blue-600" />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Filter Prodi */}
                  <div className="relative flex-1 sm:flex-none z-40">
                    <button
                      type="button"
                      onClick={() => setActiveDropdown(activeDropdown === 'prodi' ? null : 'prodi')}
                      className={`w-full sm:w-auto min-w-[155px] flex items-center justify-between gap-2 px-4 py-2.5 border text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm focus:outline-none ${
                        filterProdi 
                          ? 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100/70' 
                          : 'border-slate-100 bg-slate-50 text-slate-700 hover:border-slate-200 hover:bg-slate-100/30'
                      }`}
                    >
                      <span className="truncate max-w-[130px]">
                        {filterProdi ? `Prodi: ${filterProdi}` : 'Semua Prodi'}
                      </span>
                      <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${activeDropdown === 'prodi' ? 'rotate-180' : ''}`} />
                    </button>

                    {activeDropdown === 'prodi' && (
                      <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-100 rounded-xl shadow-xl z-50 py-1.5 focus:outline-none max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent animate-in fade-in slide-in-from-top-1 duration-150">
                        <button
                          type="button"
                          onClick={() => {
                            setFilterProdi('');
                            setActiveDropdown(null);
                          }}
                          className={`w-full flex items-center justify-between px-4 py-2.5 text-xs font-semibold text-left border-b border-slate-50 transition-colors cursor-pointer ${
                            filterProdi === '' 
                              ? 'bg-blue-50 text-blue-700 font-bold' 
                              : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <span>Semua Prodi</span>
                          {filterProdi === '' && <Check className="w-3.5 h-3.5 text-blue-600" />}
                        </button>
                        {ALL_PRODI.map((p) => (
                          <button
                            key={p}
                            type="button"
                            onClick={() => {
                              setFilterProdi(p);
                              setActiveDropdown(null);
                            }}
                            className={`w-full flex items-center justify-between px-4 py-2.5 text-xs font-semibold text-left transition-colors cursor-pointer ${
                              filterProdi === p 
                                ? 'bg-blue-50 text-blue-700 font-bold' 
                                : 'text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            <span>{p}</span>
                            {filterProdi === p && <Check className="w-3.5 h-3.5 text-blue-600" />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Reset/Clear Button */}
                  {(search || filterStatus || filterKategori || filterProdi) && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearch('');
                        setFilterStatus('');
                        setFilterKategori('');
                        setFilterProdi('');
                        showToast('Filter berhasil disetel ulang', 'success');
                      }}
                      className="flex items-center gap-1.5 text-[11px] font-extrabold text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-2.5 rounded-xl transition-all cursor-pointer border border-transparent hover:border-red-100"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset</span>
                    </button>
                  )}

                  {/* Export CSV Button */}
                  <button
                    type="button"
                    onClick={handleExportCSV}
                    className="flex items-center gap-1.5 text-[11px] font-extrabold text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 px-3 py-2.5 rounded-xl transition-all cursor-pointer border border-transparent hover:border-emerald-100/50"
                    title="Ekspor ke CSV"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Ekspor CSV</span>
                  </button>

                  {/* Riwayat Dihapus Button */}
                  <button
                    type="button"
                    onClick={() => setShowDeletedModal(true)}
                    className="flex items-center gap-1.5 text-[11px] font-extrabold text-slate-600 hover:text-slate-700 hover:bg-slate-50 px-3 py-2.5 rounded-xl transition-all cursor-pointer border border-transparent hover:border-slate-200"
                    title="Riwayat Laporan Dihapus"
                  >
                    <History className="w-3.5 h-3.5" />
                    <span>Riwayat Hapus</span>
                  </button>
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
                        <td className="px-4 sm:px-6 py-3">
                          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1.5">
                            {renderStatusBadge(l.status)}
                            {isReportUrgent(l.tanggal, l.status) && (
                              <span className="inline-flex items-center gap-1 text-[9px] font-black px-2 py-0.5 bg-red-100 text-red-700 border border-red-200/50 rounded-full uppercase tracking-wider animate-pulse whitespace-nowrap">
                                🚨 Urgent
                              </span>
                            )}
                          </div>
                        </td>
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

              {/* Timeline Riwayat */}
              <div className="pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-400 font-extrabold uppercase tracking-widest mb-3">Timeline Progres Laporan</p>
                <div className="relative border-l-2 border-slate-100 ml-2.5 pl-4 space-y-4">
                  {(selectedReport.history || [
                    { status: 'Belum Diproses', tanggal: selectedReport.tanggal }
                  ]).map((h, i) => {
                    const statusColorMap = {
                      'Belum Diproses': 'bg-red-500 ring-red-100',
                      'Sedang Diproses': 'bg-amber-500 ring-amber-100',
                      'Selesai': 'bg-green-500 ring-green-100'
                    };
                    const colorClass = statusColorMap[h.status] || 'bg-gray-500 ring-gray-100';
                    return (
                      <div key={i} className="relative">
                        {/* Dot indicator */}
                        <div className={`absolute -left-[21px] top-1 w-2 h-2 rounded-full ring-4 ${colorClass}`} />
                        <div>
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-bold text-slate-800">
                              {h.status === 'Belum Diproses' ? 'Baru' : h.status === 'Sedang Diproses' ? 'Diproses' : 'Selesai'}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium">{h.tanggal}</span>
                          </div>
                          {h.catatan && (
                            <p className="text-[11px] text-slate-500 italic mt-0.5 leading-relaxed">
                              "{h.catatan}"
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Input Tanggapan Admin */}
              <div className="pt-4 border-t border-gray-100">
                <label className="text-xs text-gray-400 font-extrabold uppercase tracking-widest block mb-1.5">Tanggapan / Catatan Tindakan</label>
                <textarea
                  rows={3}
                  value={tanggapanInput}
                  onChange={(e) => setTanggapanInput(e.target.value)}
                  placeholder="Ketik detail tanggapan atau tindakan perbaikan di sini..."
                  className="w-full p-3 border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-blue-400 bg-gray-50/50 focus:bg-white resize-none"
                />
                <div className="flex justify-end mt-1.5">
                  <button
                    type="button"
                    onClick={simpanTanggapan}
                    className="px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-100/50 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Simpan Catatan
                  </button>
                </div>
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
                  {(['Belum Diproses', 'Sedang Diproses', 'Selesai'] as const).map(s => {
                    const isActive = selectedReport.status === s;
                    const stylesMap = {
                      'Belum Diproses': isActive ? 'bg-red-500 text-white border-red-500' : 'bg-red-50 text-red-500 border-red-100 hover:bg-red-100',
                      'Sedang Diproses': isActive ? 'bg-yellow-500 text-white border-yellow-500' : 'bg-yellow-50 text-yellow-600 border-yellow-100 hover:bg-yellow-100',
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
      {/* Modal Riwayat Penghapusan */}
      <div className={`modal-overlay ${showDeletedModal ? 'active' : ''}`}>
        <div className="bg-white rounded-2xl shadow-2xl p-5 sm:p-6 max-w-3xl w-full mx-4 max-h-[85vh] flex flex-col">
          <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
            <h3 className="text-base sm:text-lg font-extrabold text-gray-900 font-jakarta flex items-center gap-2">
              <History className="w-5 h-5 text-slate-500" />
              Riwayat Laporan Dihapus
            </h3>
            <button onClick={() => setShowDeletedModal(false)} className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto min-h-[30vh]">
            {deletedList.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 py-12">
                <Trash2 className="w-12 h-12 mb-3 text-slate-200" />
                <p className="font-medium text-sm">Belum ada riwayat laporan yang dihapus</p>
              </div>
            ) : (
              <div className="space-y-3">
                {deletedList.slice().reverse().map((l) => (
                  <div key={`${l.id}-${l.deletedAt}`} className="border border-slate-100 rounded-xl p-4 hover:bg-slate-50 transition-colors text-left">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm mb-0.5">{l.judul}</h4>
                        <p className="text-xs text-slate-500">{l.nama} ({l.nim}) • {l.prodi}</p>
                      </div>
                      <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-1 rounded-lg">ID: #{String(l.id).padStart(3, '0')}</span>
                    </div>
                    <div className="bg-red-50/50 border border-red-100/50 rounded-lg p-3 mt-3 flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-red-100 text-red-500 flex items-center justify-center shrink-0">
                        <Trash2 className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-slate-700">Dihapus oleh <span className="text-red-600">{l.deletedBy}</span></p>
                        <p className="text-[10px] text-slate-500 mt-0.5">{new Date(l.deletedAt).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' })}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

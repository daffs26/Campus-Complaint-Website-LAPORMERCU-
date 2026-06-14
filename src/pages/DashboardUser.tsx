import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLaporan, saveLaporan, formatTanggal, getTodayDate } from '../utils';
import type { Laporan, User } from '../types';
import { useToast } from '../components/Toast';
import Modal from '../components/Modal';
import { CardSkeleton } from '../components/Skeleton';
import { 
  UploadCloud, 
  X, 
  FileImage, 
  Search, 
  Plus,
  ChevronDown, 
  ChevronUp, 
  LogOut, 
  Clock, 
  BookOpen, 
  Wifi, 
  AlertCircle, 
  MapPin, 
  Calendar, 
  Tag, 
  Building2, 
  Car, 
  Utensils, 
  FlaskConical, 
  FileText, 
  CheckCircle2, 
  Menu, 
  HelpCircle,
  TrendingUp,
  ArrowUpDown
} from 'lucide-react';

export default function DashboardUser() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [laporanList, setLaporanList] = useState<Laporan[]>([]);
  const [activeTab, setActiveTab] = useState<'laporan' | 'buat'>('laporan');

  // Search & Filter & Sort states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [sortByDate, setSortByDate] = useState<'desc' | 'asc'>('desc');

  // Expanded report state (Accordion)
  const [expandedReportId, setExpandedReportId] = useState<number | null>(null);

  // Form states
  const [kategori, setKategori] = useState('');
  const [lokasi, setLokasi] = useState('');
  const [judul, setJudul] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [fotoName, setFotoName] = useState('Klik untuk upload foto');
  const [formError, setFormError] = useState('');

  // Modals & Enhanced features
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Drag & Drop / Preview states
  const [isDragging, setIsDragging] = useState(false);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [fotoBase64, setFotoBase64] = useState<string | null>(null);

  // Rating selections
  const [selectedRatingId, setSelectedRatingId] = useState<number | null>(null);
  const [currentRatingVal, setCurrentRatingVal] = useState(0);
  const [ratingComment, setRatingComment] = useState('');
  const [ratingError, setRatingError] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const sessionUser = sessionStorage.getItem('loggedUser');
    if (!sessionUser) {
      navigate('/login');
      return;
    }
    const userObj = JSON.parse(sessionUser) as User;
    if (userObj.role !== 'user') {
      navigate('/login');
      return;
    }
    setCurrentUser(userObj);
    setLaporanList(getLaporan());
  }, [navigate]);

  // Jeda loading buatan saat berpindah tab
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 750);
    return () => clearTimeout(timer);
  }, [activeTab]);

  const handleLogout = () => {
    sessionStorage.removeItem('loggedUser');
    navigate('/');
  };

  const myLaporan = laporanList.filter(l => l.nim === currentUser?.nim);
  
  // Calculate counts
  const countTotal = myLaporan.length;
  const countProses = myLaporan.filter(l => l.status === 'Diproses').length;
  const countSelesai = myLaporan.filter(l => l.status === 'Selesai').length;

  // Search, filter, and sort logic
  const filteredLaporan = myLaporan
    .filter(l => {
      const matchSearch = 
        l.judul.toLowerCase().includes(searchQuery.toLowerCase()) || 
        l.deskripsi.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.lokasi.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.kategori.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchStatus = statusFilter === 'All' ? true : l.status === statusFilter;
      return matchSearch && matchStatus;
    })
    .sort((a, b) => {
      const dateA = new Date(a.tanggal).getTime();
      const dateB = new Date(b.tanggal).getTime();
      return sortByDate === 'desc' ? dateB - dateA : dateA - dateB;
    });

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      showToast('File harus berupa gambar (JPG/PNG)!', 'error');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      showToast('Ukuran gambar maksimal 2MB!', 'error');
      return;
    }

    setFotoName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64Url = e.target?.result as string;
      setFotoPreview(base64Url);
      setFotoBase64(base64Url);
    };
    reader.readAsDataURL(file);
  };

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  // Drag & drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const removeFoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFotoPreview(null);
    setFotoBase64(null);
    setFotoName('Klik untuk upload foto');
  };

  const submitLaporan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!kategori || !lokasi.trim() || !judul.trim() || !deskripsi.trim()) {
      setFormError('⚠️ Semua field bertanda * wajib diisi.');
      showToast('Harap lengkapi semua field wajib!', 'error');
      return;
    }
    setFormError('');

    const allReports = getLaporan();
    const nextId = allReports.length > 0 ? Math.max(...allReports.map(l => l.id)) + 1 : 1;
    const newReport: Laporan = {
      id: nextId,
      nim: currentUser?.nim || '',
      nama: currentUser?.name || 'Mahasiswa',
      prodi: currentUser?.prodi || 'Sistem Informasi',
      judul: judul.trim(),
      kategori,
      lokasi: lokasi.trim(),
      deskripsi: deskripsi.trim(),
      tanggal: getTodayDate(),
      status: 'Baru',
      foto: fotoBase64 || undefined
    };

    const updatedList = [...allReports, newReport];
    saveLaporan(updatedList);
    setLaporanList(updatedList);

    // Reset Form
    setKategori('');
    setLokasi('');
    setJudul('');
    setDeskripsi('');
    setFotoName('Klik untuk upload foto');
    setFotoPreview(null);
    setFotoBase64(null);

    showToast('Laporan pengaduan berhasil dikirim!', 'success');
    setShowSuccessModal(true);
  };

  const closeSuccessModal = () => {
    setShowSuccessModal(false);
    setActiveTab('laporan');
  };

  // Rating handlers
  const openRating = (id: number) => {
    setSelectedRatingId(id);
    setCurrentRatingVal(0);
    setRatingComment('');
    setRatingError(false);
    setShowRatingModal(true);
  };

  const closeRating = () => {
    setShowRatingModal(false);
  };

  const submitRating = () => {
    if (currentRatingVal === 0) {
      setRatingError(true);
      return;
    }

    const allReports = getLaporan();
    const idx = allReports.findIndex(r => r.id === selectedRatingId);
    if (idx > -1) {
      allReports[idx].rating = currentRatingVal;
      allReports[idx].feedback = ratingComment.trim();
      saveLaporan(allReports);
      setLaporanList(allReports);
      showToast('Ulasan dan rating berhasil dikirim!', 'success');
    }
    setShowRatingModal(false);
  };

  const categories = [
    { name: 'Gedung / Ruang Kelas', icon: Building2, desc: 'Fasilitas belajar, meja, AC, kursi, LCD proyektor', color: 'bg-blue-50 text-blue-600 border-blue-100 hover:border-blue-300' },
    { name: 'Wifi', icon: Wifi, desc: 'Koneksi internet lambat, mati, atau susah tersambung', color: 'bg-indigo-50 text-indigo-600 border-indigo-100 hover:border-indigo-300' },
    { name: 'Toilet', icon: HelpCircle, desc: 'Saluran air tersumbat, kran rusak, toilet kotor', color: 'bg-pink-50 text-pink-600 border-pink-100 hover:border-pink-300' },
    { name: 'Parkiran', icon: Car, desc: 'Ketertiban parkir, lampu penerangan mati, keamanan', color: 'bg-amber-50 text-amber-600 border-amber-100 hover:border-amber-300' },
    { name: 'Kantin', icon: Utensils, desc: 'Kebersihan meja/kursi kantin, fasilitas makan', color: 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:border-emerald-300' },
    { name: 'Laboratorium', icon: FlaskConical, desc: 'Komputer rusak, alat praktikum bermasalah', color: 'bg-purple-50 text-purple-600 border-purple-100 hover:border-purple-300' },
    { name: 'Perpustakaan', icon: BookOpen, desc: 'Fasilitas baca, AC perpustakaan mati, AC rusak', color: 'bg-cyan-50 text-cyan-600 border-cyan-100 hover:border-cyan-300' },
  ];

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .slice(0, 2)
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  const toggleAccordion = (id: number) => {
    if (expandedReportId === id) {
      setExpandedReportId(null);
    } else {
      setExpandedReportId(id);
    }
  };

  return (
    <div className="bg-[#f8fafc] min-h-screen font-jakarta flex flex-col md:flex-row">
      {/* MOBILE HEADER */}
      <header className="md:hidden bg-white border-b border-slate-100 px-4 py-3 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center shadow-md shadow-blue-500/20">
            <svg className="w-4.5 h-4.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
            </svg>
          </div>
          <span className="font-extrabold text-md text-blue-700 tracking-tight">#LAPORMERCU</span>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
      </header>

      {/* MOBILE NAV MENU */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40" onClick={() => setIsMobileMenuOpen(false)}>
          <div 
            className="w-4/5 max-w-sm bg-white h-full p-6 flex flex-col justify-between shadow-2xl animate-fade-right"
            onClick={e => e.stopPropagation()}
          >
            <div>
              {/* Profile Block */}
              <div className="flex items-center gap-3 pb-6 border-b border-slate-100">
                <div className="w-11 h-11 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-extrabold text-sm shadow-md">
                  {currentUser ? getInitials(currentUser.name) : 'M'}
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm truncate max-w-[180px]">{currentUser?.name}</h4>
                  <p className="text-xs text-slate-400">{currentUser?.nim}</p>
                  <p className="text-[10px] text-slate-400 font-semibold">{currentUser?.prodi}</p>
                </div>
              </div>

              {/* Navigation */}
              <div className="mt-6 space-y-2">
                <button
                  onClick={() => { setActiveTab('laporan'); setIsMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                    activeTab === 'laporan'
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  <FileText className="w-4.5 h-4.5" />
                  Riwayat Pengaduan
                </button>
                <button
                  onClick={() => { setActiveTab('buat'); setIsMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                    activeTab === 'buat'
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  <Plus className="w-4.5 h-4.5" />
                  Buat Pengaduan
                </button>
              </div>
            </div>

            {/* Logout */}
            <button 
              onClick={() => { setIsLogoutModalOpen(true); setIsMobileMenuOpen(false); }}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Keluar Sesi
            </button>
          </div>
        </div>
      )}

      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex w-72 bg-white border-r border-slate-100 flex-col justify-between p-6 sticky top-0 h-screen shrink-0">
        <div>
          {/* Logo */}
          <div className="flex items-center gap-2.5 mb-8">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
              </svg>
            </div>
            <span className="font-extrabold text-lg text-blue-700 tracking-tight">#LAPORMERCU</span>
          </div>

          {/* Navigation Links */}
          <div className="space-y-1.5">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-2">Menu Utama</p>
            <button
              onClick={() => setActiveTab('laporan')}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
                activeTab === 'laporan'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/15'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <FileText className="w-4.5 h-4.5" />
              Riwayat Pengaduan
            </button>
            <button
              onClick={() => setActiveTab('buat')}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
                activeTab === 'buat'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/15'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Plus className="w-4.5 h-4.5" />
              Buat Pengaduan
            </button>
          </div>
        </div>

        {/* Profile Card & Logout */}
        <div className="space-y-4 pt-6 border-t border-slate-100">
          <div className="flex items-center gap-3 p-2 bg-slate-50/50 rounded-2xl border border-slate-100">
            <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-extrabold text-xs shadow-md">
              {currentUser ? getInitials(currentUser.name) : 'M'}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="font-bold text-slate-800 text-xs truncate">{currentUser?.name}</h4>
              <p className="text-[10px] text-slate-400 font-medium">{currentUser?.nim}</p>
              <p className="text-[9px] text-slate-400 font-semibold truncate leading-none mt-0.5">{currentUser?.prodi}</p>
            </div>
          </div>
          <button
            onClick={() => setIsLogoutModalOpen(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-3.5 text-xs font-extrabold text-rose-600 bg-rose-50 hover:bg-rose-100/70 border border-rose-100/30 rounded-xl transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            Keluar Sesi
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-5xl mx-auto w-full flex flex-col gap-6">
        
        {/* Welcome Header */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 fade-up">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Halo, {currentUser?.name?.split(' ')[0]}! 👋
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
              Pantau kelayakan sarana & prasarana kampus demi kenyamanan bersama.
            </p>
          </div>
          <button
            onClick={() => setActiveTab('buat')}
            className="btn-primary text-white font-semibold text-xs sm:text-sm px-4.5 py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow-lg shadow-blue-500/10 cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4.5 h-4.5" />
            Buat Laporan Baru
          </button>
        </div>

        {/* STATS AREA */}
        <div className="grid grid-cols-3 gap-3 sm:gap-5 fade-up">
          {/* Total */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 hover:shadow-md transition-all duration-300 group">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white">
              <FileText className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">Total</p>
              <h2 className="text-xl sm:text-2xl font-black text-slate-800 leading-none mt-0.5">{countTotal}</h2>
            </div>
          </div>

          {/* Diproses */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 hover:shadow-md transition-all duration-300 group">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 transition-colors group-hover:bg-amber-600 group-hover:text-white animate-pulse">
              <Clock className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">Diproses</p>
              <h2 className="text-xl sm:text-2xl font-black text-amber-600 leading-none mt-0.5">{countProses}</h2>
            </div>
          </div>

          {/* Selesai */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 hover:shadow-md transition-all duration-300 group">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 transition-colors group-hover:bg-emerald-600 group-hover:text-white">
              <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">Selesai</p>
              <h2 className="text-xl sm:text-2xl font-black text-emerald-600 leading-none mt-0.5">{countSelesai}</h2>
            </div>
          </div>
        </div>

        {/* TAB: Laporan Saya */}
        {activeTab === 'laporan' && (
          <div className="space-y-4 fade-up">
            
            {/* Search & Filters card */}
            <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Search input */}
              <div className="relative flex-1 max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Search className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  placeholder="Cari judul, deskripsi, lokasi..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-slate-100 hover:border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-blue-400 bg-slate-50 focus:bg-white transition-all"
                />
              </div>

              {/* Status Filters & Sort */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center bg-slate-50 border border-slate-100 p-0.5 rounded-xl text-xs font-bold">
                  {['All', 'Baru', 'Diproses', 'Selesai'].map((status) => (
                    <button
                      key={status}
                      onClick={() => setStatusFilter(status)}
                      className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                        statusFilter === status
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {status === 'All' ? 'Semua' : status}
                    </button>
                  ))}
                </div>

                {/* Sort Button */}
                <button
                  onClick={() => setSortByDate(prev => prev === 'desc' ? 'asc' : 'desc')}
                  className="flex items-center gap-1.5 px-3.5 py-2 border border-slate-100 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                  title="Urutkan Tanggal"
                >
                  <ArrowUpDown className="w-3.5 h-3.5" />
                  <span>{sortByDate === 'desc' ? 'Terbaru' : 'Terlama'}</span>
                </button>
              </div>
            </div>

            {/* List Laporan */}
            <div className="space-y-4">
              {isLoading ? (
                <div className="space-y-4">
                  <CardSkeleton />
                  <CardSkeleton />
                  <CardSkeleton />
                </div>
              ) : filteredLaporan.length === 0 ? (
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm py-16 text-center">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                    <TrendingUp className="w-8 h-8" />
                  </div>
                  <h3 className="font-extrabold text-slate-800 text-base">Laporan tidak ditemukan</h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                    Coba ganti filter atau masukkan kata kunci pencarian yang lain.
                  </p>
                  {myLaporan.length === 0 && (
                    <button 
                      onClick={() => setActiveTab('buat')} 
                      className="btn-primary text-white text-xs font-bold px-4 py-2 rounded-xl mt-4 inline-flex items-center gap-2 cursor-pointer"
                    >
                      Buat Laporan Pertama Anda
                    </button>
                  )}
                </div>
              ) : (
                filteredLaporan.map(l => {
                  const isExpanded = expandedReportId === l.id;
                  
                  // Status styles
                  let statusBg = 'bg-rose-50 text-rose-600 border-rose-100';
                  let statusDot = 'bg-rose-500';
                  if (l.status === 'Diproses') {
                    statusBg = 'bg-amber-50 text-amber-600 border-amber-100';
                    statusDot = 'bg-amber-500';
                  } else if (l.status === 'Selesai') {
                    statusBg = 'bg-emerald-50 text-emerald-600 border-emerald-100';
                    statusDot = 'bg-emerald-500';
                  }

                  return (
                    <div 
                      key={l.id} 
                      className={`bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden transition-all duration-300 ${
                        isExpanded ? 'ring-2 ring-blue-500/10 shadow-md' : 'hover:shadow'
                      }`}
                    >
                      {/* Accordion Trigger Header */}
                      <div 
                        onClick={() => toggleAccordion(l.id)}
                        className="p-5 sm:p-6 flex items-start gap-4 cursor-pointer hover:bg-slate-50/50 transition-colors"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2.5 mb-2.5">
                            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${statusBg} flex items-center gap-1.5`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${statusDot} animate-pulse`}></span>
                              {l.status}
                            </span>
                            <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-slate-300" />
                              {formatTanggal(l.tanggal)}
                            </span>
                          </div>
                          <h3 className="font-extrabold text-slate-800 text-sm sm:text-base leading-snug line-clamp-1">{l.judul}</h3>
                          <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                              <Tag className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                              {l.kategori}
                            </span>
                            <span className="flex items-center gap-1 truncate max-w-[200px]">
                              <MapPin className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                              {l.lokasi}
                            </span>
                          </div>
                        </div>

                        {/* Chevron Icon */}
                        <div className="w-8 h-8 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 shrink-0 border border-slate-100/50">
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </div>
                      </div>

                      {/* Accordion Expandable Details */}
                      {isExpanded && (
                        <div className="px-5 pb-6 sm:px-6 sm:pb-7 border-t border-slate-50 pt-5 space-y-4 bg-slate-50/20">
                          {/* Masalah details */}
                          <div className="space-y-1.5">
                            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Deskripsi Pengaduan</p>
                            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed bg-white p-4 rounded-2xl border border-slate-100">
                              {l.deskripsi}
                            </p>
                          </div>

                          {/* Foto Bukti */}
                          {l.foto && (
                            <div className="space-y-1.5">
                              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Foto Bukti Terlampir</p>
                              <div className="relative group overflow-hidden rounded-2xl border border-slate-100 max-w-sm inline-block">
                                <img
                                  src={l.foto}
                                  alt="Bukti Laporan"
                                  className="max-h-48 sm:max-h-56 object-cover cursor-zoom-in hover:opacity-95 transition-opacity"
                                  onClick={() => {
                                    const w = window.open();
                                    if (w) {
                                      w.document.write(`<title>Bukti Foto LaporMercu</title><body style="margin:0;background:#000;display:flex;align-items:center;justify-content:center;min-height:100vh;"><img src="${l.foto}" style="max-width:100%;max-height:100vh;object-fit:contain;"/></body>`);
                                    }
                                  }}
                                />
                              </div>
                            </div>
                          )}

                          {/* Ulasan & Rating Section */}
                          {l.status === 'Selesai' && (
                            <div className="pt-2 border-t border-slate-100">
                              {l.rating ? (
                                <div className="bg-emerald-50/50 border border-emerald-100/70 rounded-2xl p-4">
                                  <div className="flex items-center gap-2 text-xs font-extrabold text-emerald-800 mb-1.5">
                                    <div className="flex gap-0.5 text-yellow-500 text-sm">
                                      {'★'.repeat(l.rating) + '☆'.repeat(5 - l.rating)}
                                    </div>
                                    <span>({l.rating}/5) Ulasan Anda</span>
                                  </div>
                                  <p className="text-xs text-slate-500 leading-relaxed italic bg-white/60 p-2.5 rounded-xl border border-emerald-50/30">
                                    "{l.feedback || 'Tidak ada komentar.'}"
                                  </p>
                                </div>
                              ) : (
                                <div className="bg-blue-50/40 border border-blue-100/50 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                  <div>
                                    <h4 className="text-xs font-bold text-blue-900 flex items-center gap-1">
                                      <span>🎖️</span> Laporan Anda Telah Selesai!
                                    </h4>
                                    <p className="text-[11px] text-slate-400 mt-0.5">
                                      Bantu kami meningkatkan kualitas layanan fasilitas kampus dengan memberi rating.
                                    </p>
                                  </div>
                                  <button 
                                    onClick={() => openRating(l.id)} 
                                    className="text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap self-start sm:self-auto shadow-md shadow-blue-500/10"
                                  >
                                    Beri Rating & Ulasan
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* TAB: Buat Laporan */}
        {activeTab === 'buat' && (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8 w-full fade-up">
            
            {/* Header info */}
            <div className="text-center max-w-md mx-auto mb-8">
              <span className="w-10 h-10 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mx-auto mb-3">
                <Plus className="w-5 h-5" />
              </span>
              <h2 className="text-base sm:text-lg font-black text-slate-800">
                Formulir Pengaduan Kampus
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Kirim detail masalah fasilitas agar kami dapat segera memperbaikinya.
              </p>
            </div>

            {/* Auto-filled details card */}
            <div className="bg-blue-50/40 border border-blue-100/30 rounded-2xl p-4 mb-6">
              <p className="text-[10px] font-bold text-blue-700 uppercase tracking-widest mb-2">Profil Pelapor</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 text-[10px]">Nama Mahasiswa</span>
                  <p className="font-extrabold text-slate-700">{currentUser?.name}</p>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px]">NIM Pelapor</span>
                  <p className="font-extrabold text-slate-700">{currentUser?.nim}</p>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px]">Program Studi</span>
                  <p className="font-extrabold text-slate-700">{currentUser?.prodi}</p>
                </div>
              </div>
            </div>

            <form onSubmit={submitLaporan} className="space-y-6">
              
              {/* Category Grid Cards */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2.5">
                  Kategori Fasilitas <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {categories.map((cat) => {
                    const IconComp = cat.icon;
                    const isActive = kategori === cat.name;
                    return (
                      <button
                        key={cat.name}
                        type="button"
                        onClick={() => setKategori(cat.name)}
                        className={`p-4.5 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex gap-3.5 group select-none ${
                          isActive 
                            ? 'border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-500/15' 
                            : cat.color
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                          isActive ? 'bg-white/20 text-white' : 'bg-white shadow-sm'
                        }`}>
                          <IconComp className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-extrabold text-xs sm:text-sm leading-tight">{cat.name}</h4>
                          <p className={`text-[10px] mt-0.5 leading-tight line-clamp-2 ${isActive ? 'text-white/80' : 'text-slate-400'}`}>
                            {cat.desc}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Lokasi */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest">
                    Lokasi Detail <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      placeholder="Gedung, lantai, nomor ruangan..."
                      value={lokasi}
                      onChange={(e) => setLokasi(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-slate-100 hover:border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-blue-400 bg-slate-50 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                {/* Judul */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest">
                    Judul Laporan <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Tag className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      placeholder="Nama kerusakan/masalah singkat..."
                      value={judul}
                      onChange={(e) => setJudul(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-slate-100 hover:border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-blue-400 bg-slate-50 focus:bg-white transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Deskripsi */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest">
                  Deskripsi Masalah <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  placeholder="Ceritakan secara detail kronologi atau kondisi kerusakan..."
                  value={deskripsi}
                  onChange={(e) => setDeskripsi(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-100 hover:border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-blue-400 bg-slate-50 focus:bg-white transition-all resize-none"
                ></textarea>
              </div>

              {/* Upload foto */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest">
                  Foto Bukti Lampiran (Opsional)
                </label>
                <div
                  onClick={() => document.getElementById('fotoInput')?.click()}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 relative group overflow-hidden ${
                    isDragging
                      ? 'border-blue-500 bg-blue-50/70 scale-[0.99]'
                      : fotoPreview
                      ? 'border-blue-400 bg-blue-50/10'
                      : 'border-slate-100 hover:border-blue-400 hover:bg-slate-50/20'
                  }`}
                >
                  {fotoPreview ? (
                    <div className="relative flex flex-col items-center justify-center py-2">
                      <img 
                        src={fotoPreview} 
                        alt="Pratinjau foto" 
                        className="max-h-48 rounded-xl object-contain shadow-md border border-slate-100 mb-3"
                      />
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                        <FileImage className="w-4 h-4 text-blue-500" />
                        <span className="truncate max-w-[200px]">{fotoName}</span>
                      </div>
                      <button
                        type="button"
                        onClick={removeFoto}
                        className="absolute top-0 right-0 p-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-full transition-colors shadow-lg cursor-pointer"
                        title="Hapus foto"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="py-2">
                      <UploadCloud className={`w-10 h-10 mx-auto mb-2.5 transition-transform duration-300 ${isDragging ? 'scale-110 text-blue-500' : 'text-slate-400 group-hover:text-blue-500'}`} />
                      <p className="text-xs sm:text-sm font-bold text-slate-600 mb-1">
                        Tarik & lepas gambar di sini, atau <span className="text-blue-600 hover:underline">klik untuk memilih</span>
                      </p>
                      <p className="text-[10px] text-slate-400">Mendukung format JPG, PNG (Maksimal 2MB)</p>
                    </div>
                  )}
                </div>
                <input
                  id="fotoInput"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFotoChange}
                />
              </div>

              {/* Error msg */}
              {formError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm px-4 py-3.5 rounded-xl font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Submit */}
              <button 
                type="submit" 
                className="btn-primary w-full text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-blue-500/10 active:scale-[0.99] transition-all"
              >
                <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
                </svg>
                Kirim Pengaduan Sekarang
              </button>
            </form>
          </div>
        )}
      </main>

      {/* Modal sukses */}
      <div className={`modal-overlay ${showSuccessModal ? 'active' : ''}`}>
        <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 max-w-sm mx-4 text-center border border-slate-100">
          <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-emerald-500 border border-emerald-100">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"/>
            </svg>
          </div>
          <h3 className="text-base sm:text-lg font-black text-slate-800 mb-2">Laporan Terkirim!</h3>
          <p className="text-slate-400 text-xs sm:text-sm mb-6 leading-relaxed">
            Laporan Anda telah berhasil dicatat ke sistem dan akan segera diproses oleh divisi terkait.
          </p>
          <button 
            onClick={closeSuccessModal} 
            className="btn-primary w-full text-white font-bold py-3 rounded-xl cursor-pointer"
          >
            Lihat Riwayat Laporan
          </button>
        </div>
      </div>

      {/* Modal Rating */}
      <div className={`modal-overlay ${showRatingModal ? 'active' : ''}`}>
        <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 max-w-sm mx-4 w-full text-center border border-slate-100">
          <h3 className="text-base sm:text-lg font-black text-slate-800 mb-2">Ulasan & Rating Masukan</h3>
          <p className="text-slate-400 text-xs mb-4 leading-normal">
            Bintang Anda sangat berarti bagi pengembangan fasilitas kampus yang lebih baik.
          </p>
          
          {/* Stars Selector */}
          <div className="flex justify-center gap-1.5 mb-5 text-3xl">
            {[1, 2, 3, 4, 5].map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => setCurrentRatingVal(val)}
                className={`transition-all hover:scale-110 cursor-pointer ${val <= currentRatingVal ? 'text-yellow-400' : 'text-slate-200'}`}
              >
                ★
              </button>
            ))}
          </div>
          
          {/* Text comment */}
          <textarea
            rows={3}
            placeholder="Tulis ulasan singkat mengenai perbaikan ini..."
            value={ratingComment}
            onChange={(e) => setRatingComment(e.target.value)}
            className="w-full px-3.5 py-3.5 border border-slate-100 hover:border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-blue-400 bg-slate-50 focus:bg-white transition-all resize-none mb-4"
          ></textarea>
          
          {ratingError && (
            <div className="text-xs font-bold text-rose-500 mb-3 text-left">⚠️ Harap pilih rating bintang terlebih dahulu.</div>
          )}
          
          <div className="flex gap-2">
            <button onClick={closeRating} className="w-1/2 border border-slate-100 text-slate-500 font-bold py-3 rounded-xl text-xs sm:text-sm hover:bg-slate-50 transition-colors cursor-pointer">Batal</button>
            <button onClick={submitRating} className="w-1/2 btn-primary text-white font-bold py-3 rounded-xl text-xs sm:text-sm cursor-pointer shadow-md shadow-blue-500/10">Kirim Masukan</button>
          </div>
        </div>
      </div>

      {/* Modal Logout */}
      <Modal
        isOpen={isLogoutModalOpen}
        title="Konfirmasi Keluar"
        message="Apakah Anda yakin ingin mengakhiri sesi mahasiswa ini?"
        confirmLabel="Keluar Sesi"
        cancelLabel="Batal"
        onConfirm={handleLogout}
        onCancel={() => setIsLogoutModalOpen(false)}
        type="warning"
      />
    </div>
  );
}

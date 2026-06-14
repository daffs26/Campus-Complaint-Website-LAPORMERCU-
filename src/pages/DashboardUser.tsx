import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLaporan, saveLaporan, formatTanggal, getTodayDate } from '../utils';
import type { Laporan, User } from '../types';


export default function DashboardUser() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [laporanList, setLaporanList] = useState<Laporan[]>([]);
  const [activeTab, setActiveTab] = useState<'laporan' | 'buat'>('laporan');

  // Form states
  const [kategori, setKategori] = useState('');
  const [lokasi, setLokasi] = useState('');
  const [judul, setJudul] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [fotoName, setFotoName] = useState('Klik untuk upload foto');
  const [fotoUploaded, setFotoUploaded] = useState(false);
  const [formError, setFormError] = useState('');

  // Modals
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);

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

  const handleLogout = () => {
    sessionStorage.removeItem('loggedUser');
    navigate('/');
  };

  const myLaporan = laporanList.filter(l => l.nim === currentUser?.nim);
  const countTotal = myLaporan.length;
  const countProses = myLaporan.filter(l => l.status === 'Diproses').length;
  const countSelesai = myLaporan.filter(l => l.status === 'Selesai').length;

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFotoName(`✅ ${file.name}`);
      setFotoUploaded(true);
    }
  };

  const submitLaporan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!kategori || !lokasi.trim() || !judul.trim() || !deskripsi.trim()) {
      setFormError('⚠️ Semua field bertanda * wajib diisi.');
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
      status: 'Baru'
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
    setFotoUploaded(false);

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
    }
    setShowRatingModal(false);
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* NAVBAR */}
      <nav className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
              </svg>
            </div>
            <span className="font-bold text-base sm:text-lg text-blue-700 font-jakarta">#LAPORMERCU</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden sm:flex items-center gap-2 text-sm text-gray-600">
              <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
              </div>
              <span className="font-medium">{currentUser?.name || 'Mahasiswa'}</span>
              <span className="text-gray-400 text-xs">{currentUser?.nim}</span>
            </div>
            <button onClick={handleLogout} className="text-xs sm:text-sm font-medium text-red-500 hover:text-red-700 border border-red-200 px-2.5 sm:px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-1.5 cursor-pointer">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
              </svg>
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8 fade-up text-center">
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 font-jakarta">Selamat Datang, {currentUser?.name?.split(' ')[0]}! 👋</h1>
          <p className="text-gray-500 mt-1 text-sm sm:text-base">Buat laporan baru atau pantau status laporan kamu di sini</p>
        </div>

        {/* Stats kartu */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8 fade-up">
          <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5 text-center">
            <div className="text-xl sm:text-2xl font-extrabold text-gray-900">{countTotal}</div>
            <div className="text-xs sm:text-sm text-gray-500 mt-0.5">Total Laporan</div>
          </div>
          <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5 text-center">
            <div className="text-xl sm:text-2xl font-extrabold text-yellow-500">{countProses}</div>
            <div className="text-xs sm:text-sm text-gray-500 mt-0.5">Diproses</div>
          </div>
          <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5 text-center">
            <div className="text-xl sm:text-2xl font-extrabold text-green-500">{countSelesai}</div>
            <div className="text-xs sm:text-sm text-gray-500 mt-0.5">Selesai</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-6">
          <div className="bg-gray-100 p-1 rounded-xl inline-flex gap-1">
            <button
              onClick={() => setActiveTab('laporan')}
              className={`px-4 sm:px-5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${activeTab === 'laporan' ? 'tab-active' : 'text-gray-500'}`}
            >
              📋 Laporan Saya
            </button>
            <button
              onClick={() => setActiveTab('buat')}
              className={`px-4 sm:px-5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${activeTab === 'buat' ? 'tab-active' : 'text-gray-500'}`}
            >
              ➕ Buat Laporan
            </button>
          </div>
        </div>

        {/* TAB: Laporan */}
        {activeTab === 'laporan' && (
          <div className="fade-up">
            <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="font-bold text-gray-800 text-sm sm:text-base">Riwayat Laporan Saya</h2>
                <span className="text-xs bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full font-semibold">{countTotal} laporan</span>
              </div>
              
              {myLaporan.length === 0 ? (
                <div className="py-12 sm:py-16 text-center">
                  <div className="text-4xl mb-3">📭</div>
                  <p className="font-semibold text-gray-700">Belum ada laporan</p>
                  <p className="text-sm text-gray-400 mt-1">Kamu belum pernah membuat laporan apapun</p>
                  <button onClick={() => setActiveTab('buat')} className="btn-primary text-white text-sm font-semibold px-5 py-2.5 rounded-xl mt-4 inline-flex items-center gap-2 cursor-pointer">
                    Buat Laporan Pertama
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {myLaporan.map(l => {
                    const statusClass = l.status === 'Baru' ? 'status-baru' : l.status === 'Diproses' ? 'status-diproses' : 'status-selesai';
                    
                    return (
                      <div key={l.id} className="px-4 sm:px-6 py-4 sm:py-5 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <h3 className="font-semibold text-gray-800 text-sm sm:text-base leading-snug">{l.judul}</h3>
                          <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${statusClass} flex-shrink-0`}>{l.status}</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 sm:gap-3 mb-3">
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span className="text-gray-400 w-4 text-center flex-shrink-0">📌</span>
                            <span><span className="text-gray-400 font-medium">Kategori:</span> {l.kategori}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span className="text-gray-400 w-4 text-center flex-shrink-0">📍</span>
                            <span><span className="text-gray-400 font-medium">Lokasi:</span> {l.lokasi}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span className="text-gray-400 w-4 text-center flex-shrink-0">📅</span>
                            <span><span className="text-gray-400 font-medium">Tanggal:</span> {formatTanggal(l.tanggal)}</span>
                          </div>
                        </div>
                        <div className="bg-gray-50 rounded-lg px-3 py-2">
                          <p className="text-xs text-gray-500 leading-relaxed">{l.deskripsi}</p>
                        </div>
                        
                        {/* Rating feedback section */}
                        {l.status === 'Selesai' && (
                          <div className="mt-3 pt-3 border-t border-gray-100">
                            {l.rating ? (
                              <div className="bg-green-50/50 border border-green-100 rounded-lg p-3">
                                <div className="flex items-center gap-2 text-xs font-semibold text-green-700 mb-1">
                                  <span className="text-yellow-500 text-sm leading-none">
                                    {'★'.repeat(l.rating) + '☆'.repeat(5 - l.rating)}
                                  </span>
                                  <span>({l.rating}/5) Ulasan Anda</span>
                                </div>
                                <p className="text-xs text-gray-500 leading-relaxed italic">"{l.feedback || 'Tidak ada komentar.'}"</p>
                              </div>
                            ) : (
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                <p className="text-xs font-medium text-gray-500 flex items-center gap-1">
                                  <span>💡</span> Laporan selesai. Bantu kami dengan memberikan ulasan.
                                </p>
                                <button onClick={() => openRating(l.id)} className="text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors whitespace-nowrap self-start sm:self-auto cursor-pointer">
                                  Beri Rating & Ulasan
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB: Buat Laporan */}
        {activeTab === 'buat' && (
          <div className="fade-up flex justify-center">
            <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-8 max-w-3xl w-full">
              <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-5 sm:mb-6 flex items-center justify-center gap-2">
                <span className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                  </svg>
                </span>
                Form Pengaduan Fasilitas Kampus
              </h2>

              {/* Info pelapor (auto-fill) */}
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 sm:p-4 mb-5 sm:mb-6">
                <p className="text-xs font-semibold text-blue-600 mb-2">Identitas Pelapor (otomatis dari akun)</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 text-sm">
                  <div><span className="text-gray-500 text-xs">Nama</span><p className="font-semibold text-gray-800">{currentUser?.name}</p></div>
                  <div><span className="text-gray-500 text-xs">NIM</span><p className="font-semibold text-gray-800">{currentUser?.nim}</p></div>
                  <div><span className="text-gray-500 text-xs">Prodi</span><p className="font-semibold text-gray-800">{currentUser?.prodi}</p></div>
                </div>
              </div>

              <form onSubmit={submitLaporan} className="space-y-4 sm:space-y-5">
                {/* Kategori */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Kategori Fasilitas <span className="text-red-500">*</span></label>
                  <select
                    value={kategori}
                    onChange={(e) => setKategori(e.target.value)}
                    className="input-field w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 bg-gray-50 focus:bg-white"
                  >
                    <option value="">-- Pilih Kategori --</option>
                    <option value="Gedung / Ruang Kelas">🏫 Gedung / Ruang Kelas</option>
                    <option value="Toilet">🚻 Toilet</option>
                    <option value="Parkiran">🅿️ Parkiran</option>
                    <option value="Kantin">🍽️ Kantin</option>
                    <option value="Laboratorium">🔬 Laboratorium</option>
                    <option value="Perpustakaan">📚 Perpustakaan</option>
                    <option value="Wifi">📶 Wifi</option>
                  </select>
                </div>

                {/* Lokasi detail */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Lokasi Detail <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    placeholder="Contoh: Gedung A Lantai 3 Ruang 301"
                    value={lokasi}
                    onChange={(e) => setLokasi(e.target.value)}
                    className="input-field w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 bg-gray-50 focus:bg-white"
                  />
                </div>

                {/* Judul */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Judul Laporan <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    placeholder="Contoh: AC Rusak Tidak Berfungsi"
                    value={judul}
                    onChange={(e) => setJudul(e.target.value)}
                    className="input-field w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 bg-gray-50 focus:bg-white"
                  />
                </div>

                {/* Deskripsi */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Deskripsi Masalah <span className="text-red-500">*</span></label>
                  <textarea
                    rows={4}
                    placeholder="Jelaskan masalah secara detail..."
                    value={deskripsi}
                    onChange={(e) => setDeskripsi(e.target.value)}
                    className="input-field w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 bg-gray-50 focus:bg-white resize-none"
                  ></textarea>
                </div>

                {/* Upload foto */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Foto Bukti (opsional)</label>
                  <div
                    onClick={() => document.getElementById('fotoInput')?.click()}
                    className={`border-2 border-dashed rounded-xl p-5 sm:p-6 text-center cursor-pointer hover:border-blue-300 transition-all ${fotoUploaded ? 'border-blue-300 bg-blue-50' : 'border-gray-200 hover:bg-blue-50/50'}`}
                  >
                    <svg className="w-8 h-8 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                    </svg>
                    <p className="text-sm text-gray-400">{fotoName}</p>
                    <p className="text-xs text-gray-300 mt-1">JPG, PNG, max 5MB</p>
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
                  <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">{formError}</div>
                )}

                {/* Submit */}
                <button type="submit" className="btn-primary w-full text-white font-semibold py-3 sm:py-3.5 rounded-xl flex items-center justify-center gap-2 cursor-pointer">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
                  </svg>
                  Kirim Laporan
                </button>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Modal sukses */}
      <div className={`modal-overlay ${showSuccessModal ? 'active' : ''}`}>
        <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 max-w-sm mx-4 text-center">
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 sm:w-8 sm:h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
            </svg>
          </div>
          <h3 className="text-lg sm:text-xl font-extrabold text-gray-900 mb-2 font-jakarta">Laporan Terkirim!</h3>
          <p className="text-gray-500 text-sm mb-5 sm:mb-6">Laporan kamu telah berhasil dikirim dan akan segera diproses oleh admin.</p>
          <button onClick={closeSuccessModal} className="btn-primary w-full text-white font-semibold py-3 rounded-xl cursor-pointer">
            Lihat Laporan Saya
          </button>
        </div>
      </div>

      {/* Modal Rating */}
      <div className={`modal-overlay ${showRatingModal ? 'active' : ''}`}>
        <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 max-w-sm mx-4 w-full text-center">
          <h3 className="text-lg sm:text-xl font-extrabold text-gray-900 mb-2 font-jakarta">Beri Ulasan & Rating</h3>
          <p className="text-gray-500 text-sm mb-4">Umpan balik Anda membantu kami meningkatkan kualitas fasilitas kampus.</p>
          
          {/* Stars Selector */}
          <div className="flex justify-center gap-2 mb-4 text-3xl">
            {[1, 2, 3, 4, 5].map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => setCurrentRatingVal(val)}
                className={`transition-colors cursor-pointer ${val <= currentRatingVal ? 'text-yellow-400' : 'text-gray-300'}`}
              >
                ★
              </button>
            ))}
          </div>
          
          {/* Text comment */}
          <textarea
            rows={3}
            placeholder="Tulis masukan atau komentar Anda di sini..."
            value={ratingComment}
            onChange={(e) => setRatingComment(e.target.value)}
            className="input-field w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 bg-gray-50 focus:bg-white resize-none mb-4"
          ></textarea>
          
          {ratingError && (
            <div className="text-xs text-red-600 mb-3 text-left">⚠️ Harap pilih rating bintang.</div>
          )}
          
          <div className="flex gap-2">
            <button onClick={closeRating} className="w-1/2 border border-gray-200 text-gray-500 font-semibold py-2.5 rounded-xl text-sm hover:bg-gray-50 transition-colors cursor-pointer">Batal</button>
            <button onClick={submitRating} className="w-1/2 btn-primary text-white font-semibold py-2.5 rounded-xl text-sm cursor-pointer">Kirim</button>
          </div>
        </div>
      </div>
    </div>
  );
}

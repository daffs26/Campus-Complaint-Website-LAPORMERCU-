import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getLaporan } from '../utils';

export default function LandingPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    selesai: 0,
    proses: 0,
    ratingAvg: '0.0'
  });

  useEffect(() => {
    const list = getLaporan();
    const total = list.length;
    const selesai = list.filter(l => l.status === 'Selesai').length;
    const proses = list.filter(l => l.status === 'Diproses').length;
    
    // Hitung rata-rata rating dari yang bernilai rating
    const rated = list.filter(l => l.rating !== undefined && l.rating > 0);
    const sum = rated.reduce((acc, curr) => acc + (curr.rating || 0), 0);
    const avg = rated.length > 0 ? (sum / rated.length).toFixed(1) : '0.0';

    setStats({ total, selesai, proses, ratingAvg: avg });
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="bg-white text-gray-800 min-h-screen">
      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between relative">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
              </svg>
            </div>
            <span className="font-bold text-base sm:text-lg text-blue-700 font-jakarta">#LAPORMERCU</span>
          </div>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <a href="#cara-kerja" className="hover:text-blue-600 transition-colors">Cara Kerja</a>
            <a href="#kategori" className="hover:text-blue-600 transition-colors">Kategori</a>
            <a href="#stats" className="hover:text-blue-600 transition-colors">Statistik</a>
          </div>

          {/* Desktop buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link to="/login" className="text-sm font-semibold text-blue-600 border border-blue-200 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors">Masuk</Link>
            <Link to="/login-admin" className="text-sm font-semibold text-white btn-primary px-4 py-2 rounded-lg">Admin</Link>
          </div>

          {/* Mobile hamburger button */}
          <button className="mobile-menu-btn md:hidden text-gray-600" onClick={toggleMobileMenu} aria-label="Toggle menu">
            {!isMobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/>
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            )}
          </button>

          {/* Mobile menu dropdown */}
          <div className={`mobile-menu md:hidden ${isMobileMenuOpen ? 'active' : ''}`}>
            <a href="#cara-kerja" onClick={closeMobileMenu}>Cara Kerja</a>
            <a href="#kategori" onClick={closeMobileMenu}>Kategori</a>
            <a href="#stats" onClick={closeMobileMenu}>Statistik</a>
            <hr className="border-gray-200"/>
            <div className="flex flex-col gap-2 pt-1">
              <Link to="/login" onClick={closeMobileMenu} className="text-center text-sm font-semibold text-blue-600 border border-blue-200 px-4 py-2.5 rounded-lg hover:bg-blue-50 transition-colors">Masuk</Link>
              <Link to="/login-admin" onClick={closeMobileMenu} className="text-center text-sm font-semibold text-white btn-primary px-4 py-2.5 rounded-lg">Admin</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero-bg pt-28 sm:pt-32 pb-20 sm:pb-24 px-4 sm:px-6 relative overflow-hidden">
        <div className="absolute top-20 right-10 w-64 h-64 bg-blue-100 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute bottom-10 left-10 w-48 h-48 bg-blue-200 rounded-full blur-3xl opacity-30"></div>

        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            <div className="text-center md:text-left">
              <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-5 sm:mb-6 fade-up">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span>
                Sistem Pengaduan Resmi Kampus
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-blue-600 leading-tight mb-4 sm:mb-5 fade-up-2">
                Laporkan <span className="text-white">Masalah</span><br/>
                <span className="text-white">Fasilitas Kampus </span><br/>
                <span className="text-white">dengan</span>
                <span className="text-blue-500"> Mudah</span>
              </h1>

              <p className="text-white text-base sm:text-lg leading-relaxed mb-6 sm:mb-8 fade-up-3 max-w-lg mx-auto md:mx-0">
                Bantu kami menjaga kenyamanan kampus. Sampaikan pengaduanmu dan pantau status penanganannya secara langsung.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 fade-up-4 justify-center md:justify-start">
                <Link to="/login" className="btn-primary text-white font-semibold px-6 py-3 rounded-xl flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/>
                  </svg>
                  Buat Laporan
                </Link>

                <a href="#cara-kerja" className="bg-white text-gray-700 font-semibold px-6 py-3 rounded-xl border border-gray-200 hover:border-blue-300 hover:text-blue-600 transition-all flex items-center justify-center gap-2">
                  Pelajari Selengkapnya
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Ilustrasi */}
            <div className="hidden md:flex justify-center fade-up-3">
              <div className="relative w-80 h-80">
                <div className="absolute inset-0 bg-white rounded-3xl shadow-xl p-6 flex flex-col gap-4">
                  <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                      </svg>
                    </div>
                    <span className="font-semibold text-gray-800 text-sm">Laporan Terbaru</span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-700 truncate">AC Rusak - Lab Komputer</p>
                        <p className="text-xs text-gray-400">Laboratorium</p>
                      </div>
                      <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-medium whitespace-nowrap">Diproses</span>
                    </div>
                    <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                      <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-700 truncate">Toilet Mampet Lt.2</p>
                        <p className="text-xs text-gray-400">Toilet</p>
                      </div>
                      <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium whitespace-nowrap">Baru</span>
                    </div>
                    <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-700 truncate">Lampu Parkir Mati</p>
                        <p className="text-xs text-gray-400">Parkiran</p>
                      </div>
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium whitespace-nowrap">Selesai</span>
                    </div>
                  </div>
                  <div className="mt-auto pt-2 border-t border-gray-100">
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>3 laporan aktif</span>
                      <Link to="/login" className="text-blue-500 font-medium">Lihat semua →</Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS MARQUEE */}
      <section id="stats" className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 py-5 border-y border-white/10 overflow-hidden shadow-inner">
        <div className="stats-marquee">
          {/* Track 1 */}
          <div className="stats-marquee-track">
            <div className="stats-marquee-item"><span className="stats-number">{stats.total}</span><span className="stats-label">Total Laporan</span></div>
            <div className="stats-marquee-divider">✦</div>
            <div className="stats-marquee-item"><span className="stats-number">{stats.selesai}</span><span className="stats-label">Laporan Selesai</span></div>
            <div className="stats-marquee-divider">✦</div>
            <div className="stats-marquee-item"><span className="stats-number">{stats.proses}</span><span className="stats-label">Sedang Diproses</span></div>
            <div className="stats-marquee-divider">✦</div>
            <div className="stats-marquee-item"><span className="stats-number">★ {stats.ratingAvg}</span><span className="stats-label">Rata-rata Ulasan</span></div>
            <div className="stats-marquee-divider">✦</div>
          </div>
          {/* Track 2 (exact duplicate for infinite scroll effect) */}
          <div className="stats-marquee-track" aria-hidden="true">
            <div className="stats-marquee-item"><span className="stats-number">{stats.total}</span><span className="stats-label">Total Laporan</span></div>
            <div className="stats-marquee-divider">✦</div>
            <div className="stats-marquee-item"><span className="stats-number">{stats.selesai}</span><span className="stats-label">Laporan Selesai</span></div>
            <div className="stats-marquee-divider">✦</div>
            <div className="stats-marquee-item"><span className="stats-number">{stats.proses}</span><span className="stats-label">Sedang Diproses</span></div>
            <div className="stats-marquee-divider">✦</div>
            <div className="stats-marquee-item"><span className="stats-number">★ {stats.ratingAvg}</span><span className="stats-label">Rata-rata Ulasan</span></div>
            <div className="stats-marquee-divider">✦</div>
          </div>
        </div>
      </section>

      {/* CARA KERJA */}
      <section id="cara-kerja" className="py-14 sm:py-20 px-4 sm:px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10 sm:mb-14">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-3">Cara Kerja <span className="text-blue-500"> #LAPORMERCU</span></h2>
            <p className="text-gray-500 text-sm sm:text-base max-w-md mx-auto">Proses yang simpel dan transparan dari laporan hingga penyelesaian</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            <div className="card-hover bg-white border border-gray-100 rounded-2xl p-5 sm:p-6 shadow-sm text-center">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
              </div>
              <div className="text-xs font-bold text-blue-500 mb-1">LANGKAH 1</div>
              <h3 className="font-bold text-gray-800 mb-2">Login dengan NIM</h3>
              <p className="text-sm text-gray-500">Masuk menggunakan NIM dan password kamu</p>
            </div>
            <div className="card-hover bg-white border border-gray-100 rounded-2xl p-5 sm:p-6 shadow-sm text-center">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                </svg>
              </div>
              <div className="text-xs font-bold text-blue-500 mb-1">LANGKAH 2</div>
              <h3 className="font-bold text-gray-800 mb-2">Buat Laporan</h3>
              <p className="text-sm text-gray-500">Isi form lengkap dengan foto dan deskripsi masalah</p>
            </div>
            <div className="card-hover bg-white border border-gray-100 rounded-2xl p-5 sm:p-6 shadow-sm text-center">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                </svg>
              </div>
              <div className="text-xs font-bold text-blue-500 mb-1">LANGKAH 3</div>
              <h3 className="font-bold text-gray-800 mb-2">Admin Meninjau</h3>
              <p className="text-sm text-gray-500">Tim admin memverifikasi dan menindaklanjuti laporan</p>
            </div>
            <div className="card-hover bg-white border border-gray-100 rounded-2xl p-5 sm:p-6 shadow-sm text-center">
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <div className="text-xs font-bold text-green-500 mb-1">LANGKAH 4</div>
              <h3 className="font-bold text-gray-800 mb-2">Masalah Selesai</h3>
              <p className="text-sm text-gray-500">Kamu akan melihat status laporan berubah jadi Selesai</p>
            </div>
          </div>
        </div>
      </section>

      {/* KATEGORI */}
      <section id="kategori" className="py-14 sm:py-20 px-4 sm:px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10 sm:mb-14">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-3">Kategori Fasilitas</h2>
            <p className="text-gray-500 text-sm sm:text-base">Laporkan masalah di berbagai area kampus</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-5">
            <div className="card-hover bg-white border border-gray-100 rounded-2xl p-4 sm:p-5 shadow-sm flex items-center gap-4">
              <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0 text-lg">🏫</div>
              <div className="min-w-0">
                <h3 className="font-semibold text-gray-800 text-sm sm:text-base">Gedung / Ruang Kelas</h3>
                <p className="text-xs text-gray-400 mt-0.5">AC, kursi, proyektor, dll</p>
              </div>
            </div>
            <div className="card-hover bg-white border border-gray-100 rounded-2xl p-4 sm:p-5 shadow-sm flex items-center gap-4">
              <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0 text-lg">🚻</div>
              <div className="min-w-0">
                <h3 className="font-semibold text-gray-800 text-sm sm:text-base">Toilet</h3>
                <p className="text-xs text-gray-400 mt-0.5">Kebersihan, kerusakan sarana</p>
              </div>
            </div>
            <div className="card-hover bg-white border border-gray-100 rounded-2xl p-4 sm:p-5 shadow-sm flex items-center gap-4">
              <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0 text-lg">🅿️</div>
              <div className="min-w-0">
                <h3 className="font-semibold text-gray-800 text-sm sm:text-base">Parkiran</h3>
                <p className="text-xs text-gray-400 mt-0.5">Penerangan, keamanan, akses</p>
              </div>
            </div>
            <div className="card-hover bg-white border border-gray-100 rounded-2xl p-4 sm:p-5 shadow-sm flex items-center gap-4">
              <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0 text-lg">🍽️</div>
              <div className="min-w-0">
                <h3 className="font-semibold text-gray-800 text-sm sm:text-base">Kantin</h3>
                <p className="text-xs text-gray-400 mt-0.5">Kebersihan, fasilitas makan</p>
              </div>
            </div>
            <div className="card-hover bg-white border border-gray-100 rounded-2xl p-4 sm:p-5 shadow-sm flex items-center gap-4">
              <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0 text-lg">🔬</div>
              <div className="min-w-0">
                <h3 className="font-semibold text-gray-800 text-sm sm:text-base">Laboratorium</h3>
                <p className="text-xs text-gray-400 mt-0.5">Alat, komputer, keselamatan</p>
              </div>
            </div>
            <div className="card-hover bg-white border border-gray-100 rounded-2xl p-4 sm:p-5 shadow-sm flex items-center gap-4">
              <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0 text-lg">📚</div>
              <div className="min-w-0">
                <h3 className="font-semibold text-gray-800 text-sm sm:text-base">Perpustakaan</h3>
                <p className="text-xs text-gray-400 mt-0.5">Buku, ruang baca, wifi</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-14 sm:py-20 px-4 sm:px-6 bg-white">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-4">Siap Membuat Laporan?</h2>
          <p className="text-gray-500 text-sm sm:text-base mb-6 sm:mb-8">Login sekarang dan bantu kami menjaga kualitas fasilitas kampus</p>
          <Link to="/login" className="btn-primary text-white font-semibold px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl inline-flex items-center gap-2">
            Mulai Sekarang
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
            </svg>
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-gray-400 py-6 sm:py-8 px-4 sm:px-6 text-center text-sm">
        <p className="font-semibold text-white mb-1 font-jakarta">#LAPORMERCU</p>
        <p className="text-xs sm:text-sm">Daffa Belajar Web Sistem Informasi Pengaduan Fasilitas Kampus &copy; 2026</p>
      </footer>
    </div>
  );
}

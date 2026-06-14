import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function LoginUser() {
  const [nim, setNim] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const USERS = [
    { nim: '2024001', password: 'mahasiswa123', name: 'Daffa', prodi: 'Sistem Informasi' },
    { nim: '2024002', password: 'mahasiswa123', name: 'Daffa Aulia', prodi: 'Sistem Informasi' },
  ];

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNim = nim.trim();
    if (!cleanNim || !password) {
      setErrorMsg('NIM dan password tidak boleh kosong.');
      return;
    }

    const user = USERS.find(u => u.nim === cleanNim && u.password === password);
    if (user) {
      sessionStorage.setItem('loggedUser', JSON.stringify({ role: 'user', ...user }));
      navigate('/dashboard');
    } else {
      setErrorMsg('NIM atau password salah. Silakan coba lagi.');
    }
  };

  return (
    <div className="bg-[#f3f4f6] min-h-screen flex items-center justify-center px-4 py-8 sm:py-12">
      <div className="w-full max-w-md fade-up">
        {/* Logo */}
        <div className="text-center mb-6 sm:mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-3 sm:mb-4">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
              </svg>
            </div>
            <span className="font-extrabold text-xl text-blue-700 font-jakarta">#LAPORMERCU</span>
          </Link>
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 font-jakarta">Login Mahasiswa</h1>
          <p className="text-gray-500 text-sm mt-1">Masuk menggunakan NIM dan password kamu</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8">
          {/* Error */}
          {errorMsg && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-5 flex items-center gap-2">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
              </svg>
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 sm:space-y-5">
            {/* NIM */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">NIM</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2"/>
                  </svg>
                </div>
                <input
                  id="nim"
                  type="text"
                  placeholder="Masukkan NIM kamu"
                  maxLength={12}
                  value={nim}
                  onChange={(e) => setNim(e.target.value)}
                  className="input-field w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 bg-gray-50 focus:bg-white"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                  </svg>
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Masukkan password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field w-full pl-10 pr-11 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 bg-gray-50 focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                  </svg>
                </button>
              </div>
            </div>

            {/* Tombol Login */}
            <button type="submit" className="btn-primary w-full text-white font-semibold py-3 sm:py-3.5 rounded-xl flex items-center justify-center gap-2 mt-1 sm:mt-2 cursor-pointer">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"/>
              </svg>
              Masuk
            </button>
          </form>

          {/* Info demo */}
          <div className="mt-5 bg-blue-50 border border-blue-100 rounded-xl p-3 sm:p-3.5">
            <p className="text-xs text-blue-700 font-semibold mb-1">💡 Demo Login</p>
            <p className="text-xs text-blue-600">NIM: <span className="font-mono font-bold">2024001</span> &nbsp;|&nbsp; Password: <span className="font-mono font-bold">mahasiswa123</span></p>
          </div>
        </div>

        {/* Link ke admin */}
        <div className="text-center mt-4 sm:mt-5">
          <p className="text-sm text-gray-500">
            Kamu admin?
            <Link to="/login-admin" className="text-blue-600 font-semibold hover:underline ml-1">Login sebagai Admin →</Link>
          </p>
          <Link to="/" className="text-xs text-gray-400 hover:text-gray-600 mt-2 inline-block">← Kembali ke Beranda</Link>
        </div>
      </div>
    </div>
  );
}

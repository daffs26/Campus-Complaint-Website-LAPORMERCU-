import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function LoginAdmin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const ADMINS = [
    { username: 'admin', password: 'admin123', name: 'Administrator' },
  ];

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUser = username.trim();
    if (!cleanUser || !password) {
      setErrorMsg('Username dan password tidak boleh kosong.');
      return;
    }

    const admin = ADMINS.find(a => a.username === cleanUser && a.password === password);
    if (admin) {
      sessionStorage.setItem('loggedUser', JSON.stringify({ role: 'admin', ...admin }));
      navigate('/admin');
    } else {
      setErrorMsg('Username atau password salah.');
    }
  };

  const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

  const handleQuickLogin = () => {
    const demoAdmin = ADMINS[0];
    sessionStorage.setItem('loggedUser', JSON.stringify({ role: 'admin', ...demoAdmin }));
    navigate('/admin');
  };

  return (
    <div className="admin-bg font-jakarta">
      {/* Decorative blurred circles */}
      <div className="deco w-[260px] h-[260px] top-[-40px] left-[-40px]"></div>
      <div className="deco w-[200px] h-[200px] bottom-[-40px] right-[-40px]"></div>

      <div className="admin-container">
        {/* Logo */}
        <div className="admin-logo-section">
          <Link to="/" className="admin-logo-link">
            <div className="admin-logo-icon">
              <svg width="22" height="22" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
              </svg>
            </div>
            <span className="admin-logo-text">#LAPORMERCU</span>
          </Link>
          <h1 className="admin-title">Login Administrator</h1>
          <p className="admin-subtitle">Masuk untuk mengelola laporan pengaduan</p>
        </div>

        {/* Form Card */}
        <div className="glass-card">
          {/* Error */}
          {errorMsg && (
            <div className="bg-red-500/20 border border-red-300/30 text-[#fecaca] rounded-xl p-3 flex items-center gap-2 text-xs mb-5">
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" className="flex-shrink-0">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
              </svg>
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Username */}
            <div className="admin-field">
              <label className="label-admin">Username</label>
              <div className="admin-input-wrap">
                <div className="input-icon">
                  <svg width="16" height="16" fill="none" stroke="rgba(147,197,253,1)" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                  </svg>
                </div>
                <input
                  id="username"
                  type="text"
                  placeholder="Masukkan username admin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="input-admin"
                />
              </div>
            </div>

            {/* Password */}
            <div className="admin-field">
              <label className="label-admin">Password</label>
              <div className="admin-input-wrap">
                <div className="input-icon">
                  <svg width="16" height="16" fill="none" stroke="rgba(147,197,253,1)" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                  </svg>
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Masukkan password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-admin pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="admin-eye-btn"
                >
                  <svg width="16" height="16" fill="none" stroke="rgba(147,197,253,1)" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                  </svg>
                </button>
              </div>
            </div>

            {/* Tombol */}
            <button type="submit" className="btn-admin cursor-pointer mt-4">
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"/>
              </svg>
              Masuk sebagai Admin
            </button>
          </form>

          {/* Demo info & Quick Login (Local Only) */}
          <div className="demo-box flex flex-col gap-2.5">
            <div>
              <p className="demo-label">💡 Demo Login</p>
              <p className="demo-text">
                Username: <span className="demo-mono font-bold">admin</span>
                &nbsp;|&nbsp;
                Password: <span className="demo-mono font-bold">admin123</span>
              </p>
            </div>
            {isLocal && (
              <button
                type="button"
                onClick={handleQuickLogin}
                className="w-full bg-white hover:bg-blue-50 text-blue-900 font-bold py-2.5 px-3 rounded-xl text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm active:scale-[0.98] duration-150"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                </svg>
                Masuk Instan (Demo Admin)
              </button>
            )}
          </div>
        </div>

        {/* Footer links */}
        <div className="admin-footer-links">
          <p className="admin-footer-text">
            Kamu mahasiswa?
            <Link to="/login" className="admin-footer-link">Login sebagai Mahasiswa →</Link>
          </p>
          <Link to="/" className="admin-footer-back">← Kembali ke Beranda</Link>
        </div>
      </div>
    </div>
  );
}

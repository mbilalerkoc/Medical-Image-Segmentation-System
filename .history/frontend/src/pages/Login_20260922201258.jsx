import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [sifre, setSifre] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        sifre
      });

      if (response.data.basarili) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.kullanici));

        const role = response.data.kullanici.rol;
        if (role === 'doktor' || role === 'superadmin') {
          navigate('/dashboard');
        } else if (role === 'hasta') {
          navigate('/hasta-panel');
        }
      }
    } catch (err) {
      setError(
        err.response?.data?.mesaj || 'Giriş yapılamadı. Sunucu bağlantısını kontrol edin.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    // bg-slate yerine logodaki derin mavi tonunu veren özel gradient
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden font-sans bg-[#0a1128]">
      
      {/* ARKA PLAN IŞIKLARI (Tamamen logodaki renkler) */}
      <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-cyan-500/10 rounded-full blur-[150px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[150px] pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#00bfff]/5 rounded-full blur-[120px] pointer-events-none"></div>

      {/* DİJİTAL AĞ ARKA PLANI (Logodaki network çizgilerine atıf) */}
      <div 
        className="absolute inset-0 opacity-[0.08] pointer-events-none" 
        style={{ 
          backgroundImage: 'linear-gradient(rgba(56,189,248,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,0.5) 1px, transparent 1px)', 
          backgroundSize: '40px 40px' 
        }}
      ></div>

      {/* BEYİN GÖRSELİ */}
      <div className="absolute right-[-120px] top-1/2 -translate-y-1/2 pointer-events-none select-none">
        <img src="/logo_pathovision.png" alt="" className="relative w-[650px] h-[650px] object-contain opacity-10 drop-shadow-[0_0_50px_rgba(34,211,238,0.2)]" />
      </div>
      <div className="absolute left-[-260px] bottom-[-180px] pointer-events-none select-none">
        <img src="/logo_pathovision.png" alt="" className="w-[500px] h-[500px] object-contain opacity-[0.04]" />
      </div>

      {/* ANA İÇERİK KARTI */}
      <div className="relative z-10 w-full max-w-md px-5 py-8">
        
        {/* LOGO / MARKA */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative">
            {/* Parlama efekti büyütüldü */}
            <div className="absolute inset-0 bg-cyan-400/25 rounded-full blur-3xl scale-95"></div>
            {/* Logo boyutu w-28 h-28'den w-40 h-40'a çıkarıldı */}
            <img src="/logo_pathovision.png" alt="PathoVision Logo" className="relative w-60 h-60 object-contain drop-shadow-[0_0_20px_rgba(34,211,238,0.4)]" />
          </div>
          <h1 className="mt-4 text-4xl font-black tracking-tight text-white drop-shadow-md">
            Patho<span className="text-cyan-400">Vision</span>
          </h1>
          <div className="flex items-center gap-2 mt-2">
            <span className="w-6 h-px bg-cyan-400/50"></span>
            <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-cyan-200/70">Medical AI Platform</span>
            <span className="w-6 h-px bg-cyan-400/50"></span>
          </div>
        </div>

        {/* LOGIN KUTUSU */}
        <div className="relative rounded-3xl border border-cyan-500/20 bg-[#0d1b3e]/60 backdrop-blur-xl shadow-[0_0_50px_rgba(0,0,0,0.5)] p-7 sm:p-9">
          {/* Üstteki ince neon çizgi */}
          <div className="absolute top-0 left-12 right-12 h-[2px] bg-gradient-to-r from-transparent via-cyan-400/80 to-transparent"></div>

          {/* BAŞLIK */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white tracking-wide">Oturum Aç</h2>
            <p className="mt-2 text-sm text-blue-200/60">Güvenli sisteme giriş yapmak için bilgilerinizi girin.</p>
          </div>

          {/* HATA MESAJI */}
          {error && (
            <div className="mb-6 p-4 bg-red-900/30 border border-red-500/50 rounded-xl flex items-start gap-3 shadow-[0_0_15px_rgba(239,68,68,0.15)]">
              <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm font-medium text-red-300 leading-snug">{error}</p>
            </div>
          )}

          {/* FORM */}
          <form onSubmit={handleLogin} className="space-y-6">
            
            {/* E-POSTA */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-cyan-200/70 mb-2 pl-1">E-posta Adresi</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-blue-400/70 group-focus-within:text-cyan-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 8l9 6 9-6M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="doktor@pathovision.com"
                  className="block w-full pl-12 pr-4 py-3.5 rounded-xl bg-[#060d23]/80 border border-blue-500/30 text-sm text-white placeholder-blue-300/30 outline-none transition-all duration-300 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-500/20 focus:bg-[#060d23]"
                />
              </div>
            </div>

            {/* ŞİFRE */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-cyan-200/70 mb-2 pl-1">Şifre</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-blue-400/70 group-focus-within:text-cyan-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v2h8z" />
                  </svg>
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={sifre}
                  onChange={(e) => setSifre(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-12 pr-12 py-3.5 rounded-xl bg-[#060d23]/80 border border-blue-500/30 text-sm text-white placeholder-blue-300/30 outline-none transition-all duration-300 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-500/20 focus:bg-[#060d23]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-blue-400/70 hover:text-cyan-400 transition-colors"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 3l18 18M10.6 10.6a2 2 0 102.8 2.8M9.9 4.2A10.5 10.5 0 0121 12c-1.2 2.5-3.2 4.3-5.6 5.4M6.2 6.2A10.6 10.6 0 003 12c1.8 3.8 5.2 6 9 6" /></svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6z" /><circle cx="12" cy="12" r="2.5" /></svg>
                  )}
                </button>
              </div>
            </div>

            {/* HATIRLA / ŞİFREMİ UNUTTUM */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2.5 cursor-pointer group">
                <div className="relative flex items-center justify-center">
                  <input id="remember-me" type="checkbox" className="peer w-4 h-4 appearance-none rounded border border-blue-500/50 bg-[#060d23] checked:bg-cyan-500 checked:border-cyan-500 cursor-pointer transition-colors" />
                  <svg className="absolute w-3 h-3 text-[#0a1128] pointer-events-none opacity-0 peer-checked:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-blue-200/60 group-hover:text-blue-200 transition-colors">Beni Hatırla</span>
              </label>
              <a href="/forgot-password" className="text-sm font-semibold text-cyan-400 hover:text-cyan-300 hover:underline underline-offset-4 transition-all">Şifremi Unuttum</a>
            </div>

            {/* GİRİŞ BUTONU */}
            <button
              type="submit"
              disabled={loading}
              className={`group relative w-full flex items-center justify-center gap-3 py-4 px-4 mt-4 rounded-xl text-sm font-bold tracking-wide transition-all duration-300 active:scale-[0.98] ${
                loading 
                  ? 'bg-blue-900/50 text-blue-400 cursor-not-allowed border border-blue-800/50' 
                  : 'bg-cyan-500 hover:bg-cyan-400 text-[#0a1128] shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)]'
              }`}
            >
              <span>{loading ? 'Bağlantı Kuruluyor...' : 'GİRİŞ YAP'}</span>
              {!loading && (
                <svg className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 12h14m-6-6l6 6-6 6" />
                </svg>
              )}
            </button>
          </form>

        </div>

        {/* SİSTEM DURUMU ALT BİLGİSİ */}
        <div className="flex items-center justify-center gap-2 mt-8">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-70"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.8)]"></span>
          </span>
          <span className="text-[11px] font-mono font-bold uppercase tracking-[0.2em] text-cyan-500/80 drop-shadow-sm">
            AI Core Online
          </span>
        </div>
      </div>
    </div>
  );
};

export default Login;
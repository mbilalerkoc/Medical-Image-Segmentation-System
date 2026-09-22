import React, { useState } from 'react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    console.log("Giriş yapılıyor...", email);
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 font-sans">
      
      {/* SOL PANEL: Marka ve Logo Alanı (Sadece masaüstünde görünür) */}
      <div className="hidden lg:flex w-1/2 bg-slate-900 flex-col justify-center items-center p-12 relative overflow-hidden">
        {/* Teknolojik bir hava katmak için hafif radyal parlama efekti */}
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-cyan-500 via-slate-900 to-slate-900"></div>
        
        {/* Logo */}
        <img 
          src="/logo_pathovision.png" 
          alt="PathoVision Logo" 
          className="w-72 h-72 object-contain z-10 mb-8 drop-shadow-[0_0_15px_rgba(6,182,212,0.3)]" 
        />
        
        <h1 className="text-5xl font-extrabold text-white z-10 mb-4 tracking-tight">
          Patho<span className="text-cyan-400">Vision</span>
        </h1>
        <p className="text-cyan-100/70 text-center text-lg z-10 max-w-md font-light">
          Yapay Zeka Destekli Tıbbi Görüntü Segmentasyon ve Teşhis Sistemi
        </p>
        
        {/* Alt kısımdaki dekoratif binary/dijital kod hissi veren ufak metin */}
        <div className="absolute bottom-8 text-slate-700 text-xs font-mono">
          SYSTEM_READY // U-NET_MODEL_ACTIVE // v1.0.0
        </div>
      </div>

      {/* SAĞ PANEL: Giriş Formu */}
      <div className="w-full lg:w-1/2 flex justify-center items-center p-8 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          
          {/* Mobil Cihazlar İçin Logo (Sadece mobilde görünür) */}
          <div className="flex flex-col items-center lg:hidden mb-8">
            <img src="/logo.png" alt="PathoVision Logo" className="w-24 h-24 mb-4" />
            <h2 className="text-3xl font-extrabold text-slate-900">PathoVision</h2>
          </div>

          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Sisteme Giriş</h2>
            <p className="mt-2 text-sm text-slate-500">
              Lütfen hesap bilgilerinizi girerek oturum açın.
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  E-posta Adresi
                </label>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-sm shadow-sm placeholder-slate-400
                  focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors" 
                  placeholder="doktor@pathovision.com" 
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Şifre
                </label>
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-sm shadow-sm placeholder-slate-400
                  focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors" 
                  placeholder="••••••••" 
                />
              </div>
            </div>

            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center">
                <input 
                  id="remember-me" 
                  type="checkbox" 
                  className="h-4 w-4 text-cyan-600 focus:ring-cyan-500 border-slate-300 rounded cursor-pointer" 
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-600 cursor-pointer">
                  Beni Hatırla
                </label>
              </div>
              
              <a href="/forgot-password" className="text-sm font-semibold text-cyan-600 hover:text-cyan-500 transition-colors">
                Şifremi Unuttum
              </a>
            </div>

            <button 
              type="submit" 
              className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 transition-all active:scale-[0.98]"
            >
              Giriş Yap
            </button>
            
            {/* Hasta davet linki senaryosu için bilgilendirme */}
            <p className="mt-8 text-center text-xs text-slate-500">
              Sisteme davet edildiyseniz, e-postanıza gelen şifre belirleme linkini kullanınız.
            </p>
          </form>
        </div>
      </div>
      
    </div>
  );
}

export default Login;
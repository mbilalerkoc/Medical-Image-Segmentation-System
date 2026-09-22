import React, { useState } from 'react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    console.log("Giriş yapılıyor...", email);
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 flex font-sans">

      {/* ================= SOL PANEL ================= */}
      <div className="hidden lg:flex lg:w-[52%] relative overflow-hidden bg-slate-950">

        {/* Arka plan gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(6,182,212,0.18),transparent_35%),radial-gradient(circle_at_80%_80%,rgba(14,165,233,0.12),transparent_30%)]"></div>

        {/* Grid efekti */}
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(148,163,184,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.4) 1px, transparent 1px)',
            backgroundSize: '45px 45px'
          }}
        ></div>

        {/* Dekoratif daireler */}
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full border border-cyan-400/10"></div>
        <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full border border-cyan-400/10"></div>

        <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full border border-cyan-400/10"></div>
        <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full border border-cyan-400/10"></div>

        {/* İçerik */}
        <div className="relative z-10 w-full flex flex-col justify-center items-center px-12">

          {/* Logo */}
          <div className="relative mb-8">

            {/* Glow */}
            <div className="absolute inset-0 bg-cyan-400/20 blur-3xl rounded-full scale-75"></div>

            <div className="relative w-64 h-64 flex items-center justify-center">
              <img
                src="/logo_pathovision.png"
                alt="PathoVision Logo"
                className="w-60 h-60 object-contain drop-shadow-[0_0_25px_rgba(34,211,238,0.25)]"
              />
            </div>
          </div>

          {/* Başlık */}
          <h1 className="text-5xl font-extrabold tracking-tight text-white">
            Patho<span className="text-cyan-400">Vision</span>
          </h1>

          <div className="flex items-center gap-2 mt-4">
            <span className="w-8 h-[2px] bg-cyan-400"></span>
            <span className="text-xs uppercase tracking-[0.3em] text-cyan-300/70">
              Medical AI Platform
            </span>
            <span className="w-8 h-[2px] bg-cyan-400"></span>
          </div>

          <p className="mt-6 text-center text-slate-300/80 text-base leading-7 max-w-lg">
            Yapay zeka destekli tıbbi görüntü segmentasyon
            ve teşhis sistemi
          </p>

          {/* Özellikler */}
          <div className="mt-10 flex items-center gap-3">

            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"></span>
              <span className="text-xs text-slate-300">
                AI Model Active
              </span>
            </div>

            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]"></span>
              <span className="text-xs text-slate-300">
                U-Net
              </span>
            </div>

          </div>

          {/* Alt bilgi */}
          <div className="absolute bottom-8 left-0 right-0 text-center">
            <p className="font-mono text-[10px] tracking-[0.25em] text-slate-600">
              SYSTEM_READY&nbsp;&nbsp;//&nbsp;&nbsp;U-NET_MODEL_ACTIVE&nbsp;&nbsp;//&nbsp;&nbsp;v1.0.0
            </p>
          </div>

        </div>
      </div>


      {/* ================= SAĞ PANEL ================= */}
      <div className="w-full lg:w-[48%] flex items-center justify-center px-6 py-10 sm:px-12 bg-slate-50">

        <div className="w-full max-w-md">

          {/* Mobil Logo */}
          <div className="flex flex-col items-center lg:hidden mb-10">

            <div className="relative">
              <div className="absolute inset-0 bg-cyan-400/20 blur-2xl rounded-full"></div>

              <img
                src="/logo_pathovision.png"
                alt="PathoVision Logo"
                className="relative w-28 h-28 object-contain"
              />
            </div>

            <h2 className="mt-3 text-3xl font-extrabold text-slate-900">
              Patho<span className="text-cyan-500">Vision</span>
            </h2>
          </div>


          {/* Login Card */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-[0_20px_60px_rgba(15,23,42,0.08)] p-7 sm:p-9">

            {/* Başlık */}
            <div className="mb-8">

              <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-cyan-50 border border-cyan-100 mb-5">
                <svg
                  className="w-5 h-5 text-cyan-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.8"
                    d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5m0 0l-5-5m5 5H3"
                  />
                </svg>
              </div>

              <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
                Sisteme Giriş
              </h2>

              <p className="mt-2 text-sm text-slate-500 leading-6">
                PathoVision hesabınıza giriş yapmak için
                bilgilerinizi aşağıdaki alanlara girin.
              </p>
            </div>


            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-5">

              {/* E-posta */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  E-posta Adresi
                </label>

                <div className="relative">

                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg
                      className="w-5 h-5 text-slate-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.7"
                        d="M3 8l9 6 9-6M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>

                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="
                      block w-full pl-12 pr-4 py-3.5
                      bg-slate-50
                      border border-slate-200
                      rounded-xl
                      text-sm text-slate-900
                      placeholder-slate-400
                      outline-none
                      transition-all duration-200
                      focus:bg-white
                      focus:border-cyan-500
                      focus:ring-4
                      focus:ring-cyan-500/10
                    "
                    placeholder="doktor@pathovision.com"
                  />

                </div>
              </div>


              {/* Şifre */}
              <div>
                <div className="flex items-center justify-between mb-2">

                  <label className="block text-sm font-semibold text-slate-700">
                    Şifre
                  </label>

                </div>

                <div className="relative">

                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg
                      className="w-5 h-5 text-slate-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.7"
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v2h8z"
                      />
                    </svg>
                  </div>

                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="
                      block w-full pl-12 pr-12 py-3.5
                      bg-slate-50
                      border border-slate-200
                      rounded-xl
                      text-sm text-slate-900
                      placeholder-slate-400
                      outline-none
                      transition-all duration-200
                      focus:bg-white
                      focus:border-cyan-500
                      focus:ring-4
                      focus:ring-cyan-500/10
                    "
                    placeholder="••••••••"
                  />

                  {/* Şifre göster/gizle */}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-cyan-600 transition-colors"
                  >
                    {showPassword ? (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="1.7"
                          d="M3 3l18 18M10.6 10.6a2 2 0 102.8 2.8M9.9 4.2A10.5 10.5 0 0121 12c-1.2 2.5-3.2 4.3-5.6 5.4M6.2 6.2A10.6 10.6 0 003 12c1.8 3.8 5.2 6 9 6"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="1.7"
                          d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6z"
                        />
                        <circle
                          cx="12"
                          cy="12"
                          r="2.5"
                        />
                      </svg>
                    )}
                  </button>

                </div>
              </div>


              {/* Hatırla / Şifremi unuttum */}
              <div className="flex items-center justify-between pt-1">

                <label className="flex items-center gap-2 cursor-pointer">

                  <input
                    id="remember-me"
                    type="checkbox"
                    className="
                      w-4 h-4
                      rounded
                      border-slate-300
                      text-cyan-600
                      focus:ring-cyan-500
                      cursor-pointer
                    "
                  />

                  <span className="text-sm text-slate-600">
                    Beni Hatırla
                  </span>

                </label>

                <a
                  href="/forgot-password"
                  className="text-sm font-semibold text-cyan-600 hover:text-cyan-700 transition-colors"
                >
                  Şifremi Unuttum
                </a>

              </div>


              {/* Giriş butonu */}
              <button
                type="submit"
                className="
                  group
                  relative
                  w-full
                  flex
                  justify-center
                  items-center
                  py-3.5
                  px-4
                  mt-2
                  rounded-xl
                  text-sm
                  font-bold
                  text-white
                  bg-slate-900
                  hover:bg-cyan-600
                  shadow-lg
                  shadow-slate-900/10
                  hover:shadow-cyan-600/20
                  transition-all
                  duration-300
                  active:scale-[0.98]
                  overflow-hidden
                "
              >

                <span className="relative z-10 flex items-center gap-2">
                  Giriş Yap

                  <svg
                    className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 12h14m-6-6l6 6-6 6"
                    />
                  </svg>
                </span>

              </button>

            </form>


            {/* Alt bilgilendirme */}
            <div className="mt-7 pt-6 border-t border-slate-100">

              <div className="flex gap-3 items-start">

                <div className="flex-shrink-0 mt-0.5">
                  <svg
                    className="w-4 h-4 text-cyan-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.8"
                      d="M13 16h-1v-4h-1m1-4h.01M12 21a9 9 0 100-18 9 9 0 000 18z"
                    />
                  </svg>
                </div>

                <p className="text-xs text-slate-500 leading-5">
                  Sisteme davet edildiyseniz, e-posta adresinize
                  gönderilen şifre belirleme bağlantısını kullanarak
                  hesabınızı oluşturabilirsiniz.
                </p>

              </div>

            </div>

          </div>


          {/* Footer */}
          <p className="text-center text-xs text-slate-400 mt-6">
            © 2026 PathoVision · Medical AI Platform
          </p>

        </div>
      </div>

    </div>
  );
};

export default Login;
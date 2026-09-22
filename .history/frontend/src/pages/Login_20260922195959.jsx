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
    <div className="min-h-screen w-full bg-slate-950 flex items-center justify-center relative overflow-hidden font-sans">

      {/* ========================================================= */}
      {/* ARKA PLAN */}
      {/* ========================================================= */}

      {/* Ana cyan ışık */}
      <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[140px]"></div>

      {/* Sağ taraftaki mavi ışık */}
      <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[140px]"></div>

      {/* Ortadaki hafif ışık */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-400/5 rounded-full blur-[120px]"></div>


      {/* ========================================================= */}
      {/* GRID ARKA PLAN */}
      {/* ========================================================= */}

      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(148,163,184,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.5) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }}
      ></div>


      {/* ========================================================= */}
      {/* BEYİN GÖRSELİ */}
      {/* ========================================================= */}

      <div className="absolute right-[-80px] top-1/2 -translate-y-1/2 pointer-events-none select-none">

        <div className="absolute inset-0 bg-cyan-400/20 blur-[100px] rounded-full"></div>

        <img
          src="/pathovision_logo.png"
          alt=""
          className="
            relative
            w-[520px]
            h-[520px]
            object-contain
            opacity-[0.10]
            grayscale
            blur-[1px]
          "
        />

      </div>


      {/* Sol tarafta da çok hafif görsel */}
      <div className="absolute left-[-260px] bottom-[-180px] pointer-events-none select-none">

        <img
          src="/logo.png"
          alt=""
          className="
            w-[500px]
            h-[500px]
            object-contain
            opacity-[0.035]
            grayscale
          "
        />

      </div>


      {/* ========================================================= */}
      {/* DEKORATİF NOKTALAR */}
      {/* ========================================================= */}

      <div className="absolute top-[15%] left-[18%] w-2 h-2 rounded-full bg-cyan-400/50 shadow-[0_0_15px_rgba(34,211,238,0.8)]"></div>

      <div className="absolute top-[28%] right-[18%] w-1.5 h-1.5 rounded-full bg-cyan-300/40"></div>

      <div className="absolute bottom-[20%] left-[25%] w-1.5 h-1.5 rounded-full bg-blue-400/40"></div>

      <div className="absolute bottom-[15%] right-[28%] w-2 h-2 rounded-full bg-cyan-400/40"></div>


      {/* ========================================================= */}
      {/* ANA İÇERİK */}
      {/* ========================================================= */}

      <div className="relative z-10 w-full max-w-md px-5 py-8">

        {/* ======================================================= */}
        {/* LOGO / MARKA */}
        {/* ======================================================= */}

        <div className="flex flex-col items-center mb-7">

          <div className="relative">

            {/* Logo glow */}
            <div className="absolute inset-0 bg-cyan-400/20 rounded-full blur-3xl scale-75"></div>

            <img
              src="/pathovision_logo.png"
              alt="PathoVision Logo"
              className="
                relative
                w-24
                h-24
                object-contain
                drop-shadow-[0_0_25px_rgba(34,211,238,0.25)]
              "
            />

          </div>

          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-white">
            Patho<span className="text-cyan-400">Vision</span>
          </h1>

          <div className="flex items-center gap-2 mt-2">

            <span className="w-5 h-px bg-cyan-400/60"></span>

            <span className="text-[10px] uppercase tracking-[0.28em] text-cyan-300/60">
              Medical AI Platform
            </span>

            <span className="w-5 h-px bg-cyan-400/60"></span>

          </div>

        </div>


        {/* ======================================================= */}
        {/* LOGIN CARD */}
        {/* ======================================================= */}

        <div
          className="
            relative
            rounded-3xl
            border
            border-white/10
            bg-slate-900/70
            backdrop-blur-2xl
            shadow-[0_25px_80px_rgba(0,0,0,0.45)]
            p-7
            sm:p-8
          "
        >

          {/* Kart üstündeki cyan çizgi */}
          <div className="absolute top-0 left-10 right-10 h-px bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent"></div>


          {/* ===================================================== */}
          {/* BAŞLIK */}
          {/* ===================================================== */}

          <div className="text-center mb-7">

            <div
              className="
                mx-auto
                w-11
                h-11
                rounded-xl
                flex
                items-center
                justify-center
                bg-cyan-400/10
                border
                border-cyan-400/20
                mb-4
              "
            >

              <svg
                className="w-5 h-5 text-cyan-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.7"
                  d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5m0 0l-5-5m5 5H3"
                />
              </svg>

            </div>

            <h2 className="text-2xl font-bold text-white">
              Sisteme Giriş
            </h2>

            <p className="mt-2 text-sm text-slate-400 leading-6">
              PathoVision hesabınıza giriş yapmak için
              bilgilerinizi girin.
            </p>

          </div>


          {/* ===================================================== */}
          {/* FORM */}
          {/* ===================================================== */}

          <form
            onSubmit={handleLogin}
            className="space-y-5"
          >

            {/* E-POSTA */}
            <div>

              <label className="block text-sm font-medium text-slate-300 mb-2">
                E-posta Adresi
              </label>

              <div className="relative">

                {/* Mail icon */}
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">

                  <svg
                    className="w-5 h-5 text-slate-500"
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
                  placeholder="doktor@pathovision.com"
                  className="
                    block
                    w-full
                    pl-12
                    pr-4
                    py-3.5
                    rounded-xl
                    bg-slate-950/60
                    border
                    border-slate-700/70
                    text-sm
                    text-white
                    placeholder-slate-600
                    outline-none
                    transition-all
                    duration-200
                    focus:border-cyan-500
                    focus:ring-4
                    focus:ring-cyan-500/10
                    focus:bg-slate-950/80
                  "
                />

              </div>

            </div>


            {/* ŞİFRE */}
            <div>

              <label className="block text-sm font-medium text-slate-300 mb-2">
                Şifre
              </label>

              <div className="relative">

                {/* Lock icon */}
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">

                  <svg
                    className="w-5 h-5 text-slate-500"
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
                  placeholder="••••••••"
                  className="
                    block
                    w-full
                    pl-12
                    pr-12
                    py-3.5
                    rounded-xl
                    bg-slate-950/60
                    border
                    border-slate-700/70
                    text-sm
                    text-white
                    placeholder-slate-600
                    outline-none
                    transition-all
                    duration-200
                    focus:border-cyan-500
                    focus:ring-4
                    focus:ring-cyan-500/10
                    focus:bg-slate-950/80
                  "
                />


                {/* Şifre göster/gizle */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="
                    absolute
                    inset-y-0
                    right-0
                    pr-4
                    flex
                    items-center
                    text-slate-500
                    hover:text-cyan-400
                    transition-colors
                  "
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


            {/* =================================================== */}
            {/* HATIRLA / ŞİFRE */}
            {/* =================================================== */}

            <div className="flex items-center justify-between pt-1">

              <label className="flex items-center gap-2 cursor-pointer">

                <input
                  id="remember-me"
                  type="checkbox"
                  className="
                    w-4
                    h-4
                    rounded
                    border-slate-600
                    bg-slate-950
                    text-cyan-500
                    focus:ring-cyan-500
                    focus:ring-offset-slate-900
                    cursor-pointer
                  "
                />

                <span className="text-sm text-slate-400">
                  Beni Hatırla
                </span>

              </label>


              <a
                href="/forgot-password"
                className="
                  text-sm
                  font-medium
                  text-cyan-400
                  hover:text-cyan-300
                  transition-colors
                "
              >
                Şifremi Unuttum
              </a>

            </div>


            {/* =================================================== */}
            {/* GİRİŞ BUTONU */}
            {/* =================================================== */}

            <button
              type="submit"
              className="
                group
                relative
                w-full
                flex
                items-center
                justify-center
                gap-2
                py-3.5
                px-4
                mt-2
                rounded-xl
                bg-cyan-500
                hover:bg-cyan-400
                text-slate-950
                text-sm
                font-bold
                shadow-[0_8px_30px_rgba(6,182,212,0.2)]
                hover:shadow-[0_8px_35px_rgba(6,182,212,0.35)]
                transition-all
                duration-300
                active:scale-[0.98]
              "
            >

              <span>
                Giriş Yap
              </span>

              <svg
                className="
                  w-4
                  h-4
                  group-hover:translate-x-1
                  transition-transform
                "
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

            </button>

          </form>


          {/* ===================================================== */}
          {/* ALT BİLGİ */}
          {/* ===================================================== */}

          <div className="mt-7 pt-5 border-t border-white/5">

            <div className="flex items-start gap-3">

              <div className="flex-shrink-0 mt-0.5">

                <svg
                  className="w-4 h-4 text-cyan-400/70"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.7"
                    d="M13 16h-1v-4h-1m1-4h.01M12 21a9 9 0 100-18 9 9 0 000 18z"
                  />
                </svg>

              </div>

              <p className="text-xs text-slate-500 leading-5">
                Sisteme davet edildiyseniz, e-posta adresinize
                gönderilen şifre belirleme bağlantısını kullanınız.
              </p>

            </div>

          </div>

        </div>


        {/* ======================================================= */}
        {/* SYSTEM STATUS */}
        {/* ======================================================= */}

        <div className="flex items-center justify-center gap-2 mt-5">

          <span className="relative flex h-2 w-2">

            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-50"></span>

            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>

          </span>

          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-slate-600">
            System Ready · U-Net Active · v1.0.0
          </span>

        </div>


        {/* Footer */}
        <p className="text-center text-[10px] text-slate-700 mt-4">
          © 2026 PathoVision · Medical AI Platform
        </p>

      </div>

    </div>
  );
};

export default Login;
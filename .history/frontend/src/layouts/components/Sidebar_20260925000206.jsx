import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // =====================================================
  // KULLANICI
  // =====================================================

  let user = {};

  try {
    const userStr = localStorage.getItem("user");

    if (userStr) {
      user = JSON.parse(userStr);
    }
  } catch (error) {
    console.error("Kullanıcı bilgisi okunamadı:", error);
  }

  const fullName =
    `${user.ad || ""} ${user.soyad || ""}`.trim() ||
    "Doktor";

  const title = user.unvan || "Dr.";

  const initials = `${user.ad?.[0] || ""}${
    user.soyad?.[0] || ""
  }`.toUpperCase();

  // =====================================================
  // MENÜ
  // =====================================================

  const menuItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: (
        <svg
          width="21"
          height="21"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.8"
            d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
          />
        </svg>
      ),
    },

    {
      name: "Yeni Analiz",
      path: "/analyze",
      icon: (
        <svg
          width="21"
          height="21"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.8"
            d="M12 4v16m8-8H4"
          />
        </svg>
      ),
    },

    {
      name: "Hastalarım",
      path: "/patients",
      icon: (
        <svg
          width="21"
          height="21"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.8"
            d="M17 20h5v-2a4 4 0 00-5-4M9 20H4v-2a4 4 0 015-4m6-5a3 3 0 11-6 0 3 3 0 016 0zm6 1a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      ),
    },

    {
      name: "Ayarlar",
      path: "/settings",
      icon: (
        <svg
          width="21"
          height="21"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.8"
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.8"
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      ),
    },
  ];

  // =====================================================
  // ACTIVE MENU
  // =====================================================

  const isMenuActive = (path) => {
    if (path === "/dashboard") {
      return location.pathname === "/dashboard";
    }

    if (path === "/patients") {
      return location.pathname.startsWith("/patients");
    }

    if (path === "/analyze") {
      return location.pathname === "/analyze";
    }

    return location.pathname.startsWith(path);
  };

  // =====================================================
  // ÇIKIŞ
  // =====================================================

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login", {
      replace: true,
    });
  };

  return (
    <aside className="w-64 h-full min-h-screen bg-slate-950 text-white flex flex-col border-r border-slate-800 shadow-xl">

      {/* ================================================= */}
      {/* LOGO */}
      {/* ================================================= */}

      <div className="px-5 py-6 border-b border-slate-800">
  <div className="flex items-center gap-3">

    <div className="w-12 h-12 flex items-center justify-center">
      <img
        src="/logo.png"
        alt="PathoVision Logo"
        className="w-full h-full object-contain"
      />
    </div>

    <div>
      <h1 className="text-lg font-bold tracking-tight text-white">
        PathoVision
      </h1>

      <p className="text-[10px] uppercase tracking-[0.18em] text-cyan-400 font-semibold">
        AI Medical Imaging
      </p>
    </div>

  </div>
</div>

      {/* ================================================= */}
      {/* MENÜ */}
      {/* ================================================= */}

      <nav className="flex-1 px-3 py-6">

        <p className="px-3 mb-3 text-[10px] font-bold tracking-[0.18em] uppercase text-slate-500">
          Menü
        </p>

        <ul className="space-y-1.5">

          {menuItems.map((item) => {
            const active =
              isMenuActive(item.path);

            return (
              <li key={item.path}>

                <button
                  type="button"
                  onClick={() =>
                    navigate(item.path)
                  }
                  className={`
                    relative
                    w-full
                    flex
                    items-center
                    gap-3
                    px-3
                    py-3
                    rounded-xl
                    text-sm
                    font-medium
                    text-left
                    transition-all
                    duration-200

                    ${
                      active
                        ? "bg-cyan-500/10 text-cyan-300"
                        : "text-slate-400 hover:text-white hover:bg-slate-800/70"
                    }
                  `}
                >

                  {/* Aktif çizgi */}

                  {active && (
                    <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-cyan-400"></span>
                  )}

                  {/* İkon */}

                  <span
                    className={`
                      flex
                      items-center
                      justify-center
                      w-9
                      h-9
                      rounded-lg
                      transition-colors

                      ${
                        active
                          ? "bg-cyan-400/10 text-cyan-400"
                          : "bg-slate-900 text-slate-500 group-hover:text-white"
                      }
                    `}
                  >
                    {item.icon}
                  </span>

                  <span>
                    {item.name}
                  </span>

                  {/* Aktif nokta */}

                  {active && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]"></span>
                  )}

                </button>

              </li>
            );
          })}

        </ul>
      </nav>

      {/* ================================================= */}
      {/* ALT KISIM */}
      {/* ================================================= */}

      <div className="px-3 pb-4">

        {/* DOKTOR */}

        <div className="p-3 mb-2 rounded-xl border border-slate-800 bg-slate-900/70">

          <div className="flex items-center gap-3">

            {/* AVATAR */}

            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              {initials || "DR"}
            </div>

            {/* BİLGİ */}

            <div className="min-w-0 flex-1">

              <p className="text-sm font-semibold text-slate-200 truncate">
                {title} {fullName}
              </p>

              <p className="text-[11px] text-slate-500 truncate">
                {user.email || "Doktor hesabı"}
              </p>

            </div>

          </div>
        </div>

        {/* ÇIKIŞ */}

        <button
          type="button"
          onClick={handleLogout}
          className="
            w-full
            flex
            items-center
            gap-3
            px-3
            py-2.5
            rounded-xl
            text-sm
            font-medium
            text-slate-400
            hover:text-red-400
            hover:bg-red-500/10
            transition-all
            duration-200
          "
        >

          <svg
            width="19"
            height="19"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.8"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>

          Çıkış Yap
        </button>

        {/* VERSION */}

        <div className="pt-3 text-center">
          <span className="text-[9px] uppercase tracking-[0.15em] text-slate-700">
            PathoVision v1.0
          </span>
        </div>

      </div>

    </aside>
  );
};

export default Sidebar;
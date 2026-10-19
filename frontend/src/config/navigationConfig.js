const navigationConfig = {
  doktor: [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: "dashboard",
    },
    {
      name: "Yeni Analiz",
      path: "/analyze",
      icon: "analysis",
    },
    {
      name: "Hastalarım",
      path: "/patients",
      icon: "patients",
    },
    {
      name: "Randevularım",
      path: "/appointments",
      icon: "appointments",
    },
    {
      name: "Ayarlar",
      path: "/settings",
      icon: "settings",
    },
  ],

  hasta: [
    {
      name: "Dashboard",
      path: "/patient/dashboard",
      icon: "dashboard",
    },
    {
      name: "Analizlerim",
      path: "/patient/analyses",
      icon: "analysis",
    },
    {
      name: "Randevularım",
      path: "/patient/appointments",
      icon: "appointments",
    },
    {
      name: "Raporlarım",
      path: "/patient/reports",
      icon: "reports",
    },
    {
      name: "Ayarlar",
      path: "/patient/settings",
      icon: "settings",
    },
  ],

  superadmin: [
    {
      name: "Dashboard",
      path: "/admin/dashboard",
      icon: "dashboard",
    },
    {
      name: "Kullanıcılar",
      path: "/admin/users",
      icon: "users",
    },
    {
      name: "Doktorlar",
      path: "/admin/doctors",
      icon: "doctors",
    },
    {
      name: "Hastalar",
      path: "/admin/patients",
      icon: "patients",
    },
    {
      name: "Klinikler",
      path: "/admin/clinics",
      icon: "clinics",
    },
    {
      name: "Ayarlar",
      path: "/admin/settings",
      icon: "settings",
    },
  ],
};

export default navigationConfig;
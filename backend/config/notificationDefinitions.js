const formatDateTime = (value) => {
  const date = new Date(value);

  return date.toLocaleString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const notificationDefinitions = {
  appointment_created: {
    seviye: "info",
    konu: "Yeni Randevunuz Oluşturuldu",
    mesaj: ({ tarihSaat }) =>
      `${formatDateTime(tarihSaat)} için yeni randevunuz oluşturuldu.`,
  },

  appointment_approved: {
    seviye: "success",
    konu: "Randevunuz Onaylandı",
    mesaj: ({ tarihSaat }) =>
      `${formatDateTime(tarihSaat)} tarihindeki randevunuz onaylandı.`,
  },

  appointment_cancelled: {
    seviye: "warning",
    konu: "Randevunuz İptal Edildi",
    mesaj: ({ tarihSaat }) =>
      `${formatDateTime(tarihSaat)} tarihindeki randevunuz iptal edildi.`,
  },

  appointment_completed: {
    seviye: "success",
    konu: "Randevunuz Tamamlandı",
    mesaj: ({ tarihSaat }) =>
      `${formatDateTime(tarihSaat)} tarihindeki randevunuz tamamlandı.`,
  },

  report_created: {
    seviye: "success",
    konu: "Yeni Raporunuz Hazır",
    mesaj: () => "Doktorunuz yeni analiz raporunuzu oluşturdu.",
  },

  password_changed: {
    seviye: "info",
    konu: "Şifreniz Güncellendi",
    mesaj: () => "Hesap şifreniz başarıyla güncellendi.",
  },
  analysis_completed: {
    seviye: "success",
    konu: "Analiz Tamamlandı",
    mesaj: ({ analizId }) =>
      analizId
        ? `#${analizId} numaralı analiz başarıyla tamamlandı.`
        : "Yapay zeka analizi başarıyla tamamlandı.",
  },

  analysis_failed: {
    seviye: "danger",
    konu: "Analiz Başarısız",
    mesaj: ({ analizId }) =>
      analizId
        ? `#${analizId} numaralı analiz tamamlanamadı.`
        : "Yapay zeka analizi sırasında bir hata oluştu.",
  },

  appointment_reminder: {
    seviye: "info",
    konu: "Yaklaşan Randevu",
    mesaj: ({ hastaAdi, tarihSaat }) => {
      const tarih = formatDateTime(tarihSaat);

      if (hastaAdi) {
        return `${hastaAdi} ile ${tarih} tarihinde randevunuz bulunuyor.`;
      }

      return `${tarih} tarihinde yaklaşan bir randevunuz bulunuyor.`;
    },
  },

  patient_assigned: {
    seviye: "info",
    konu: "Yeni Hasta Atandı",
    mesaj: ({ hastaAdi }) =>
      hastaAdi
        ? `${hastaAdi} hasta listenize eklendi.`
        : "Hasta listenize yeni bir hasta eklendi.",
  },

  patient_account_activated: {
    seviye: "success",
    konu: "Hasta Hesabı Aktifleştirildi",
    mesaj: ({ hastaAdi }) =>
      hastaAdi
        ? `${hastaAdi} PathoVision hesabını aktifleştirdi.`
        : "Hastalarınızdan biri PathoVision hesabını aktifleştirdi.",
  },

  password_changed: {
    seviye: "info",
    konu: "Şifreniz Güncellendi",
    mesaj: () => "Hesap şifreniz başarıyla güncellendi.",
  },
};

module.exports = notificationDefinitions;

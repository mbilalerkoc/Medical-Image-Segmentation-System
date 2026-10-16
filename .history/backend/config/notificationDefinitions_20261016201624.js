const notificationDefinitions = {
    appointment_created: {
        seviye: "info",
        konu: "Yeni Randevu",
        mesaj: ({ hastaAdi, tarih, saat }) =>
            `${hastaAdi}, ${tarih} ${saat} için yeni bir randevu oluşturdu.`,
    },

    appointment_approved: {
        seviye: "success",
        konu: "Randevunuz Onaylandı",
        mesaj: ({ tarih, saat }) =>
            `${tarih} ${saat} tarihindeki randevunuz doktorunuz tarafından onaylandı.`,
    },

    appointment_cancelled: {
        seviye: "warning",
        konu: "Randevu İptal Edildi",
        mesaj: ({ tarih, saat }) =>
            `${tarih} ${saat} tarihindeki randevu iptal edildi.`,
    },

    appointment_completed: {
        seviye: "success",
        konu: "Randevu Tamamlandı",
        mesaj: ({ tarih, saat }) =>
            `${tarih} ${saat} tarihindeki randevunuz tamamlandı.`,
    },

    report_created: {
        seviye: "success",
        konu: "Yeni Raporunuz Hazır",
        mesaj: () =>
            "Doktorunuz yeni analiz raporunuzu oluşturdu.",
    },

    password_changed: {
        seviye: "info",
        konu: "Şifreniz Güncellendi",
        mesaj: () =>
            "Hesap şifreniz başarıyla güncellendi.",
    },
};

module.exports = notificationDefinitions;
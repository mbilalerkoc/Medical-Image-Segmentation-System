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
};

module.exports = notificationDefinitions;
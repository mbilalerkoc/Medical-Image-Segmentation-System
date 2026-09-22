const Report = require('../models/Report');
const Patient = require('../models/Patient');

exports.createReport = async (req, res) => {
    try {
        const { tc_kimlik, analiz_id, doktor_notu } = req.body;
        const doktor_id = req.user.id; // Giriş yapan doktorun ID'si token'dan gelir

        // TC Kimlik üzerinden hastanın veritabanındaki gerçek ID'sini buluyoruz
        const hasta = await Patient.findOne({ where: { tc_kimlik } });
        if (!hasta) {
            return res.status(404).json({ basarili: false, mesaj: 'Hasta bulunamadı.' });
        }

        // Raporu tabloya kaydediyoruz
        const yeniRapor = await Report.create({
            analiz_id: analiz_id,
            hasta_id: hasta.id,
            doktor_id: doktor_id,
            doktor_notu: doktor_notu
        });

        res.status(201).json({ 
            basarili: true, 
            mesaj: 'Rapor başarıyla oluşturuldu.', 
            rapor: yeniRapor 
        });

    } catch (error) {
        console.error("Rapor Kayıt Hatası:", error);
        res.status(500).json({ basarili: false, mesaj: 'Sunucu hatası', hata: error.message });
    }
};
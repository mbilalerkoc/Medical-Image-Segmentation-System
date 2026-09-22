const Report = require('../models/Report');
const Patient = require('../models/Patient');

exports.createReport = async (req, res) => {
    try {
        const { tc_kimlik, analiz_id, doktor_id, pdf_yolu } = req.body;

        if (!doktor_id || !analiz_id || !tc_kimlik) {
            return res.status(400).json({ basarili: false, mesaj: 'Zorunlu alanlar eksik.' });
        }

        const hasta = await Patient.findOne({ where: { tc_kimlik } });
        if (!hasta) {
            return res.status(404).json({ basarili: false, mesaj: 'Hasta bulunamadı.' });
        }

        const yeniRapor = await Report.create({
            analiz_id,
            hasta_id: hasta.id,
            doktor_id,
            pdf_yolu: pdf_yolu || 'PDF-App-Generated'
        });

        res.status(201).json({ 
            basarili: true, 
            mesaj: 'Rapor kaydı veritabanına işlendi.', 
            rapor: yeniRapor 
        });

    } catch (error) {
        console.error("Rapor Kayıt Hatası:", error);
        res.status(500).json({ basarili: false, mesaj: 'Sunucu hatası', hata: error.message });
    }
};
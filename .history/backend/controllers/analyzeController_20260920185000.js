const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const Analysis = require('../models/Analysis');
const AnalysisSlice = require('../models/AnalysisSlice');

exports.predictAndSave = async (req, res) => {
    try {
        const modelAdi = req.params.model_adi; // unet veya unet_plus
        const file = req.file; // multer sayesinde geliyor
        const { hasta_id, organ, sira_no, klinik_id } = req.body;

        // 1. Temel Doğrulamalar
        if (!file) {
            return res.status(400).json({ basarili: false, mesaj: 'Lütfen bir resim yükleyin.' });
        }
        if (!hasta_id || !organ || !klinik_id) {
            return res.status(400).json({ basarili: false, mesaj: 'Hasta ID, organ ve klinik_id zorunludur.' });
        }

        // 2. Dinamik Python URL'si (ör: http://localhost:8000/predict/beyin_unet)
        const pythonUrl = `http://localhost:8000/predict/${organ}_${modelAdi}`;
        console.log("🔍 Python'a İstek Atılan Adres:", pythonUrl);

        // 3. Python Servisine İstek Hazırlığı (FormData)
        const formData = new FormData();
        formData.append('dosya', fs.createReadStream(file.path));

        // 4. FastAPI'ye İstek At
        const response = await axios.post(pythonUrl, formData, {
            headers: { ...formData.getHeaders() }
        });

        const aiResult = response.data; // Python'dan dönen JSON

        // 5. PostgreSQL Kayıt İşlemleri
        const analysis = await Analysis.create({
            hasta_id: hasta_id,
            doktor_id: req.user.id,
            klinik_id: klinik_id,
            organ: organ,
            model: modelAdi, // Veritabanı kuralına uygun 'unet' / 'unet_plus'
            durum: 'tamamlandi'
        });

        const slice = await AnalysisSlice.create({
            analiz_id: analysis.id,
            goruntu_yolu: file.filename,
            maske_yolu: aiResult.mask_base64 || aiResult.mask_path || '',
            patoloji_yuzdesi: aiResult.tumor_percentage || 0,
            dice_skoru: aiResult.dice_score || null,
            iou_skoru: aiResult.iou_score || null,
            sira_no: sira_no || 1
        });

        // 6. Başarılı Sonuç Dön
        res.status(200).json({
            basarili: true,
            mesaj: 'Analiz tamamlandı ve kaydedildi.',
            analiz_id: analysis.id,
            sonuclar: aiResult
        });

    } catch (error) {
        console.log("❌ Detaylı Hata:", error.response?.data || error.message);
        res.status(500).json({ 
            basarili: false, 
            mesaj: 'Analiz işlemi sırasında hata oluştu.', 
            hata: error.response?.data || error.message 
        });
    }
};
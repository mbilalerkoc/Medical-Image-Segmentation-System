// controllers/analyzeController.js
const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const Analysis = require('../models/Analysis');
const AnalysisSlice = require('../models/AnalysisSlice');

// @desc    Resim yükle, Python'dan analiz iste ve kaydet
// @route   POST /api/analyze/predict/:model_adi
exports.predictAndSave = async (req, res) => {
    try {
        const modelAdi = req.params.model_adi; // unet veya unet_plus
        const file = req.file; // multer sayesinde geliyor
        const { hasta_id, organ, sira_no } = req.body; // Frontend'den gönderilecek bilgiler

        // 1. Temel Doğrulamalar
        if (!file) {
            return res.status(400).json({ basarili: false, mesaj: 'Lütfen bir resim yükleyin.' });
        }
        if (!hasta_id || !organ) {
            return res.status(400).json({ basarili: false, mesaj: 'Hasta ID ve organ bilgisi zorunludur.' });
        }

        // 2. Python Servisine İstek Hazırlığı (FormData)
        const formData = new FormData();
        formData.append('dosya', fs.createReadStream(file.path));

        // 3. FastAPI'ye İstek At (Python'un portunun 8000 olduğunu varsayıyoruz)
        const pythonUrl = `http://localhost:8000/predict/${modelAdi}`;
        
        const response = await axios.post(pythonUrl, formData, {
            headers: { ...formData.getHeaders() }
        });

        const aiResult = response.data; // Python'dan dönen JSON (mask_base64, dice vs.)

        // 4. PostgreSQL Kayıt İşlemleri
        // a) Önce ana analiz kaydını oluştur
        const analysis = await Analysis.create({
            hasta_id: hasta_id,
            doktor_id: req.user.id, // Bu id'yi protect middleware'i (JWT) sağlıyor
            organ: organ,
            model: modelAdi,
            durum: 'tamamlandi'
        });

        // b) Sonra analiz kesitini (Slice) kaydet
        const slice = await AnalysisSlice.create({
            analiz_id: analysis.id,
            goruntu_yolu: file.filename,
            maske_yolu: aiResult.mask_base64, // Base64 veya dosya yolu
            patoloji_yuzdesi: aiResult.tumor_percentage || 0,
            dice_skoru: aiResult.dice_score || null,
            iou_skoru: aiResult.iou_score || null,
            sira_no: sira_no || 1
        });

        // 5. Başarılı Sonuç Dön
        res.status(200).json({
            basarili: true,
            mesaj: 'Analiz tamamlandı ve kaydedildi.',
            analiz_id: analysis.id,
            sonuclar: aiResult
        });

    } catch (error) {
        console.error('Analiz Hatası:', error);
        res.status(500).json({ 
            basarili: false, 
            mesaj: 'Analiz işlemi sırasında hata oluştu.', 
            hata: error.message 
        });
    }
};
const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const Analysis = require('../models/Analysis');
const AnalysisSlice = require('../models/AnalysisSlice');
const Patient = require('../models/Patient'); // YENİ: Doğrudan Patient modelini import ediyoruz

exports.predictAndSave = async (req, res) => {
    try {
        const modelAdi = req.params.model_adi; // unet veya unet_plus
        const file = req.file; // multer sayesinde geliyor
        
        // Frontend'den gelen veriler
        const { tc_kimlik, organ, sira_no, klinik_id } = req.body;

        // 1. Temel Doğrulamalar
        if (!file) {
            return res.status(400).json({ basarili: false, mesaj: 'Lütfen bir resim yükleyin.' });
        }
        if (!tc_kimlik || !organ || !klinik_id) {
            return res.status(400).json({ basarili: false, mesaj: 'Hasta TC, organ ve klinik_id zorunludur.' });
        }

        // 2. TC Kimlik ile Hastayı Doğrudan 'Patient' Tablosundan Bulma
        const hasta = await Patient.findOne({ 
            where: { tc_kimlik: tc_kimlik } 
        });

        if (!hasta) {
            return res.status(404).json({ 
                basarili: false, 
                mesaj: `Sistemde ${tc_kimlik} TC numarasına sahip bir hasta kaydı bulunamadı.` 
            });
        }

        // DİKKAT: Artık veritabanındaki (patients tablosundaki) o gerçek ID'yi (Örn: 1) alıyoruz!
        const gercek_hasta_id = hasta.id;

        // 3. Dinamik Python URL'si (ör: http://localhost:8000/predict/beyin_unet)
        const pythonUrl = `http://localhost:8000/predict/${organ}_${modelAdi}`;
        console.log("🔍 Python'a İstek Atılan Adres:", pythonUrl);

        // 4. Python Servisine İstek Hazırlığı (FormData)
        const formData = new FormData();
        formData.append('dosya', fs.createReadStream(file.path));

        // 5. FastAPI'ye İstek At
        const response = await axios.post(pythonUrl, formData, {
            headers: { ...formData.getHeaders() }
        });

        const aiResult = response.data; // Python'dan dönen güncel JSON

        // 6. PostgreSQL Kayıt İşlemleri (Ana Tablo)
        const analysis = await Analysis.create({
            hasta_id: gercek_hasta_id, // Hatayı çözen kısım: Doğru ID'yi veriyoruz
            doktor_id: req.user.id,
            klinik_id: klinik_id,
            organ: organ,
            model: modelAdi,
            durum: 'tamamlandi'
        });

        // 7. Kesit (Slice) Tablosuna Yeni Metriklerle Kayıt
        const slice = await AnalysisSlice.create({
            analiz_id: analysis.id,
            goruntu_yolu: file.filename,
            maske_yolu: aiResult.maske_base64 || '',
            patoloji_yuzdesi: aiResult.metrikler?.patoloji_yuzdesi || 0,
            
            // YENİ EKLENEN FİZİKSEL VERİLER
            alan_mm2: aiResult.metrikler?.alan_mm2 || 0,
            cevre_mm: aiResult.metrikler?.cevre_mm || 0,
            guven_skoru: aiResult.metrikler?.guven_skoru || 0,
            
            // Eski skorlar (varsa kaydedilir, yoksa null kalır)
            dice_skoru: aiResult.metrikler?.dice_skoru || null,
            iou_skoru: aiResult.metrikler?.iou_skoru || null,
            sira_no: sira_no || 1
        });

        // 8. Başarılı Sonuç Dön
        res.status(200).json({
            basarili: true,
            mesaj: 'Analiz tamamlandı ve yeni metriklerle kaydedildi.',
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
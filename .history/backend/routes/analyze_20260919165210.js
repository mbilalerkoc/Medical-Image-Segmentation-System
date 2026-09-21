const express = require('express');
const router = express.Router();
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const upload = require('../middlewares/upload');

// POST: /api/analyze/predict/:model_adi
router.post('/predict/:model_adi', upload.single('dosya'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ basarili: false, mesaj: 'Lütfen bir görüntü yükleyin.' });
        }

        const modelAdi = req.params.model_adi;
        const filePath = req.file.path;
        
        // Python API'sine göndermek için Form verisi oluştur
        const formData = new FormData();
        
        // 🚀 KRİTİK DÜZELTME 1: Python'a gönderirken orijinal ismi ve tipi zorluyoruz
        formData.append('dosya', fs.createReadStream(filePath), {
            filename: req.file.originalname,
            contentType: req.file.mimetype
        });

        const pythonApiUrl = `${process.env.PYTHON_API_URL}/predict/${modelAdi}`;
        console.log(`Python API'sine istek atılıyor: ${pythonApiUrl}`);

        const response = await axios.post(pythonApiUrl, formData, {
            headers: {
                ...formData.getHeaders()
            },
            // 🚀 KRİTİK DÜZELTME 2: Axios'un resmi yarıda kesip bozmasını engelliyoruz
            maxBodyLength: Infinity,
            maxContentLength: Infinity
        });

        // İşlem bittikten sonra sunucuyu şişirmemek için geçici resmi sil
        fs.unlinkSync(filePath);

        // Python'dan dönen veriyi doğrudan Frontend'e yolla
        res.status(200).json(response.data);

    } catch (error) {
        // Geçici resmi hata durumunda da sil
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        
        const gercekHata = error.response ? error.response.data : error.message;
        console.error('AI Servisi Hatası Detayı:', gercekHata);

        res.status(500).json({ 
            basarili: false, 
            mesaj: 'Yapay Zeka sunucusu bir hata döndürdü.',
            hata: gercekHata 
        });
    }
});

module.exports = router;
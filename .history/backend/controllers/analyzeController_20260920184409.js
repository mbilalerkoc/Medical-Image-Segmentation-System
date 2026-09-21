// ...
exports.predictAndSave = async (req, res) => {
    try {
        const modelAdi = req.params.model_adi; // URL'den 'unet' gelecek
        
        // klinik_id'yi body'den alıyoruz
        const { hasta_id, organ, sira_no, klinik_id } = req.body; 
        const file = req.file;

        // 1. Python URL'sini dinamik birleştiriyoruz!
        // modelAdi 'unet', organ 'beyin' ise URL otomatik 'beyin_unet' olacak.
        const pythonUrl = `http://localhost:8000/predict/${organ}_${modelAdi}`;
        
        // ... (FormData ve axios.post kısımları aynı kalacak) ...
        // const response = await axios.post(...) vs.

        // 2. PostgreSQL Kayıt İşlemi
        const analysis = await Analysis.create({
            hasta_id: hasta_id,
            doktor_id: req.user.id, 
            klinik_id: klinik_id, // Bu satırı ekledik
            organ: organ,
            model: modelAdi, // Veritabanına kurallara uygun olarak sadece 'unet' gidecek
            durum: 'tamamlandi'
        });

        // ... (AnalysisSlice kısmı aynı kalacak) ...
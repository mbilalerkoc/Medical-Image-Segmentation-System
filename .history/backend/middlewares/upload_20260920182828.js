// middlewares/upload.js
const multer = require('multer');
const path = require('path');

// Dosyaların kaydedileceği yer ve isim kuralları
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Görseller backend/uploads klasörüne kaydedilecek
    },
    filename: function (req, file, cb) {
        // Dosya isminin sonuna anlık tarihi ekleyerek çakışmaları önlüyoruz (örn: image-1698765432.jpg)
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

// Sadece resim dosyalarına izin ver
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Lütfen sadece resim dosyası yükleyin!'), false);
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // Maksimum 5MB
});

module.exports = upload;
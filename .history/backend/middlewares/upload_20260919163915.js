const multer = require('multer');
const path = require('path');

// Geçici kayıt yeri ve dosya isimlendirme
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'scan-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// Sadece geçerli görüntü formatlarına izin ver
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|tif|tiff/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error('Hata: Sadece medikal görüntü formatları (PNG, JPG, TIF) yüklenebilir!'));
    }
};

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // Max 10 MB sınırı
    fileFilter: fileFilter
});

module.exports = upload;
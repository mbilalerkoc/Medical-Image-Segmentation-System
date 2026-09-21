const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
    let token;

    // Token 'Bearer <token_yapisi>' formatında gönderilmelidir
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ basarili: false, mesaj: 'Bu rotaya erişim izniniz yok. Lütfen giriş yapın.' });
    }

    try {
        // Token'ı çöz ve içindeki ID'yi al
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // İstek yapan kullanıcıyı bul ve req objesine yerleştir
        req.user = await User.findById(decoded.id);
        
        next(); // Her şey yolundaysa bir sonraki işleme geç
    } catch (error) {
        return res.status(401).json({ basarili: false, mesaj: 'Geçersiz veya süresi dolmuş token.' });
    }
};
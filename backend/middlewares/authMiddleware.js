const jwt = require('jsonwebtoken');
const User = require('../models/User');

// 1. Adım: Kişi sisteme giriş yapmış mı? (Token kontrolü)
exports.protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ basarili: false, mesaj: 'Lütfen giriş yapın.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Şifreyi güvenlik gereği req objesine dahil etmiyoruz
        req.user = await User.findByPk(decoded.id, {
            attributes: { exclude: ['sifre'] } 
        });

        if (!req.user) {
            return res.status(401).json({ basarili: false, mesaj: 'Bu tokena ait kullanıcı bulunamadı.' });
        }

        next();
    } catch (error) {
        return res.status(401).json({ basarili: false, mesaj: 'Geçersiz veya süresi dolmuş token.' });
    }
};

// 2. Adım: Kişinin rolü bu işleme yetiyor mu? (Örn: Sadece superadmin veya doktor)
exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.rol)) {
            return res.status(403).json({ 
                basarili: false, 
                mesaj: `Bu işlemi yapmaya yetkiniz yok. Gerekli rol: ${roles.join(' veya ')}` 
            });
        }
        next();
    };
};
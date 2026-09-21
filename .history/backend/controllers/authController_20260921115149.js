const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Token üretici
const sendTokenResponse = (user, statusCode, res) => {
    const token = jwt.sign(
        { id: user.id, rol: user.rol },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
    );

    res.status(statusCode).json({
        basarili: true,
        token,
        kullanici: {
            id: user.id,
            ad: user.ad,
            soyad: user.soyad,
            email: user.email,
            rol: user.rol
        }
    });
};

// ── LOGIN ──────────────────────────────────────────────────
// @route POST /api/auth/login
exports.login = async (req, res) => {
    try {
        const { email, sifre } = req.body;

        if (!email || !sifre) {
            return res.status(400).json({ 
                basarili: false, 
                mesaj: 'E-posta ve şifre zorunludur.' 
            });
        }

        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(401).json({ 
                basarili: false, 
                mesaj: 'Geçersiz e-posta veya şifre.' 
            });
        }

        // Şifre belirlenmemiş kullanıcı (yeni hasta)
        if (!user.sifre) {
            return res.status(403).json({ 
                basarili: false, 
                mesaj: 'Şifrenizi henüz belirlemediniz. Lütfen e-postanızı kontrol edin.' 
            });
        }

        const isMatch = await bcrypt.compare(sifre, user.sifre);
        if (!isMatch) {
            return res.status(401).json({ 
                basarili: false, 
                mesaj: 'Geçersiz e-posta veya şifre.' 
            });
        }

        if (!user.aktif) {
            return res.status(403).json({ 
                basarili: false, 
                mesaj: 'Hesabınız aktif değil. Lütfen yöneticiyle iletişime geçin.' 
            });
        }

        sendTokenResponse(user, 200, res);

    } catch (error) {
        res.status(500).json({ 
            basarili: false, 
            mesaj: 'Giriş işlemi başarısız.', 
            hata: error.message 
        });
    }
};

// ── ŞİFRE BELİRLEME ───────────────────────────────────────
// @route POST /api/auth/set-password
// Hasta mail linkinden gelip şifresini belirler
exports.setPassword = async (req, res) => {
    try {
        const { token, sifre } = req.body;

        if (!token || !sifre) {
            return res.status(400).json({ 
                basarili: false, 
                mesaj: 'Token ve şifre zorunludur.' 
            });
        }

        if (sifre.length < 6) {
            return res.status(400).json({ 
                basarili: false, 
                mesaj: 'Şifre en az 6 karakter olmalıdır.' 
            });
        }

        // Token doğrula
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
            return res.status(400).json({ 
                basarili: false, 
                mesaj: 'Geçersiz veya süresi dolmuş link.' 
            });
        }

        // Kullanıcıyı bul
        const user = await User.findByPk(decoded.id);
        if (!user) {
            return res.status(404).json({ 
                basarili: false, 
                mesaj: 'Kullanıcı bulunamadı.' 
            });
        }

        // Şifreyi hashle ve kaydet
        const salt = await bcrypt.genSalt(10);
        user.sifre = await bcrypt.hash(sifre, salt);
        user.aktif = true;
        await user.save();

        sendTokenResponse(user, 200, res);

    } catch (error) {
        res.status(500).json({ 
            basarili: false, 
            mesaj: 'Şifre belirlenirken hata oluştu.', 
            hata: error.message
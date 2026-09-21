const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Yardımcı Fonksiyon: Token Üretici
const sendTokenResponse = (user, statusCode, res) => {
    // Kullanıcının benzersiz ID'sini payload olarak token'a gömüyoruz
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    });

    res.status(statusCode).json({
        basarili: true,
        token,
        kullanici: {
            id: user._id,
            adSoyad: user.adSoyad,
            unvan: user.unvan
        }
    });
};

// @desc    Sisteme yeni doktor kaydı
// @route   POST /api/auth/register
exports.register = async (req, res) => {
    try {
        const { adSoyad, email, sifre, unvan } = req.body;

        // E-posta adresi sistemde var mı kontrolü
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ basarili: false, mesaj: 'Bu e-posta adresi zaten kullanımda.' });
        }

        // Kullanıcıyı veritabanına kaydet (Şifre User modelindeki pre-save ile otomatik hashlenecek)
        const user = await User.create({
            adSoyad,
            email,
            sifre,
            unvan
        });

        sendTokenResponse(user, 201, res);
    } catch (error) {
        res.status(500).json({ basarili: false, mesaj: 'Kayıt işlemi başarısız.', hata: error.message });
    }
};

// @desc    Doktor girişi
// @route   POST /api/auth/login
exports.login = async (req, res) => {
    try {
        const { email, sifre } = req.body;

        if (!email || !sifre) {
            return res.status(400).json({ basarili: false, mesaj: 'Lütfen e-posta ve şifre girin.' });
        }

        // Kullanıcıyı bul ve veritabanından şifresini (hashli) de getir
        const user = await User.findOne({ email }).select('+sifre');
        if (!user) {
            return res.status(401).json({ basarili: false, mesaj: 'Geçersiz kimlik bilgileri.' });
        }

        // Girilen şifre ile hashlenmiş şifreyi karşılaştır
        const isMatch = await user.sifreEslesiyorMu(sifre);
        if (!isMatch) {
            return res.status(401).json({ basarili: false, mesaj: 'Geçersiz kimlik bilgileri.' });
        }

        sendTokenResponse(user, 200, res);
    } catch (error) {
        res.status(500).json({ basarili: false, mesaj: 'Giriş işlemi başarısız.', hata: error.message });
    }
};
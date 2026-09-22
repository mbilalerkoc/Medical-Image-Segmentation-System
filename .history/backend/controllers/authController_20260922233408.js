const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Doctor = require('../models/Doctor');
const Klinik = require('../models/Klinik'); // 1. EKLENEN YER: Klinik modelini import ediyoruz
const { sequelize } = require('../config/db');

// Token üretici
const sendTokenResponse = (user, statusCode, res) => {
    const token = jwt.sign(
        { id: user.id, rol: user.rol },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
    );

    // 2. EKLENEN YER: Kullanıcı objesini dinamik hale getiriyoruz
    const kullanici = {
        id: user.id,
        ad: user.ad,
        soyad: user.soyad,
        email: user.email,
        rol: user.rol
    };

    // Eğer giriş yapan kullanıcı bir doktorsa ve join işlemiyle Doctor verisi geldiyse, klinik bilgilerini ekle
    if (user.rol === 'doktor' && user.Doctor) {
        kullanici.klinik_id = user.Doctor.klinik_id;
        kullanici.klinik_adi = user.Doctor.Klinik ? user.Doctor.Klinik.klinik_adi : 'Klinik Atanmamış';
    }

    res.status(statusCode).json({
        basarili: true,
        token,
        kullanici // Güncellenmiş dinamik objeyi gönderiyoruz
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

        // 3. EKLENEN YER: Sadece User değil, Doctor ve Klinik tablolarını da include (Join) ediyoruz
        const user = await User.findOne({ 
            where: { email },
            include: [
                {
                    model: Doctor,
                    include: [
                        {
                            model: Klinik,
                            attributes: ['klinik_adi'] // Sadece klinik adını çekerek veritabanını yormuyoruz
                        }
                    ]
                }
            ]
        });

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

// Şifre belirleme ve Create Doctor kısımların aynen kalabilir...
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Token Üretici
const sendTokenResponse = (user, statusCode, res) => {
    const token = jwt.sign(
        { id: user.id, rol: user.rol }, 
        process.env.JWT_SECRET, 
        { expiresIn: process.env.JWT_EXPIRE || '30d' } // Varsayılan olarak 30 gün geçerli olacak şekilde ayarladık
    );

    res.status(statusCode).json({
        basarili: true,
        token,
        kullanici: {
            id: user.id,
            ad: user.ad,
            soyad: user.soyad,
            rol: user.rol
        }
    });
};


// ── 1. HASTA KAYDI (Public Register) ───────────────────────────
// @desc    Sisteme yeni HASTA kaydı (Doktorları Süper Admin ekler)
// @route   POST /api/auth/register
exports.register = async (req, res) => {
    try {
        const { ad, soyad, email, sifre, tc_kimlik, dogum_tarihi, telefon } = req.body;

        // 1. E-posta adresi sistemde var mı kontrolü 
        const userExists = await User.findOne({ where: { email } });
        if (userExists) {
            return res.status(400).json({ basarili: false, mesaj: 'Bu e-posta adresi zaten kullanımda.' });
        }

        // 2. Şifreyi güvenlik için manuel Hashle
        const salt = await bcrypt.genSalt(10);
        const hashedSifre = await bcrypt.hash(sifre, salt);

        // 3. Kullanıcıyı veritabanına kaydet (Rolü zorunlu olarak 'hasta' yapıyoruz)
        const user = await User.create({
            ad,
            soyad,
            email,
            sifre: hashedSifre,
            tc_kimlik,
            dogum_tarihi,
            telefon,
            rol: 'hasta'
        });

        // NOT: İlerleyen aşamalarda buraya 'patients' tablosuna kayıt kodunu da ekleyeceğiz.
        
        sendTokenResponse(user, 201, res);
    } catch (error) {
        res.status(500).json({ basarili: false, mesaj: 'Kayıt işlemi başarısız.', hata: error.message });
    }
};


// ── 2. ORTAK GİRİŞ (Login) ─────────────────────────────────────
// @desc    Süper Admin, Doktor veya Hasta girişi
// @route   POST /api/auth/login
exports.login = async (req, res) => {
    try {
        const { email, sifre } = req.body;

        if (!email || !sifre) {
            return res.status(400).json({ basarili: false, mesaj: 'Lütfen e-posta ve şifre girin.' });
        }

        // 1. Kullanıcıyı PostgreSQL'den bul
        const user = await User.findOne({ where: { email } });
        
        if (!user) {
            return res.status(401).json({ basarili: false, mesaj: 'Geçersiz e-posta veya şifre.' });
        }

        // 2. Girilen şifre ile veritabanındaki hashlenmiş şifreyi karşılaştır
        const isMatch = await bcrypt.compare(sifre, user.sifre);
        if (!isMatch) {
            return res.status(401).json({ basarili: false, mesaj: 'Geçersiz e-posta veya şifre.' });
        }

        // 3. Başarılı ise token gönder
        sendTokenResponse(user, 200, res);
    } catch (error) {
        res.status(500).json({ basarili: false, mesaj: 'Giriş işlemi başarısız.', hata: error.message });
    }
};
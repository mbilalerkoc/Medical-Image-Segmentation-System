const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Doctor = require('../models/Doctor');
const Klinik = require('../models/Klinik');
const { sequelize } = require('../config/db');

// Token üretici ve Frontend'e veri yollama
const sendTokenResponse = (user, statusCode, res) => {
    const token = jwt.sign(
        { id: user.id, rol: user.rol },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
    );

    const kullanici = {
        id: user.id,
        ad: user.ad,
        soyad: user.soyad,
        email: user.email,
        rol: user.rol
    };

    // Doktor ise ve Klinik tablosuyla eşleşme sağlandıysa bilgileri ekle
    if (user.rol === 'doktor' && user.Doctor) {
        kullanici.klinik_id = user.Doctor.klinik_id;
        kullanici.klinik_adi = user.Doctor.Klinik ? user.Doctor.Klinik.ad : 'Klinik Atanmamış';
    }

    res.status(statusCode).json({
        basarili: true,
        token,
        kullanici
    });
};

// ── LOGIN ──────────────────────────────────────────────────
exports.login = async (req, res) => {
    try {
        const { email, sifre } = req.body;

        if (!email || !sifre) {
            return res.status(400).json({ basarili: false, mesaj: 'E-posta ve şifre zorunludur.' });
        }

        // Doctor ve Klinik tablolarını da çekiyoruz
        const user = await User.findOne({ 
            where: { email },
            include: [
                {
                    model: Doctor,
                    include: [
                        {
                            model: Klinik,
                            attributes: ['ad'] 
                        }
                    ]
                }
            ]
        });

        if (!user) {
            return res.status(401).json({ basarili: false, mesaj: 'Geçersiz e-posta veya şifre.' });
        }

        if (!user.sifre) {
            return res.status(403).json({ basarili: false, mesaj: 'Şifrenizi henüz belirlemediniz. Lütfen e-postanızı kontrol edin.' });
        }

        const isMatch = await bcrypt.compare(sifre, user.sifre);
        if (!isMatch) {
            return res.status(401).json({ basarili: false, mesaj: 'Geçersiz e-posta veya şifre.' });
        }

        if (!user.aktif) {
            return res.status(403).json({ basarili: false, mesaj: 'Hesabınız aktif değil. Lütfen yöneticiyle iletişime geçin.' });
        }

        sendTokenResponse(user, 200, res);

    } catch (error) {
        res.status(500).json({ basarili: false, mesaj: 'Giriş işlemi başarısız.', hata: error.message });
    }
};

// ── ŞİFRE BELİRLEME ───────────────────────────────────────
exports.setPassword = async (req, res) => {
    try {
        const { token, sifre } = req.body;

        if (!token || !sifre) {
            return res.status(400).json({ basarili: false, mesaj: 'Token ve şifre zorunludur.' });
        }

        if (sifre.length < 6) {
            return res.status(400).json({ basarili: false, mesaj: 'Şifre en az 6 karakter olmalıdır.' });
        }

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
            return res.status(400).json({ basarili: false, mesaj: 'Geçersiz veya süresi dolmuş link.' });
        }

        const user = await User.findByPk(decoded.id);
        if (!user) {
            return res.status(404).json({ basarili: false, mesaj: 'Kullanıcı bulunamadı.' });
        }

        const salt = await bcrypt.genSalt(10);
        user.sifre = await bcrypt.hash(sifre, salt);
        user.aktif = true;
        await user.save();

        sendTokenResponse(user, 200, res);

    } catch (error) {
        res.status(500).json({ basarili: false, mesaj: 'Şifre belirlenirken hata oluştu.', hata: error.message });
    }
};

// ── DOKTOR OLUŞTURMA ──────────────────────────────────────
exports.createDoctor = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { ad, soyad, email, sifre, tc_kimlik, telefon, unvan, uzmanlik, organ, klinik_id } = req.body;

        if (!ad || !soyad || !email || !sifre || !unvan || !uzmanlik || !organ) {
            await t.rollback();
            return res.status(400).json({ basarili: false, mesaj: 'Eksik bilgi girdiniz.' });
        }

        const existingUser = await User.findOne({ where: { email }, transaction: t });
        if (existingUser) {
            await t.rollback();
            return res.status(400).json({ basarili: false, mesaj: 'Bu e-posta adresi sistemde zaten kayıtlı.' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedSifre = await bcrypt.hash(sifre, salt);

        const newDoctorUser = await User.create({
            ad, soyad, email,
            sifre: hashedSifre,
            rol: 'doktor',
            tc_kimlik, telefon,
            aktif: true
        }, { transaction: t });

        await Doctor.create({
            user_id: newDoctorUser.id,
            unvan,
            uzmanlik,
            organ,
            klinik_id: klinik_id || null
        }, { transaction: t });

        await t.commit();

        res.status(201).json({
            basarili: true,
            mesaj: 'Doktor kaydı başarıyla oluşturuldu ve kliniğe bağlandı.',
            doktor: { id: newDoctorUser.id, ad: newDoctorUser.ad, email: newDoctorUser.email }
        });

    } catch (error) {
        await t.rollback();
        res.status(500).json({ 
            basarili: false, 
            mesaj: 'Doktor kaydı sırasında bir hata oluştu.', 
            hata: error.errors ? error.errors.map(e => e.message) : error.message 
        });
    }
};
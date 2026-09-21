const User = require('../models/User');
const Patient = require('../models/Patient');
const { sequelize } = require('../config/db'); // Sequelize instance import edilmeli!
const jwt = require('jsonwebtoken');

exports.addPatient = async (req, res) => {
    const t = await sequelize.transaction(); // Transaction başlatıyoruz
    try {
        const { ad, soyad, tc_kimlik, email, telefon, dogum_tarihi, kan_grubu, adres } = req.body;
        const doktor_id = req.user.id; 

        const existingUser = await User.findOne({ where: { tc_kimlik }, transaction: t });
        if (existingUser) {
            await t.rollback();
            return res.status(400).json({ basarili: false, mesaj: 'Bu TC Kimlik numarası zaten kayıtlı.' });
        }

        // 1. ADIM: Login için USERS tablosuna kayıt
        const newUser = await User.create({
            ad, soyad, email, tc_kimlik, telefon, dogum_tarihi,
            rol: 'hasta',
            aktif: false,
            sifre: null
        }, { transaction: t });

        console.log("User oluşturuldu, ID:", newUser.id);

        // 2. ADIM: Klinik verileri için PATIENTS tablosuna kayıt
        await Patient.create({
            user_id: newUser.id,
            doktor_id: doktor_id,
            tc_kimlik: tc_kimlik,
            kan_grubu: kan_grubu || '',
            adres: adres || ''
        }, { transaction: t });

        console.log("Patient başarıyla oluşturuldu!");

        await t.commit(); // Her şey yolunda onay ver

        const inviteToken = jwt.sign({ id: newUser.id }, process.env.JWT_SECRET || 'gizli_anahtar', { expiresIn: '7d' });
        const inviteLink = `http://localhost:3000/set-password?token=${inviteToken}`;

        res.status(201).json({
            basarili: true,
            mesaj: 'Hasta başarıyla eklendi ve sisteme bağlandı.',
            davet_linki: inviteLink
        });

    } catch (error) {
        await t.rollback(); // Hata varsa users'a atılanı da geri al
        console.error("PATIENT KAYIT HATASI DETAYI:", error.errors || error.message, error.parent || '');
        res.status(500).json({ 
            basarili: false, 
            mesaj: 'Hasta eklenirken hata oluştu.', 
            detay: error.errors ? error.errors.map(e => e.message) : error.message 
        });
    }
};
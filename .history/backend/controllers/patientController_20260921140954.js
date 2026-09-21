const User = require('../models/User');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const { sequelize } = require('../config/db');
const jwt = require('jsonwebtoken');

// 1. Yeni Hasta Ekleme
exports.addPatient = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { ad, soyad, tc_kimlik, email, telefon, dogum_tarihi, kan_grubu, adres } = req.body;
        const doctor = await Doctor.findOne({ where: { user_id: req.user.id }, transaction: t });
        if (!doctor) {
            await t.rollback();
            return res.status(403).json({ basarili: false, mesaj: 'Doktor profili bulunamadı.' });
        }

        const existingUser = await User.findOne({ where: { tc_kimlik }, transaction: t });
        if (existingUser) {
            await t.rollback();
            return res.status(400).json({ basarili: false, mesaj: 'Bu TC Kimlik numarası zaten kayıtlı.' });
        }

        const newUser = await User.create({
            ad, soyad, email, tc_kimlik, telefon, dogum_tarihi,
            rol: 'hasta',
            aktif: false,
            sifre: null
        }, { transaction: t });

        await Patient.create({
            user_id: newUser.id,
            doktor_id: doctor.id,
            tc_kimlik: tc_kimlik,
            kan_grubu: kan_grubu || null,
            adres: adres || ''
        }, { transaction: t });

        await t.commit();

        const inviteToken = jwt.sign({ id: newUser.id }, process.env.JWT_SECRET || 'gizli_anahtar', { expiresIn: '7d' });
        const inviteLink = `http://localhost:3000/set-password?token=${inviteToken}`;

        res.status(201).json({
            basarili: true,
            mesaj: 'Hasta başarıyla eklendi ve sisteme bağlandı.',
            davet_linki: inviteLink
        });

    } catch (error) {
        await t.rollback();
        console.error("PATIENT KAYIT HATASI DETAYI:", error.errors || error.message, error.parent || '');
        res.status(500).json({ 
            basarili: false, 
            mesaj: 'Hasta eklenirken hata oluştu.', 
            detay: error.errors ? error.errors.map(e => e.message) : error.message 
        });
    }
};

// 2. Hastaları Listeleme
exports.getPatients = async (req, res) => {
    try {
        const doctor = await Doctor.findOne({ where: { user_id: req.user.id } });
        if (!doctor) {
            return res.status(403).json({ basarili: false, mesaj: 'Doktor profili bulunamadı.' });
        }

        const patients = await Patient.findAll({
            where: { doktor_id: doctor.id },   // ← düzeltildi
            include: [{ 
                model: User, 
                attributes: ['ad', 'soyad', 'email', 'telefon', 'aktif'] 
            }]
        });

        const formatliHastalar = patients.map(p => ({
            id: p.id,
            tc_kimlik: p.tc_kimlik,
            ad: p.User ? p.User.ad : '',
            soyad: p.User ? p.User.soyad : '',
            email: p.User ? p.User.email : '',
            telefon: p.User ? p.User.telefon : '',
            User: { aktif: p.User ? p.User.aktif : false }
        }));

        res.status(200).json({ basarili: true, hastalar: formatliHastalar });
    } catch (error) {
        console.error("GET PATIENTS HATASI:", error.message);
        res.status(500).json({ basarili: false, mesaj: 'Hastalar getirilemedi.', hata: error.message });
    }
};
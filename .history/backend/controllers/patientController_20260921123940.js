const User = require('../models/User');
// Patient modelinin doğru yolda olduğundan emin ol
const Patient = require('../models/Patient'); 
const jwt = require('jsonwebtoken');

// 1. Yeni Hasta Ekleme
exports.addPatient = async (req, res) => {
    try {
        const { ad, soyad, tc_kimlik, email, telefon, dogum_tarihi, kan_grubu, adres } = req.body;
        
        // Doktor ID'sini token'dan (middleware üzerinden) alıyoruz
        const doktor_id = req.user.id; 

        // TC Kimlik veya Email kontrolü
        const existingUser = await User.findOne({ where: { tc_kimlik } });
        if (existingUser) {
            return res.status(400).json({ basarili: false, mesaj: 'Bu TC Kimlik numarası zaten kayıtlı.' });
        }

        // 1. ADIM: Login için USERS tablosuna pasif hesap oluştur
        const newUser = await User.create({
            ad, soyad, email, tc_kimlik, telefon, dogum_tarihi,
            rol: 'hasta',
            aktif: false, // Hasta şifre belirleyene kadar pasif kalır
            sifre: null
        });

        // 2. ADIM: Klinik verileri için PATIENTS tablosuna kayıt oluştur
        await Patient.create({
            user_id: newUser.id,
            doktor_id: doktor_id,
            tc_kimlik: tc_kimlik,
            kan_grubu: kan_grubu || 'Belirtilmedi',
            adres: adres || ''
        });

        // 3. ADIM: Hasta için şifre belirleme (Davet) linki oluştur
        const inviteToken = jwt.sign({ id: newUser.id }, process.env.JWT_SECRET || 'gizli_anahtar', { expiresIn: '7d' });
        const inviteLink = `http://localhost:3000/set-password?token=${inviteToken}`;

        res.status(201).json({
            basarili: true,
            mesaj: 'Hasta başarıyla eklendi ve sisteme bağlandı.',
            davet_linki: inviteLink // Geliştirme aşamasında console/arayüzde görmek için
        });

    } catch (error) {
        res.status(500).json({ basarili: false, mesaj: 'Hasta eklenirken hata oluştu.', hata: error.message });
    }
};

// 2. Hastaları Listeleme (Arayüzdeki tabloyu doldurmak için)
exports.getPatients = async (req, res) => {
    try {
        const doktor_id = req.user.id;
        
        // Bu doktorun eklediği hastaları ve Users tablosundaki aktif/pasif durumunu getir
        const patients = await Patient.findAll({
            where: { doktor_id },
            include: [{ 
                model: User, 
                attributes: ['ad', 'soyad', 'email', 'telefon', 'aktif'] 
            }]
        });

        // React'in beklediği düz formata (JSON) çeviriyoruz
        const formatliHastalar = patients.map(p => ({
            id: p.id,
            tc_kimlik: p.tc_kimlik,
            ad: p.User.ad,
            soyad: p.User.soyad,
            email: p.User.email,
            telefon: p.User.telefon,
            User: { aktif: p.User.aktif }
        }));

        res.status(200).json({ basarili: true, hastalar: formatliHastalar });
    } catch (error) {
        console.error("HATA DETAYI:", error);
        res.status(500).json({ basarili: false, mesaj: 'Hastalar getirilemedi.', hata: error.message });
    }
};
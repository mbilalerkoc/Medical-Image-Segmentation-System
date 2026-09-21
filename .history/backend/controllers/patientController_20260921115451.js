// Örnek: Doktor hastayı eklerken USERS ve PATIENTS bağını kurma
exports.addPatientByDoctor = async (req, res) => {
    try {
        const { ad, soyad, email, telefon, tc_kimlik, dogum_tarihi, kan_grubu, adres } = req.body;
        const doktor_id = req.user.id; // Token'dan gelen doktor ID

        // 1. Önce login tablosuna (User) pasif hasta kaydı at
        const newUser = await User.create({
            ad,
            soyad,
            email,
            tc_kimlik,
            dogum_tarihi,
            telefon,
            rol: 'hasta',
            aktif: false,
            sifre: null
        });

        // 2. Klinik detayları tablosuna (Patients) bağla
        // Not: Patients tablonuzda user_id veya tc_kimlik ilişkisi olmalı
        const newPatient = await Patient.create({
            user_id: newUser.id,
            tc_kimlik,
            kan_grubu,
            adres,
            doktor_id
        });

        // 3. Davet token üret ve mail gönder (simülasyon/jwt)
        const inviteToken = jwt.sign({ id: newUser.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        const inviteLink = `http://localhost:3000/set-password?token=${inviteToken}`;
        
        // await sendEmail(email, "Şifre Belirleme", `Davet linkiniz: ${inviteLink}`);

        res.status(201).json({
            basarili: true,
            mesaj: 'Hasta sisteme eklendi ve şifre belirleme maili gönderildi.',
            davet_linki_test: inviteLink // Geliştirme aşamasında görmek için
        });
    } catch (error) {
        res.status(500).json({ basarili: false, hata: error.message });
    }
};
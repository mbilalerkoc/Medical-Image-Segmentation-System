// seed_admin.js
require('dotenv').config();
const { sequelize } = require('./config/db');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

const createSuperAdmin = async () => {
    try {
        // Veritabanına bağlan
        await sequelize.authenticate();
        console.log('🐘 PostgreSQL Bağlantısı Başarılı (Seed işlemi için)');

        // Sistemde zaten bir superadmin var mı kontrol et
        const existingAdmin = await User.findOne({ where: { rol: 'superadmin' } });
        if (existingAdmin) {
            console.log('⚠️ Sistemde zaten bir Süper Admin mevcut. İşlem iptal edildi.');
            process.exit(0);
        }

        // Şifreyi hashle
        const salt = await bcrypt.genSalt(10);
        const hashedSifre = await bcrypt.hash('Admin12345', salt); // Kurucu şifresi: admin12345

        // Süper Admin'i oluştur
        const superAdmin = await User.create({
            ad: 'Sistem',
            soyad: 'Yöneticisi',
            email: 'admin@pathovision.com',
            sifre: hashedSifre,
            tc_kimlik: '00000000000',
            telefon: '00000000000',
            rol: 'superadmin',
            aktif: true
        });

        console.log('✅ Kurucu Süper Admin başarıyla oluşturuldu!');
        console.log(`📧 E-posta: ${superAdmin.email}`);
        console.log('🔑 Şifre: Admin12345');
        
        process.exit(0); // İşlem bitince scripti sonlandır
    } catch (error) {
        console.error('❌ Süper Admin oluşturulurken hata:', error.message);
        process.exit(1);
    }
};

createSuperAdmin();
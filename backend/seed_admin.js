require("dotenv").config();

const bcrypt = require("bcryptjs");

const { sequelize } = require("./config/db");
const User = require("./models/User");

const createSuperAdmin = async () => {
  try {
    const adminPassword = process.env.SUPERADMIN_PASSWORD;

    if (!adminPassword) {
      throw new Error("SUPERADMIN_PASSWORD .env dosyasında tanımlı değil.");
    }

    if (adminPassword.length < 8) {
      throw new Error("SUPERADMIN_PASSWORD en az 8 karakter olmalıdır.");
    }

    await sequelize.authenticate();

    console.log("🐘 PostgreSQL Bağlantısı Başarılı (Seed işlemi için)");

    const existingAdmin = await User.findOne({
      where: {
        rol: "superadmin",
      },
    });

    if (existingAdmin) {
      console.log(
        "⚠️ Sistemde zaten bir Süper Admin mevcut. İşlem iptal edildi.",
      );

      return;
    }

    const salt = await bcrypt.genSalt(10);

    const hashedPassword = await bcrypt.hash(adminPassword, salt);

    const superAdmin = await User.create({
      ad: "Sistem",
      soyad: "Yöneticisi",
      email: "admin@pathovision.com",
      sifre: hashedPassword,
      tc_kimlik: "00000000000",
      telefon: "00000000000",
      rol: "superadmin",
      aktif: true,
    });

    console.log("✅ Kurucu Süper Admin başarıyla oluşturuldu.");

    console.log(`📧 E-posta: ${superAdmin.email}`);
  } catch (error) {
    console.error("❌ Süper Admin oluşturulurken hata:", error.message);

    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
};

createSuperAdmin();

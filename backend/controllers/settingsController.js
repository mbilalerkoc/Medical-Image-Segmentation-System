const { Op } = require("sequelize");
const bcrypt = require("bcryptjs");

const User = require("../models/User");
const Doctor = require("../models/Doctor");

// =====================================================
// PROFİL BİLGİLERİNİ GÜNCELLE
// PUT /api/settings/profile
// =====================================================

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      ad,
      soyad,
      email,
      telefon,
    } = req.body;

    if (
      !ad?.trim() ||
      !soyad?.trim() ||
      !email?.trim()
    ) {
      return res.status(400).json({
        basarili: false,
        mesaj:
          "Ad, soyad ve e-posta alanları zorunludur.",
      });
    }

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({
        basarili: false,
        mesaj: "Kullanıcı bulunamadı.",
      });
    }

    const existingEmail = await User.findOne({
      where: {
        email: email.trim(),

        id: {
          [Op.ne]: userId,
        },
      },
    });

    if (existingEmail) {
      return res.status(409).json({
        basarili: false,
        mesaj:
          "Bu e-posta adresi başka bir kullanıcı tarafından kullanılıyor.",
      });
    }

    user.ad = ad.trim();
    user.soyad = soyad.trim();
    user.email = email.trim();
    user.telefon =
      telefon?.trim() || null;

    await user.save();

    const doctor = await Doctor.findOne({
      where: {
        user_id: userId,
      },
    });

    return res.status(200).json({
      basarili: true,

      mesaj:
        "Profil bilgileri başarıyla güncellendi.",

      user: {
        id: user.id,
        ad: user.ad,
        soyad: user.soyad,
        email: user.email,
        telefon: user.telefon,
        unvan: doctor?.unvan || null,
        klinik_id:
          doctor?.klinik_id || null,
      },
    });
  } catch (error) {
    console.error(
      "Profil güncelleme hatası:",
      error.message
    );

    return res.status(500).json({
      basarili: false,

      mesaj:
        "Profil bilgileri güncellenirken bir hata oluştu.",

      hata: error.message,
    });
  }
};

// =====================================================
// ŞİFRE DEĞİŞTİR
// PUT /api/settings/password
// =====================================================

exports.changePassword = async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      mevcut_sifre,
      yeni_sifre,
      yeni_sifre_tekrar,
    } = req.body;

    // =====================================================
    // 1. ALAN KONTROLÜ
    // =====================================================

    if (
      !mevcut_sifre ||
      !yeni_sifre ||
      !yeni_sifre_tekrar
    ) {
      return res.status(400).json({
        basarili: false,
        mesaj:
          "Mevcut şifre, yeni şifre ve şifre tekrarı zorunludur.",
      });
    }

    // =====================================================
    // 2. YENİ ŞİFRELER AYNI MI?
    // =====================================================

    if (
      yeni_sifre !==
      yeni_sifre_tekrar
    ) {
      return res.status(400).json({
        basarili: false,
        mesaj:
          "Yeni şifreler birbiriyle eşleşmiyor.",
      });
    }

    // =====================================================
    // 3. ŞİFRE UZUNLUĞU
    // =====================================================

    if (yeni_sifre.length < 6) {
      return res.status(400).json({
        basarili: false,
        mesaj:
          "Yeni şifre en az 6 karakter olmalıdır.",
      });
    }

    // =====================================================
    // 4. KULLANICIYI BUL
    // =====================================================

    const user =
      await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({
        basarili: false,
        mesaj:
          "Kullanıcı bulunamadı.",
      });
    }

    if (!user.sifre) {
      return res.status(400).json({
        basarili: false,
        mesaj:
          "Kullanıcının mevcut şifre kaydı bulunamadı.",
      });
    }

    // =====================================================
    // 5. MEVCUT ŞİFRE DOĞRU MU?
    // =====================================================

    const mevcutSifreDogru =
      await bcrypt.compare(
        mevcut_sifre,
        user.sifre
      );

    if (!mevcutSifreDogru) {
      return res.status(401).json({
        basarili: false,
        mesaj:
          "Mevcut şifreniz yanlış.",
      });
    }

    // =====================================================
    // 6. YENİ ŞİFRE ESKİ ŞİFREYLE AYNI MI?
    // =====================================================

    const eskiSifreyleAyni =
      await bcrypt.compare(
        yeni_sifre,
        user.sifre
      );

    if (eskiSifreyleAyni) {
      return res.status(400).json({
        basarili: false,
        mesaj:
          "Yeni şifreniz mevcut şifrenizden farklı olmalıdır.",
      });
    }

    // =====================================================
    // 7. YENİ ŞİFREYİ HASHLE
    // =====================================================

    const salt =
      await bcrypt.genSalt(10);

    const hashedPassword =
      await bcrypt.hash(
        yeni_sifre,
        salt
      );

    // =====================================================
    // 8. VERİTABANINA KAYDET
    // =====================================================

    user.sifre =
      hashedPassword;

    await user.save();

    // =====================================================
    // 9. RESPONSE
    // =====================================================

    return res.status(200).json({
      basarili: true,

      mesaj:
        "Şifreniz başarıyla güncellendi.",
    });
  } catch (error) {
    console.error(
      "Şifre değiştirme hatası:",
      error.message
    );

    return res.status(500).json({
      basarili: false,

      mesaj:
        "Şifre güncellenirken bir hata oluştu.",

      hata:
        error.message,
    });
  }
};
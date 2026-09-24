const { Op } = require("sequelize");

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

    // =====================================================
    // TEMEL KONTROLLER
    // =====================================================

    if (!ad?.trim() || !soyad?.trim() || !email?.trim()) {
      return res.status(400).json({
        basarili: false,
        mesaj: "Ad, soyad ve e-posta alanları zorunludur.",
      });
    }

    // =====================================================
    // KULLANICIYI BUL
    // =====================================================

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({
        basarili: false,
        mesaj: "Kullanıcı bulunamadı.",
      });
    }

    // =====================================================
    // E-POSTA BAŞKA HESAPTA KULLANILIYOR MU?
    // =====================================================

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
        mesaj: "Bu e-posta adresi başka bir kullanıcı tarafından kullanılıyor.",
      });
    }

    // =====================================================
    // GÜNCELLE
    // =====================================================

    user.ad = ad.trim();
    user.soyad = soyad.trim();
    user.email = email.trim();
    user.telefon = telefon?.trim() || null;

    await user.save();

    // =====================================================
    // DOKTOR BİLGİSİ
    // =====================================================

    const doctor = await Doctor.findOne({
      where: {
        user_id: userId,
      },
    });

    // =====================================================
    // RESPONSE
    // =====================================================

    return res.status(200).json({
      basarili: true,

      mesaj: "Profil bilgileri başarıyla güncellendi.",

      user: {
        id: user.id,

        ad: user.ad,

        soyad: user.soyad,

        email: user.email,

        telefon: user.telefon,

        unvan: doctor?.unvan || null,

        klinik_id: doctor?.klinik_id || null,
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

      hata:
        error.message,
    });
  }
};
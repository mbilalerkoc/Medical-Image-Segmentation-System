const User = require("../models/User");
const Patient = require("../models/Patient");
const Doctor = require("../models/Doctor");
const Analysis = require("../models/Analysis");
const Report = require("../models/Report");

const { sequelize } = require("../config/db");
const jwt = require("jsonwebtoken");

// =====================================================
// 1. YENİ HASTA EKLE
// =====================================================

exports.addPatient = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const {
      ad,
      soyad,
      tc_kimlik,
      email,
      telefon,
      dogum_tarihi,
      kan_grubu,
      adres,
    } = req.body;

    const doctor = await Doctor.findOne({
      where: {
        user_id: req.user.id,
      },
      transaction: t,
    });

    if (!doctor) {
      await t.rollback();

      return res.status(403).json({
        basarili: false,
        mesaj: "Doktor profili bulunamadı.",
      });
    }

    const existingUser = await User.findOne({
      where: {
        tc_kimlik,
      },
      transaction: t,
    });

    if (existingUser) {
      await t.rollback();

      return res.status(400).json({
        basarili: false,
        mesaj: "Bu TC Kimlik numarası zaten kayıtlı.",
      });
    }

    const newUser = await User.create(
      {
        ad,
        soyad,
        email,
        tc_kimlik,
        telefon,
        dogum_tarihi,

        rol: "hasta",

        aktif: false,

        sifre: null,
      },
      {
        transaction: t,
      },
    );

    await Patient.create(
      {
        user_id: newUser.id,

        doktor_id: doctor.id,

        tc_kimlik: tc_kimlik,

        kan_grubu: kan_grubu || null,

        adres: adres || "",
      },
      {
        transaction: t,
      },
    );

    await t.commit();

    const inviteToken = jwt.sign(
      {
        id: newUser.id,
      },
      process.env.JWT_SECRET || "gizli_anahtar",
      {
        expiresIn: "7d",
      },
    );

    const inviteLink = `http://localhost:3000/set-password?token=${inviteToken}`;

    return res.status(201).json({
      basarili: true,

      mesaj: "Hasta başarıyla eklendi ve sisteme bağlandı.",

      davet_linki: inviteLink,
    });
  } catch (error) {
    await t.rollback();

    console.error(
      "PATIENT KAYIT HATASI DETAYI:",
      error.errors || error.message,
      error.parent || "",
    );

    return res.status(500).json({
      basarili: false,

      mesaj: "Hasta eklenirken hata oluştu.",

      detay: error.errors ? error.errors.map((e) => e.message) : error.message,
    });
  }
};

// =====================================================
// 2. HASTALARI LİSTELE
// =====================================================

exports.getPatients = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({
      where: {
        user_id: req.user.id,
      },
    });

    if (!doctor) {
      return res.status(403).json({
        basarili: false,
        mesaj: "Doktor profili bulunamadı.",
      });
    }

    const patients = await Patient.findAll({
      where: {
        doktor_id: doctor.id,
      },

      include: [
        {
          model: User,

          attributes: ["ad", "soyad", "email", "telefon", "aktif"],
        },
      ],
    });

    const formatliHastalar = patients.map((p) => ({
      id: p.id,

      tc_kimlik: p.tc_kimlik,

      ad: p.User ? p.User.ad : "",

      soyad: p.User ? p.User.soyad : "",

      email: p.User ? p.User.email : "",

      telefon: p.User ? p.User.telefon : "",

      User: {
        aktif: p.User ? p.User.aktif : false,
      },
    }));

    return res.status(200).json({
      basarili: true,

      hastalar: formatliHastalar,
    });
  } catch (error) {
    console.error("GET PATIENTS HATASI:", error.message);

    return res.status(500).json({
      basarili: false,

      mesaj: "Hastalar getirilemedi.",

      hata: error.message,
    });
  }
};

// =====================================================
// 3. HASTA DETAYI + GEÇMİŞ ANALİZLER
// =====================================================

exports.getPatientById = async (req, res) => {
  try {
    const hastaId = req.params.id;

    // Giriş yapan doktoru bul
    const doctor = await Doctor.findOne({
      where: {
        user_id: req.user.id,
      },
    });

    if (!doctor) {
      return res.status(403).json({
        basarili: false,
        mesaj: "Doktor profili bulunamadı.",
      });
    }

    // Hastayı getir
    const patient = await Patient.findByPk(hastaId, {
      include: [
        {
          model: User,

          attributes: [
            "ad",
            "soyad",
            "email",
            "telefon",
            "dogum_tarihi",
            "aktif",
          ],
        },
      ],
    });

    if (!patient) {
      return res.status(404).json({
        basarili: false,
        mesaj: "Hasta bulunamadı.",
      });
    }

    // Doktor sadece kendi hastasını görebilsin
    if (Number(patient.doktor_id) !== Number(doctor.id)) {
      return res.status(403).json({
        basarili: false,
        mesaj: "Bu hastayı görüntüleme yetkiniz bulunmuyor.",
      });
    }

    // Hastanın analizlerini getir
    const analyses = await Analysis.findAll({
      where: {
        hasta_id: patient.id,
      },

      order: [["id", "DESC"]],
    });

    // Her analize ait son raporu bul
    const analizler = await Promise.all(
      analyses.map(async (analysis) => {
        const report = await Report.findOne({
          where: {
            analiz_id: analysis.id,
          },

          order: [["id", "DESC"]],
        });

        return {
          id: analysis.id,

          organ: analysis.organ,

          model: analysis.model,

          durum: analysis.durum,

          tarih: report?.olusturulma_tarihi || null,

          doktor_notu: report?.doktor_notu || null,
        };
      }),
    );

    return res.status(200).json({
      basarili: true,

      hasta: {
        id: patient.id,

        tc_kimlik: patient.tc_kimlik,

        ad: patient.User?.ad || "",

        soyad: patient.User?.soyad || "",

        email: patient.User?.email || "",

        telefon: patient.User?.telefon || "",

        dogum_tarihi: patient.User?.dogum_tarihi || null,

        kan_grubu: patient.kan_grubu || null,

        adres: patient.adres || "",

        aktif: patient.User?.aktif || false,
      },

      analizler: analizler,
    });
  } catch (error) {
    console.error("HASTA DETAY HATASI:", error.message);

    return res.status(500).json({
      basarili: false,

      mesaj: "Hasta detayları getirilemedi.",

      hata: error.message,
    });
  }
};

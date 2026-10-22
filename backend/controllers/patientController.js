const { Op } = require("sequelize");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const Patient = require("../models/Patient");
const Doctor = require("../models/Doctor");
const Analysis = require("../models/Analysis");
const Report = require("../models/Report");
const Appointment = require("../models/Appointment");

const { sequelize } = require("../config/db");

const notificationService = require("../services/notificationService");
const mailService = require("../services/mailService");

// =====================================================
// 1. YENİ HASTA EKLE
// =====================================================

exports.addPatient = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const {
      ad,
      soyad,
      email,
      telefon,
      tc_kimlik,
      dogum_tarihi,
      cinsiyet,
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

    const newPatient = await Patient.create(
      {
        user_id: newUser.id,
        doktor_id: doctor.id,
        tc_kimlik,
        cinsiyet: cinsiyet || null,
        kan_grubu: kan_grubu || null,
        adres: adres || "",
      },
      {
        transaction: t,
      },
    );

    await notificationService.createFromEvent({
      kullaniciId: req.user.id,
      tip: "patient_assigned",
      data: {
        hastaAdi: `${newUser.ad} ${newUser.soyad}`.trim(),
      },
      link: `/patients/${newPatient.id}`,
      metadata: {
        patient_id: newPatient.id,
        user_id: newUser.id,
      },
      transaction: t,
    });

    await t.commit();

    // =====================================================
    // DAVET TOKENI
    // =====================================================

    const inviteToken = jwt.sign(
      {
        id: newUser.id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      },
    );

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

    const inviteLink = `${frontendUrl}/set-password?token=${inviteToken}`;

    // =====================================================
    // DAVET E-POSTASI
    // =====================================================

    let mailSent = false;

    try {
      await mailService.sendPatientInvitation({
        email: newUser.email,
        ad: newUser.ad,
        soyad: newUser.soyad,
        inviteLink,
      });

      mailSent = true;
    } catch (mailError) {
      console.error("HASTA DAVET MAILİ GÖNDERİLEMEDİ:", mailError.message);
    }

    return res.status(201).json({
      basarili: true,

      mesaj: mailSent
        ? "Hasta başarıyla eklendi ve davet e-postası gönderildi."
        : "Hasta başarıyla eklendi ancak davet e-postası gönderilemedi.",

      mail_gonderildi: mailSent,

      davet_linki: inviteLink,
    });
  } catch (error) {
    if (!t.finished) {
      await t.rollback();
    }

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

    const formatliHastalar = patients.map((p) => ({
      id: p.id,
      tc_kimlik: p.tc_kimlik,
      ad: p.User?.ad || "",
      soyad: p.User?.soyad || "",
      email: p.User?.email || "",
      telefon: p.User?.telefon || "",
      dogum_tarihi: p.User?.dogum_tarihi || null,
      cinsiyet: p.cinsiyet || null,
      kan_grubu: p.kan_grubu || null,
      adres: p.adres || "",
      User: {
        aktif: p.User?.aktif || false,
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
// 3. HASTANIN KENDİ DASHBOARD VERİLERİ
// =====================================================

exports.getMyDashboard = async (req, res) => {
  try {
    // Hasta ID'si frontend'den alınmıyor.
    // JWT içerisindeki kullanıcı ID'sinden hasta bulunuyor.
    const patient = await Patient.findOne({
      where: {
        user_id: req.user.id,
      },

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
        mesaj: "Hasta profili bulunamadı.",
      });
    }

    const now = new Date();

    const [
      analizSayisi,
      raporSayisi,
      yaklasanRandevuSayisi,
      sonAnalizler,
      yaklasanRandevular,
    ] = await Promise.all([
      // Toplam analiz
      Analysis.count({
        where: {
          hasta_id: patient.id,
        },
      }),

      // Toplam rapor
      Report.count({
        where: {
          hasta_id: patient.id,
        },
      }),

      // Yaklaşan aktif randevular
      Appointment.count({
        where: {
          hasta_id: patient.id,

          tarih_saat: {
            [Op.gte]: now,
          },

          durum: {
            [Op.in]: ["bekliyor", "onaylandi"],
          },
        },
      }),

      // Son 5 analiz
      Analysis.findAll({
        where: {
          hasta_id: patient.id,
        },

        attributes: ["id", "analiz_adi", "organ", "model", "durum"],

        order: [["id", "DESC"]],

        limit: 5,
      }),

      // En yakın 3 randevu
      Appointment.findAll({
        where: {
          hasta_id: patient.id,

          tarih_saat: {
            [Op.gte]: now,
          },

          durum: {
            [Op.in]: ["bekliyor", "onaylandi"],
          },
        },

        attributes: [
          "id",
          "doktor_id",
          "klinik_id",
          "tarih_saat",
          "durum",
          "randevu_nedeni",
          "sure_dakika",
        ],

        order: [["tarih_saat", "ASC"]],

        limit: 3,
      }),
    ]);

    return res.status(200).json({
      basarili: true,

      hasta: {
        id: patient.id,
        ad: patient.User?.ad || "",
        soyad: patient.User?.soyad || "",
        email: patient.User?.email || "",
        telefon: patient.User?.telefon || "",
        dogum_tarihi: patient.User?.dogum_tarihi || null,
        tc_kimlik: patient.tc_kimlik,
        cinsiyet: patient.cinsiyet || null,
        kan_grubu: patient.kan_grubu || null,
        adres: patient.adres || "",
      },

      istatistikler: {
        toplam_analiz: analizSayisi,
        toplam_rapor: raporSayisi,
        yaklasan_randevu: yaklasanRandevuSayisi,
      },

      son_analizler: sonAnalizler,

      yaklasan_randevular: yaklasanRandevular,
    });
  } catch (error) {
    console.error("HASTA DASHBOARD HATASI:", error.message);

    return res.status(500).json({
      basarili: false,
      mesaj: "Dashboard bilgileri getirilemedi.",
      hata: error.message,
    });
  }
};
// =====================================================
// HASTANIN KENDİ ANALİZLERİ
// =====================================================

exports.getMyAnalyses = async (req, res) => {
  try {
    const patient = await Patient.findOne({
      where: {
        user_id: req.user.id,
      },
    });

    if (!patient) {
      return res.status(404).json({
        basarili: false,
        mesaj: "Hasta profili bulunamadı.",
      });
    }

    const analyses = await Analysis.findAll({
      where: {
        hasta_id: patient.id,
      },

      attributes: ["id", "analiz_adi", "organ", "model", "durum"],

      order: [["id", "DESC"]],
    });

    const analizler = await Promise.all(
      analyses.map(async (analysis) => {
        const report = await Report.findOne({
          where: {
            analiz_id: analysis.id,
            hasta_id: patient.id,
          },

          order: [["id", "DESC"]],
        });

        return {
          id: analysis.id,

          analiz_adi: analysis.analiz_adi || `Analiz #${analysis.id}`,

          organ: analysis.organ,
          model: analysis.model,
          durum: analysis.durum,

          rapor_var: Boolean(report),

          tarih: report?.olusturulma_tarihi || null,
        };
      }),
    );

    return res.status(200).json({
      basarili: true,
      analizler,
    });
  } catch (error) {
    console.error("HASTA ANALİZLERİ HATASI:", error.message);

    return res.status(500).json({
      basarili: false,
      mesaj: "Analizler getirilemedi.",
      hata: error.message,
    });
  }
};
// =====================================================
// 4. HASTA DETAYI + GEÇMİŞ ANALİZLER
// =====================================================

exports.getPatientById = async (req, res) => {
  try {
    const hastaId = req.params.id;

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

    if (Number(patient.doktor_id) !== Number(doctor.id)) {
      return res.status(403).json({
        basarili: false,
        mesaj: "Bu hastayı görüntüleme yetkiniz bulunmuyor.",
      });
    }

    const analyses = await Analysis.findAll({
      where: {
        hasta_id: patient.id,
      },

      order: [["id", "DESC"]],
    });

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

          analiz_adi: analysis.analiz_adi || `Analiz #${analysis.id}`,

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
        cinsiyet: patient.cinsiyet || null,
        kan_grubu: patient.kan_grubu || null,
        adres: patient.adres || "",
        aktif: patient.User?.aktif || false,
      },

      analizler,
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

const { sequelize } = require("../config/db");

const Report = require("../models/Report");
const Patient = require("../models/Patient");
const Analysis = require("../models/Analysis");
const notificationService = require("../services/notificationService");
const AnalysisSlice = require("../models/AnalysisSlice");
const Doctor = require("../models/Doctor");
const User = require("../models/User");

exports.createReport = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { tc_kimlik, analiz_id, pdf_yolu, doktor_notu } = req.body;

    if (!analiz_id || !tc_kimlik) {
      await transaction.rollback();

      return res.status(400).json({
        basarili: false,
        mesaj: "Zorunlu alanlar eksik.",
      });
    }

    const doktor = await Doctor.findOne({
      where: { user_id: req.user.id },
      transaction,
    });

    if (!doktor) {
      await transaction.rollback();

      return res.status(404).json({
        basarili: false,
        mesaj: "Doktor kaydı bulunamadı.",
      });
    }

    const hasta = await Patient.findOne({
      where: { tc_kimlik },
      transaction,
    });

    if (!hasta) {
      await transaction.rollback();

      return res.status(404).json({
        basarili: false,
        mesaj: "Hasta bulunamadı.",
      });
    }

    const analysis = await Analysis.findOne({
      where: {
        id: analiz_id,
        hasta_id: hasta.id,
        doktor_id: doktor.id,
      },
      transaction,
    });

    if (!analysis) {
      await transaction.rollback();

      return res.status(404).json({
        basarili: false,
        mesaj: "Analiz bulunamadı veya bu doktora ait değil.",
      });
    }

    const yeniRapor = await Report.create(
      {
        analiz_id,
        hasta_id: hasta.id,
        doktor_id: doktor.id,
        pdf_yolu: pdf_yolu || "Sistem üzerinden PDF alınabilir",
        doktor_notu: doktor_notu?.trim() || null,
      },
      { transaction },
    );

    await notificationService.createFromEvent({
      kullaniciId: hasta.user_id,
      tip: "report_created",
      metadata: {
        report_id: yeniRapor.id,
        analysis_id: analiz_id,
      },
      transaction,
    });

    await transaction.commit();

    return res.status(201).json({
      basarili: true,
      mesaj: "Rapor başarıyla kaydedildi.",
      rapor: yeniRapor,
    });
  } catch (error) {
    if (!transaction.finished) {
      await transaction.rollback();
    }

    console.error("Rapor Kayıt Hatası:", error);

    return res.status(500).json({
      basarili: false,
      mesaj: "Rapor kaydedilirken bir hata oluştu.",
      hata: error.message,
    });
  }
};

exports.getMyReports = async (req, res) => {
  try {
    const patient = await Patient.findOne({
      where: { user_id: req.user.id },
    });

    if (!patient) {
      return res.status(404).json({
        basarili: false,
        mesaj: "Hasta profili bulunamadı.",
      });
    }

    const reports = await Report.findAll({
      where: { hasta_id: patient.id },
      order: [
        ["olusturulma_tarihi", "DESC"],
        ["id", "DESC"],
      ],
    });

    const raporlar = await Promise.all(
      reports.map(async (report) => {
        const analysis = await Analysis.findByPk(report.analiz_id, {
          attributes: ["id", "analiz_adi", "organ", "model", "durum"],
        });

        const slice = await AnalysisSlice.findOne({
          where: { analiz_id: report.analiz_id },
          attributes: ["goruntu_yolu"],
        });

        const previewImage = slice?.goruntu_yolu
          ? `${req.protocol}://${req.get("host")}/uploads/${slice.goruntu_yolu}`
          : null;

        return {
          id: report.id,
          analiz_id: report.analiz_id,
          analiz_adi: analysis?.analiz_adi || `Analiz #${report.analiz_id}`,
          organ: analysis?.organ || null,
          model: analysis?.model || null,
          analiz_durumu: analysis?.durum || null,
          doktor_notu: report.doktor_notu || null,
          pdf_yolu: report.pdf_yolu || null,
          preview_image: previewImage,
          olusturulma_tarihi: report.olusturulma_tarihi,
        };
      }),
    );

    return res.status(200).json({
      basarili: true,
      raporlar,
    });
  } catch (error) {
    console.error("HASTA RAPORLARI HATASI:", error.message);

    return res.status(500).json({
      basarili: false,
      mesaj: "Raporlar getirilemedi.",
      hata: error.message,
    });
  }
};

exports.getMyReportById = async (req, res) => {
  try {
    const patient = await Patient.findOne({
      where: { user_id: req.user.id },
    });

    const patientUser = await User.findByPk(patient.user_id, {
      attributes: ["ad", "soyad", "dogum_tarihi"],
    });

    if (!patient) {
      return res.status(404).json({
        basarili: false,
        mesaj: "Hasta profili bulunamadı.",
      });
    }

    const report = await Report.findOne({
      where: {
        id: req.params.id,
        hasta_id: patient.id,
      },
    });

    if (!report) {
      return res.status(404).json({
        basarili: false,
        mesaj: "Rapor bulunamadı.",
      });
    }

    const analysis = await Analysis.findOne({
      where: {
        id: report.analiz_id,
        hasta_id: patient.id,
      },
    });

    if (!analysis) {
      return res.status(404).json({
        basarili: false,
        mesaj: "Analiz bulunamadı.",
      });
    }

    const slice = await AnalysisSlice.findOne({
      where: { analiz_id: analysis.id },
    });

    const metrikler = slice
      ? {
          patoloji_yuzdesi: slice.patoloji_yuzdesi,
          alan_mm2: slice.alan_mm2,
          cevre_mm: slice.cevre_mm,
          guven_skoru: slice.guven_skoru,
          dice_skoru: slice.dice_skoru,
          iou_skoru: slice.iou_skoru,
        }
      : {};

    let maskImage = null;

    if (slice?.maske_yolu) {
      maskImage = slice.maske_yolu.startsWith("data:image")
        ? slice.maske_yolu
        : `data:image/png;base64,${slice.maske_yolu}`;
    }

    let originalImage = null;

    if (slice?.goruntu_yolu) {
      originalImage = `${req.protocol}://${req.get("host")}/uploads/${slice.goruntu_yolu}`;
    }

    return res.status(200).json({
      basarili: true,
      rapor: {
        id: report.id,
        analiz_id: analysis.id,
        analiz_adi: analysis.analiz_adi || `Analiz #${analysis.id}`,
        tc_kimlik: patient.tc_kimlik,
        ad: patientUser?.ad || "",
        soyad: patientUser?.soyad || "",
        cinsiyet: patient.cinsiyet || null,
        kan_grubu: patient.kan_grubu || null,
        dogum_tarihi: patientUser?.dogum_tarihi || null,
        organ: analysis.organ,
        model: analysis.model,
        durum: analysis.durum,
        metrikler,
        original_image: originalImage,
        mask_image: maskImage,
        overlay_image: null,
        doktor_notu: report.doktor_notu,
        pdf_yolu: report.pdf_yolu,
        olusturulma_tarihi: report.olusturulma_tarihi,
      },
    });
  } catch (error) {
    console.error("HASTA RAPOR DETAY HATASI:", error.message);

    return res.status(500).json({
      basarili: false,
      mesaj: "Rapor detayı getirilemedi.",
      hata: error.message,
    });
  }
};

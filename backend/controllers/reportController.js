const { sequelize } = require("../config/db");

const Report = require("../models/Report");
const Patient = require("../models/Patient");
const notificationService = require("../services/notificationService");

exports.createReport = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const {
      tc_kimlik,
      analiz_id,
      doktor_id,
      pdf_yolu,
      doktor_notu,
    } = req.body;

    // ZORUNLU ALAN KONTROLÜ
    if (!doktor_id || !analiz_id || !tc_kimlik) {
      await transaction.rollback();

      return res.status(400).json({
        basarili: false,
        mesaj: "Zorunlu alanlar eksik.",
      });
    }

    // HASTAYI BUL
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

    // RAPORU KAYDET
    const yeniRapor = await Report.create(
      {
        analiz_id,
        hasta_id: hasta.id,
        doktor_id,
        pdf_yolu: pdf_yolu || "PDF-App-Generated",
        doktor_notu: doktor_notu?.trim() || null,
      },
      { transaction },
    );

    // HASTAYA BİLDİRİM OLUŞTUR
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
      mesaj: "Rapor ve doktor değerlendirmesi veritabanına kaydedildi.",
      rapor: yeniRapor,
    });
  } catch (error) {
    await transaction.rollback();

    console.error("Rapor Kayıt Hatası:", error);

    return res.status(500).json({
      basarili: false,
      mesaj: "Sunucu hatası",
      hata: error.message,
    });
  }
};
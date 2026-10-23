const { sequelize } = require("../config/db");

const reportRepository = require("../repositories/reportRepository");
const patientRepository = require("../repositories/patientRepository");
const userRepository = require("../repositories/userRepository");
const analysisRepository = require("../repositories/analysisRepository");
const analysisSliceRepository = require("../repositories/analysisSliceRepository");
const doctorRepository = require("../repositories/doctorRepository");

const notificationService = require("./notificationService");

const serviceError = (status, message) => {
  const error = new Error(message);
  error.status = status;

  return error;
};

const createReport = async (userId, data) => {
  const transaction = await sequelize.transaction();

  try {
    const { tc_kimlik, analiz_id, pdf_yolu, doktor_notu } = data;

    if (!analiz_id || !tc_kimlik) {
      throw serviceError(400, "Zorunlu alanlar eksik.");
    }

    const doctor = await doctorRepository.findByUserId(userId, transaction);

    if (!doctor) {
      throw serviceError(404, "Doktor kaydı bulunamadı.");
    }

    const patient = await patientRepository.findByTcKimlik(
      tc_kimlik,
      transaction,
    );

    if (!patient) {
      throw serviceError(404, "Hasta bulunamadı.");
    }

    const analysis = await analysisRepository.findByIdPatientAndDoctor(
      analiz_id,
      patient.id,
      doctor.id,
      transaction,
    );

    if (!analysis) {
      throw serviceError(404, "Analiz bulunamadı veya bu doktora ait değil.");
    }

    const report = await reportRepository.create(
      {
        analiz_id,
        hasta_id: patient.id,
        doktor_id: doctor.id,
        pdf_yolu: pdf_yolu || "Sistem üzerinden PDF alınabilir",
        doktor_notu: doktor_notu?.trim() || null,
      },
      transaction,
    );

    await notificationService.createFromEvent({
      kullaniciId: patient.user_id,
      tip: "report_created",
      metadata: {
        report_id: report.id,
        analysis_id: analiz_id,
      },
      transaction,
    });

    await transaction.commit();

    return report;
  } catch (error) {
    if (!transaction.finished) {
      await transaction.rollback();
    }

    throw error;
  }
};

const getMyReports = async (userId, baseUrl) => {
  const patient = await patientRepository.findByUserId(userId);

  if (!patient) {
    throw serviceError(404, "Hasta profili bulunamadı.");
  }

  const reports = await reportRepository.findByPatientId(patient.id);

  return Promise.all(
    reports.map(async (report) => {
      const [analysis, slice] = await Promise.all([
        analysisRepository.findById(report.analiz_id, [
          "id",
          "analiz_adi",
          "organ",
          "model",
          "durum",
        ]),

        analysisSliceRepository.findByAnalysisId(report.analiz_id, [
          "goruntu_yolu",
        ]),
      ]);

      const previewImage = slice?.goruntu_yolu
        ? `${baseUrl}/uploads/${slice.goruntu_yolu}`
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
};

const getMyReportById = async (userId, reportId, baseUrl) => {
  const patient = await patientRepository.findByUserId(userId);

  if (!patient) {
    throw serviceError(404, "Hasta profili bulunamadı.");
  }

  const patientUser = await userRepository.findById(patient.user_id, [
    "ad",
    "soyad",
    "dogum_tarihi",
  ]);

  const report = await reportRepository.findByIdAndPatientId(
    reportId,
    patient.id,
  );

  if (!report) {
    throw serviceError(404, "Rapor bulunamadı.");
  }

  const analysis = await analysisRepository.findByIdAndPatientId(
    report.analiz_id,
    patient.id,
  );

  if (!analysis) {
    throw serviceError(404, "Analiz bulunamadı.");
  }

  const slice = await analysisSliceRepository.findByAnalysisId(analysis.id);

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
    originalImage = `${baseUrl}/uploads/${slice.goruntu_yolu}`;
  }

  return {
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
  };
};

module.exports = {
  createReport,
  getMyReports,
  getMyReportById,
};

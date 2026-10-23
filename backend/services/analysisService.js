const axios = require("axios");
const fs = require("fs");
const FormData = require("form-data");
const path = require("path");

const analysisRepository = require("../repositories/analysisRepository");
const analysisSliceRepository = require("../repositories/analysisSliceRepository");
const patientRepository = require("../repositories/patientRepository");
const doctorRepository = require("../repositories/doctorRepository");
const reportRepository = require("../repositories/reportRepository");

const notificationService = require("./notificationService");

const serviceError = (status, message) => {
  const error = new Error(message);
  error.status = status;

  return error;
};

const predictAndSave = async ({ userId, modelAdi, file, data }) => {
  const { tc_kimlik, analiz_adi, organ, sira_no, klinik_id, preview_base64 } =
    data;

  if (!file) {
    throw serviceError(400, "Lütfen bir resim yükleyin.");
  }

  if (!tc_kimlik || !organ) {
    throw serviceError(400, "Hasta TC ve organ bilgisi zorunludur.");
  }

  if (!userId) {
    throw serviceError(
      401,
      "Oturum bilgisi bulunamadı. Lütfen tekrar giriş yapın.",
    );
  }

  const patient = await patientRepository.findByTcKimlik(tc_kimlik);

  if (!patient) {
    throw serviceError(
      404,
      `Sistemde ${tc_kimlik} TC numarasına sahip bir hasta kaydı bulunamadı.`,
    );
  }

  const doctor = await doctorRepository.findByUserId(userId);

  if (!doctor) {
    throw serviceError(
      404,
      "Giriş yapan kullanıcıya ait doktor kaydı bulunamadı.",
    );
  }

  const finalAnalizAdi =
    analiz_adi?.trim() ||
    `${
      organ === "beyin" ? "Beyin" : organ === "bobrek" ? "Böbrek" : "Medikal"
    } Analizi`;

  const pythonBaseUrl = process.env.PYTHON_API_URL || "http://localhost:8000";

  const pythonUrl = `${pythonBaseUrl}/predict/${organ}_${modelAdi}`;

  const formData = new FormData();

  if (file.buffer) {
    formData.append("dosya", file.buffer, {
      filename: file.originalname || "upload_image.jpg",

      contentType: file.mimetype || "image/jpeg",
    });
  } else if (file.path) {
    formData.append("dosya", fs.createReadStream(file.path), {
      filename: file.originalname || "upload_image.jpg",

      contentType: file.mimetype || "image/jpeg",
    });
  } else {
    throw serviceError(400, "Yüklenen dosya okunamadı.");
  }

  const response = await axios.post(pythonUrl, formData, {
    headers: {
      ...formData.getHeaders(),
    },
  });

  const aiResult = response.data;

  const analysis = await analysisRepository.create({
    hasta_id: patient.id,

    doktor_id: doctor.id,

    klinik_id: doctor.klinik_id || klinik_id || null,

    analiz_adi: finalAnalizAdi,

    organ,

    model: modelAdi,

    durum: "tamamlandi",
  });

  let browserImageName = file.filename || file.originalname || "";

  if (preview_base64?.startsWith("data:image/")) {
    const match = preview_base64.match(
      /^data:image\/(png|jpeg|jpg);base64,(.+)$/,
    );

    if (match) {
      const extension = match[1] === "jpeg" ? "jpg" : match[1];

      browserImageName = `preview-${Date.now()}.${extension}`;

      const uploadsDir = path.join(__dirname, "../uploads");

      fs.mkdirSync(uploadsDir, {
        recursive: true,
      });

      fs.writeFileSync(
        path.join(uploadsDir, browserImageName),
        Buffer.from(match[2], "base64"),
      );
    }
  }

  await analysisSliceRepository.create({
    analiz_id: analysis.id,

    goruntu_yolu: browserImageName,

    maske_yolu: aiResult.maske_base64 || "",

    patoloji_yuzdesi: aiResult.metrikler?.patoloji_yuzdesi ?? 0,

    alan_mm2: aiResult.metrikler?.alan_mm2 ?? 0,

    cevre_mm: aiResult.metrikler?.cevre_mm ?? 0,

    guven_skoru: aiResult.metrikler?.guven_skoru ?? 0,

    dice_skoru: aiResult.metrikler?.dice_skoru ?? null,

    iou_skoru: aiResult.metrikler?.iou_skoru ?? null,

    sira_no: sira_no || 1,
  });

  try {
    await notificationService.createFromEvent({
      kullaniciId: userId,

      tip: "analysis_completed",

      data: {
        analizId: analysis.id,
      },

      link: `/analyses/${analysis.id}`,

      metadata: {
        analysis_id: analysis.id,

        patient_id: patient.id,

        organ,

        model: modelAdi,
      },
    });
  } catch (error) {
    try {
      await notificationService.createFromEvent({
        kullaniciId: userId,

        tip: "analysis_failed",

        data: {},

        link: "/analyze",

        metadata: {
          organ: organ || null,

          model: modelAdi || null,
        },
      });
    } catch (notificationError) {
      console.error(
        "Analiz hata bildirimi oluşturulamadı:",
        notificationError.message,
      );
    }

    throw error;
  }

  return {
    analysis,
    aiResult,
  };
};

const getAnalysisById = async (analysisId, baseUrl) => {
  const analysis = await analysisRepository.findById(analysisId);

  if (!analysis) {
    throw serviceError(404, "Analiz bulunamadı.");
  }

  const [patient, slice, report] = await Promise.all([
    patientRepository.findById(analysis.hasta_id),

    analysisSliceRepository.findByAnalysisId(analysis.id),

    reportRepository.findLatestByAnalysisId(analysis.id),
  ]);

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
    id: analysis.id,

    analiz_adi: analysis.analiz_adi || `Analiz #${analysis.id}`,

    tc_kimlik: patient?.tc_kimlik || null,

    organ: analysis.organ,

    model: analysis.model,

    durum: analysis.durum,

    hasta_id: analysis.hasta_id,

    doktor_id: analysis.doktor_id,

    klinik_id: analysis.klinik_id,

    metrikler,

    mask_image: maskImage,

    original_image: originalImage,

    overlay_image: null,

    doktor_notu: report?.doktor_notu || null,

    created_at: report?.olusturulma_tarihi || null,
  };
};

module.exports = {
  predictAndSave,
  getAnalysisById,
};

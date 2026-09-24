const axios = require("axios");
const fs = require("fs");
const FormData = require("form-data");

const Analysis = require("../models/Analysis");
const AnalysisSlice = require("../models/AnalysisSlice");
const Patient = require("../models/Patient");
const Doctor = require("../models/Doctor");
const Report = require("../models/Report");

// =====================================================
// ANALİZ YAP VE KAYDET
// =====================================================

exports.predictAndSave = async (req, res) => {
  try {
    const modelAdi = req.params.model_adi;
    const file = req.file;

    const {
      tc_kimlik,
      organ,
      sira_no,
      klinik_id,
    } = req.body;

    // =====================================================
    // 1. TEMEL KONTROLLER
    // =====================================================

    if (!file) {
      return res.status(400).json({
        basarili: false,
        mesaj: "Lütfen bir resim yükleyin.",
      });
    }

    if (!tc_kimlik || !organ) {
      return res.status(400).json({
        basarili: false,
        mesaj: "Hasta TC ve organ bilgisi zorunludur.",
      });
    }

    if (!req.user || !req.user.id) {
      return res.status(401).json({
        basarili: false,
        mesaj:
          "Oturum bilgisi bulunamadı. Lütfen tekrar giriş yapın.",
      });
    }

    // =====================================================
    // 2. HASTAYI BUL
    // =====================================================

    const hasta = await Patient.findOne({
      where: {
        tc_kimlik: tc_kimlik,
      },
    });

    if (!hasta) {
      return res.status(404).json({
        basarili: false,
        mesaj: `Sistemde ${tc_kimlik} TC numarasına sahip bir hasta kaydı bulunamadı.`,
      });
    }

    // =====================================================
    // 3. DOKTORU BUL
    // =====================================================

    const doctor = await Doctor.findOne({
      where: {
        user_id: req.user.id,
      },
    });

    if (!doctor) {
      return res.status(404).json({
        basarili: false,
        mesaj:
          "Giriş yapan kullanıcıya ait doktor kaydı bulunamadı.",
      });
    }

    console.log("👤 User ID:", req.user.id);
    console.log("👨‍⚕️ Doctor ID:", doctor.id);
    console.log("🏥 Klinik ID:", doctor.klinik_id);

    // =====================================================
    // 4. PYTHON SERVİS ADRESİ
    // =====================================================

    const pythonUrl =
      `http://localhost:8000/predict/${organ}_${modelAdi}`;

    console.log(
      "🔍 Python'a İstek Atılan Adres:",
      pythonUrl
    );

    // =====================================================
    // 5. FASTAPI FORM DATA
    // =====================================================

    const formData = new FormData();

    if (file.buffer) {
      formData.append(
        "dosya",
        file.buffer,
        {
          filename:
            file.originalname || "upload_image.jpg",
          contentType:
            file.mimetype || "image/jpeg",
        }
      );
    } else if (file.path) {
      formData.append(
        "dosya",
        fs.createReadStream(file.path),
        {
          filename:
            file.originalname || "upload_image.jpg",
          contentType:
            file.mimetype || "image/jpeg",
        }
      );
    } else {
      return res.status(400).json({
        basarili: false,
        mesaj: "Yüklenen dosya okunamadı.",
      });
    }

    // =====================================================
    // 6. FASTAPI'YE İSTEK
    // =====================================================

    const response = await axios.post(
      pythonUrl,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
        },
      }
    );

    const aiResult = response.data;

    // =====================================================
    // 7. ANALYSIS KAYDI
    // =====================================================

    const analysis = await Analysis.create({
      hasta_id: hasta.id,

      doktor_id: doctor.id,

      klinik_id:
        doctor.klinik_id || klinik_id || null,

      organ: organ,

      model: modelAdi,

      durum: "tamamlandi",
    });

    // =====================================================
    // 8. ANALYSIS SLICE KAYDI
    // =====================================================

    await AnalysisSlice.create({
      analiz_id: analysis.id,

      goruntu_yolu:
        file.filename ||
        file.originalname ||
        "",

      maske_yolu:
        aiResult.maske_base64 || "",

      patoloji_yuzdesi:
        aiResult.metrikler?.patoloji_yuzdesi ?? 0,

      alan_mm2:
        aiResult.metrikler?.alan_mm2 ?? 0,

      cevre_mm:
        aiResult.metrikler?.cevre_mm ?? 0,

      guven_skoru:
        aiResult.metrikler?.guven_skoru ?? 0,

      dice_skoru:
        aiResult.metrikler?.dice_skoru ?? null,

      iou_skoru:
        aiResult.metrikler?.iou_skoru ?? null,

      sira_no:
        sira_no || 1,
    });

    // =====================================================
    // 9. RESPONSE
    // =====================================================

    return res.status(200).json({
      basarili: true,

      mesaj:
        "Analiz başarıyla tamamlandı ve kaydedildi.",

      analiz_id:
        analysis.id,

      sonuclar:
        aiResult,
    });

  } catch (error) {
    console.error(
      "❌ Detaylı Hata:",
      error.response?.data ||
      error.message
    );

    return res.status(500).json({
      basarili: false,

      mesaj:
        "Analiz işlemi sırasında hata oluştu.",

      hata:
        error.response?.data ||
        error.message,
    });
  }
};


// =====================================================
// ANALİZ DETAYINI GETİR
// GET /api/analyze/analyses/:id
// =====================================================

exports.getAnalysisById = async (req, res) => {
  try {
    const analizId = req.params.id;

    // =====================================================
    // 1. ANALİZİ BUL
    // =====================================================

    const analysis = await Analysis.findByPk(
      analizId
    );

    if (!analysis) {
      return res.status(404).json({
        basarili: false,
        mesaj: "Analiz bulunamadı.",
      });
    }

    // =====================================================
    // 2. HASTAYI BUL
    // =====================================================

    const hasta = await Patient.findByPk(
      analysis.hasta_id
    );

    // =====================================================
    // 3. ANALİZ SLICE BİLGİSİNİ BUL
    // =====================================================

    const slice = await AnalysisSlice.findOne({
      where: {
        analiz_id: analysis.id,
      },
    });

    // =====================================================
    // 4. METRİKLER
    // =====================================================

    const metrikler = slice
      ? {
          patoloji_yuzdesi:
            slice.patoloji_yuzdesi,

          alan_mm2:
            slice.alan_mm2,

          cevre_mm:
            slice.cevre_mm,

          guven_skoru:
            slice.guven_skoru,

          dice_skoru:
            slice.dice_skoru,

          iou_skoru:
            slice.iou_skoru,
        }
      : {};

    // =====================================================
    // 5. MASKE GÖRÜNTÜSÜ
    // =====================================================

    let maskImage = null;

    if (slice?.maske_yolu) {
      if (
        slice.maske_yolu.startsWith("data:image")
      ) {
        maskImage = slice.maske_yolu;
      } else {
        maskImage =
          `data:image/png;base64,${slice.maske_yolu}`;
      }
    }

    // =====================================================
    // 6. ORİJİNAL GÖRÜNTÜ
    // =====================================================

    let originalImage = null;

    if (slice?.goruntu_yolu) {
      originalImage =
        `${req.protocol}://${req.get("host")}/uploads/${slice.goruntu_yolu}`;
    }

    // =====================================================
    // 7. RESPONSE
    // =====================================================

    return res.status(200).json({
      basarili: true,

      analiz: {
        id:
          analysis.id,

        tc_kimlik:
          hasta?.tc_kimlik || null,

        organ:
          analysis.organ,

        model:
          analysis.model,

        durum:
          analysis.durum,

        hasta_id:
          analysis.hasta_id,

        doktor_id:
          analysis.doktor_id,

        klinik_id:
          analysis.klinik_id,

        metrikler:
          metrikler,

        mask_image:
          maskImage,

        original_image:
          originalImage,

        overlay_image:
          null,
      },
    });

  } catch (error) {
    console.error(
      "❌ Analiz detay hatası:",
      error.message
    );

    return res.status(500).json({
      basarili: false,

      mesaj:
        "Analiz bilgileri alınırken bir hata oluştu.",

      hata:
        error.message,
    });
  }
};
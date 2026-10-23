const analysisService = require("../services/analysisService");

const handleError = (res, error, defaultMessage, logLabel) => {
  console.error(`${logLabel}:`, error.response?.data || error.message);

  return res.status(error.status || 500).json({
    basarili: false,
    mesaj: error.status ? error.message : defaultMessage,
    ...(error.status
      ? {}
      : {
          hata: error.response?.data || error.message,
        }),
  });
};

exports.predictAndSave = async (req, res) => {
  try {
    const result = await analysisService.predictAndSave({
      userId: req.user?.id,
      modelAdi: req.params.model_adi,
      file: req.file,
      data: req.body,
    });

    return res.status(200).json({
      basarili: true,
      mesaj: "Analiz başarıyla tamamlandı ve kaydedildi.",
      analiz_id: result.analysis.id,
      analiz_adi: result.analysis.analiz_adi,
      sonuclar: result.aiResult,
    });
  } catch (error) {
    return handleError(
      res,
      error,
      "Analiz işlemi sırasında hata oluştu.",
      "ANALİZ HATASI",
    );
  }
};

exports.getAnalysisById = async (req, res) => {
  try {
    const baseUrl = `${req.protocol}://${req.get("host")}`;

    const analysis = await analysisService.getAnalysisById(
      req.params.id,
      baseUrl,
    );

    return res.status(200).json({
      basarili: true,
      analiz: analysis,
    });
  } catch (error) {
    return handleError(
      res,
      error,
      "Analiz bilgileri alınırken bir hata oluştu.",
      "ANALİZ DETAY HATASI",
    );
  }
};

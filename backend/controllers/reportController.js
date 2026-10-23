const reportService = require("../services/reportService");

const handleError = (res, error, defaultMessage, logLabel) => {
  console.error(`${logLabel}:`, error.message);

  return res.status(error.status || 500).json({
    basarili: false,

    mesaj: error.status ? error.message : defaultMessage,

    ...(error.status
      ? {}
      : {
          hata: error.message,
        }),
  });
};

exports.createReport = async (req, res) => {
  try {
    const report = await reportService.createReport(req.user.id, req.body);

    return res.status(201).json({
      basarili: true,
      mesaj: "Rapor başarıyla kaydedildi.",
      rapor: report,
    });
  } catch (error) {
    return handleError(
      res,
      error,
      "Rapor kaydedilirken bir hata oluştu.",
      "RAPOR KAYIT HATASI",
    );
  }
};

exports.getMyReports = async (req, res) => {
  try {
    const baseUrl = `${req.protocol}://${req.get("host")}`;

    const reports = await reportService.getMyReports(req.user.id, baseUrl);

    return res.status(200).json({
      basarili: true,
      raporlar: reports,
    });
  } catch (error) {
    return handleError(
      res,
      error,
      "Raporlar getirilemedi.",
      "HASTA RAPORLARI HATASI",
    );
  }
};

exports.getMyReportById = async (req, res) => {
  try {
    const baseUrl = `${req.protocol}://${req.get("host")}`;

    const report = await reportService.getMyReportById(
      req.user.id,
      req.params.id,
      baseUrl,
    );

    return res.status(200).json({
      basarili: true,
      rapor: report,
    });
  } catch (error) {
    return handleError(
      res,
      error,
      "Rapor detayı getirilemedi.",
      "HASTA RAPOR DETAY HATASI",
    );
  }
};

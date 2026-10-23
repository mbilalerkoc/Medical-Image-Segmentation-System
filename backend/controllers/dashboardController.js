const dashboardService = require("../services/dashboardService");

exports.getDashboard = async (req, res) => {
  try {
    const dashboard = await dashboardService.getDashboard(req.user.id);

    return res.status(200).json({
      basarili: true,
      ...dashboard,
    });
  } catch (error) {
    console.error("Dashboard hatası:", error.message);

    return res.status(error.status || 500).json({
      basarili: false,
      mesaj: error.status
        ? error.message
        : "Dashboard bilgileri alınırken bir hata oluştu.",
    });
  }
};

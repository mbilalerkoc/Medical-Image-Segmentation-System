const settingsService = require("../services/settingsService");

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

exports.updateProfile = async (req, res) => {
  try {
    const user = await settingsService.updateProfile(req.user.id, req.body);

    return res.status(200).json({
      basarili: true,
      mesaj: "Profil bilgileri başarıyla güncellendi.",
      user,
    });
  } catch (error) {
    return handleError(
      res,
      error,
      "Profil bilgileri güncellenirken bir hata oluştu.",
      "PROFİL GÜNCELLEME HATASI",
    );
  }
};

exports.changePassword = async (req, res) => {
  try {
    await settingsService.changePassword(req.user.id, req.body);

    return res.status(200).json({
      basarili: true,
      mesaj: "Şifreniz başarıyla güncellendi.",
    });
  } catch (error) {
    return handleError(
      res,
      error,
      "Şifre güncellenirken bir hata oluştu.",
      "ŞİFRE DEĞİŞTİRME HATASI",
    );
  }
};

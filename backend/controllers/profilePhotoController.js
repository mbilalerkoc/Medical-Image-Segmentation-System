const profilePhotoService = require("../services/profilePhotoService");

const uploadProfilePhoto = async (req, res) => {
  try {
    const result = await profilePhotoService.uploadProfilePhoto(
      req.user?.id,
      req.file,
    );

    return res.status(200).json({
      basarili: true,
      mesaj: "Profil fotoğrafı güncellendi.",
      profil_resmi: result.profil_resmi,
      user: result.user,
    });
  } catch (error) {
    console.error("PROFİL FOTOĞRAFI HATASI:", error.message);

    return res.status(error.status || 500).json({
      basarili: false,
      mesaj: error.status
        ? error.message
        : "Profil fotoğrafı yüklenirken bir hata oluştu.",
    });
  }
};

const deleteProfilePhoto = async (req, res) => {
  try {
    const result = await profilePhotoService.deleteProfilePhoto(req.user?.id);

    return res.status(200).json({
      basarili: true,
      mesaj: "Profil fotoğrafı kaldırıldı.",
      profil_resmi: result.profil_resmi,
    });
  } catch (error) {
    console.error("PROFİL FOTOĞRAFI SİLME HATASI:", error.message);

    return res.status(error.status || 500).json({
      basarili: false,
      mesaj: error.status
        ? error.message
        : "Profil fotoğrafı kaldırılırken bir hata oluştu.",
    });
  }
};

module.exports = {
  uploadProfilePhoto,
  deleteProfilePhoto,
};

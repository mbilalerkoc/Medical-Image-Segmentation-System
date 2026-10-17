const fs = require("fs");
const path = require("path");
const User = require("../models/User");

const removeFile = async (filePath) => {
  if (!filePath) return;

  try {
    await fs.promises.unlink(filePath);
  } catch (error) {
    if (error.code !== "ENOENT") {
      console.error("Dosya silme hatası:", error);
    }
  }
};

const getUserId = (req) => {
  return req.user?.id || req.user?.userId || req.user?.user_id || null;
};

const uploadProfilePhoto = async (req, res) => {
  try {
    console.log("REQ USER:", req.user);
    console.log("REQ FILE:", req.file);

    const userId = getUserId(req);

    if (!userId) {
      if (req.file?.path) {
        await removeFile(req.file.path);
      }

      return res.status(401).json({
        basarili: false,
        mesaj: "Kullanıcı bilgisi bulunamadı.",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        basarili: false,
        mesaj: "Lütfen bir profil fotoğrafı seçin.",
      });
    }

    const user = await User.findByPk(userId);

    if (!user) {
      await removeFile(req.file.path);

      return res.status(404).json({
        basarili: false,
        mesaj: "Kullanıcı bulunamadı.",
      });
    }

    const oldProfilePhoto = user.profil_resmi;
    const newProfilePhoto = `/uploads/profile/${req.file.filename}`;

    await user.update({
      profil_resmi: newProfilePhoto,
    });

    if (oldProfilePhoto && oldProfilePhoto.startsWith("/uploads/profile/")) {
      const oldFilePath = path.join(
        __dirname,
        "..",
        oldProfilePhoto.replace(/^\/+/, ""),
      );

      await removeFile(oldFilePath);
    }

    return res.status(200).json({
      basarili: true,
      mesaj: "Profil fotoğrafı güncellendi.",
      profil_resmi: newProfilePhoto,
      user: {
        id: user.id,
        ad: user.ad,
        soyad: user.soyad,
        email: user.email,
        telefon: user.telefon,
        rol: user.rol,
        profil_resmi: newProfilePhoto,
      },
    });
  } catch (error) {
    console.error("PROFİL FOTOĞRAFI HATASI:", error);

    if (req.file?.path) {
      await removeFile(req.file.path);
    }

    return res.status(500).json({
      basarili: false,
      mesaj: error.message || "Profil fotoğrafı yüklenirken bir hata oluştu.",
    });
  }
};

const deleteProfilePhoto = async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        basarili: false,
        mesaj: "Kullanıcı bilgisi bulunamadı.",
      });
    }

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({
        basarili: false,
        mesaj: "Kullanıcı bulunamadı.",
      });
    }

    const oldProfilePhoto = user.profil_resmi;

    await user.update({
      profil_resmi: null,
    });

    if (oldProfilePhoto && oldProfilePhoto.startsWith("/uploads/profile/")) {
      const oldFilePath = path.join(
        __dirname,
        "..",
        oldProfilePhoto.replace(/^\/+/, ""),
      );

      await removeFile(oldFilePath);
    }

    return res.status(200).json({
      basarili: true,
      mesaj: "Profil fotoğrafı kaldırıldı.",
      profil_resmi: null,
    });
  } catch (error) {
    console.error("PROFİL FOTOĞRAFI SİLME HATASI:", error);

    return res.status(500).json({
      basarili: false,
      mesaj: error.message || "Profil fotoğrafı kaldırılırken bir hata oluştu.",
    });
  }
};

module.exports = {
  uploadProfilePhoto,
  deleteProfilePhoto,
};

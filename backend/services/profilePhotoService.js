const fs = require("fs");
const path = require("path");

const userRepository = require("../repositories/userRepository");

const serviceError = (status, message) => {
  const error = new Error(message);
  error.status = status;

  return error;
};

const removeFile = async (filePath) => {
  if (!filePath) return;

  try {
    await fs.promises.unlink(filePath);
  } catch (error) {
    if (error.code !== "ENOENT") {
      console.error("Dosya silme hatası:", error.message);
    }
  }
};

const getProfileFilePath = (profilePhoto) => {
  return path.join(__dirname, "..", profilePhoto.replace(/^\/+/, ""));
};

const uploadProfilePhoto = async (userId, file) => {
  if (!userId) {
    if (file?.path) {
      await removeFile(file.path);
    }

    throw serviceError(401, "Kullanıcı bilgisi bulunamadı.");
  }

  if (!file) {
    throw serviceError(400, "Lütfen bir profil fotoğrafı seçin.");
  }

  const user = await userRepository.findById(userId);

  if (!user) {
    await removeFile(file.path);

    throw serviceError(404, "Kullanıcı bulunamadı.");
  }

  const oldProfilePhoto = user.profil_resmi;

  const newProfilePhoto = `/uploads/profile/${file.filename}`;

  user.profil_resmi = newProfilePhoto;

  try {
    await userRepository.save(user);
  } catch (error) {
    await removeFile(file.path);
    throw error;
  }

  if (oldProfilePhoto && oldProfilePhoto.startsWith("/uploads/profile/")) {
    await removeFile(getProfileFilePath(oldProfilePhoto));
  }

  return {
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
  };
};

const deleteProfilePhoto = async (userId) => {
  if (!userId) {
    throw serviceError(401, "Kullanıcı bilgisi bulunamadı.");
  }

  const user = await userRepository.findById(userId);

  if (!user) {
    throw serviceError(404, "Kullanıcı bulunamadı.");
  }

  const oldProfilePhoto = user.profil_resmi;

  user.profil_resmi = null;

  await userRepository.save(user);

  if (oldProfilePhoto && oldProfilePhoto.startsWith("/uploads/profile/")) {
    await removeFile(getProfileFilePath(oldProfilePhoto));
  }

  return {
    profil_resmi: null,
  };
};

module.exports = {
  uploadProfilePhoto,
  deleteProfilePhoto,
};

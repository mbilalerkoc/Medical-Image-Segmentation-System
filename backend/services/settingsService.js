const bcrypt = require("bcryptjs");

const userRepository = require("../repositories/userRepository");
const doctorRepository = require("../repositories/doctorRepository");

const notificationService = require("./notificationService");

const serviceError = (status, message) => {
  const error = new Error(message);
  error.status = status;

  return error;
};

const updateProfile = async (userId, data) => {
  const { ad, soyad, email, telefon } = data;

  if (!ad?.trim() || !soyad?.trim() || !email?.trim()) {
    throw serviceError(400, "Ad, soyad ve e-posta alanları zorunludur.");
  }

  const user = await userRepository.findById(userId);

  if (!user) {
    throw serviceError(404, "Kullanıcı bulunamadı.");
  }

  const existingEmail = await userRepository.findByEmailExceptUserId(
    email.trim(),
    userId,
  );

  if (existingEmail) {
    throw serviceError(
      409,
      "Bu e-posta adresi başka bir kullanıcı tarafından kullanılıyor.",
    );
  }

  user.ad = ad.trim();
  user.soyad = soyad.trim();
  user.email = email.trim();
  user.telefon = telefon?.trim() || null;

  await userRepository.save(user);

  const doctor =
    user.rol === "doktor" ? await doctorRepository.findByUserId(userId) : null;

  return {
    id: user.id,
    ad: user.ad,
    soyad: user.soyad,
    email: user.email,
    telefon: user.telefon,
    profil_resmi: user.profil_resmi,
    rol: user.rol,
    unvan: doctor?.unvan || null,
    klinik_id: doctor?.klinik_id || null,
  };
};

const changePassword = async (userId, data) => {
  const { mevcut_sifre, yeni_sifre, yeni_sifre_tekrar } = data;

  if (!mevcut_sifre || !yeni_sifre || !yeni_sifre_tekrar) {
    throw serviceError(
      400,
      "Mevcut şifre, yeni şifre ve şifre tekrarı zorunludur.",
    );
  }

  if (yeni_sifre !== yeni_sifre_tekrar) {
    throw serviceError(400, "Yeni şifreler birbiriyle eşleşmiyor.");
  }

  if (yeni_sifre.length < 6) {
    throw serviceError(400, "Yeni şifre en az 6 karakter olmalıdır.");
  }

  const user = await userRepository.findById(userId);

  if (!user) {
    throw serviceError(404, "Kullanıcı bulunamadı.");
  }

  if (!user.sifre) {
    throw serviceError(400, "Kullanıcının mevcut şifre kaydı bulunamadı.");
  }

  const mevcutSifreDogru = await bcrypt.compare(mevcut_sifre, user.sifre);

  if (!mevcutSifreDogru) {
    throw serviceError(401, "Mevcut şifreniz yanlış.");
  }

  const eskiSifreyleAyni = await bcrypt.compare(yeni_sifre, user.sifre);

  if (eskiSifreyleAyni) {
    throw serviceError(
      400,
      "Yeni şifreniz mevcut şifrenizden farklı olmalıdır.",
    );
  }

  const salt = await bcrypt.genSalt(10);

  user.sifre = await bcrypt.hash(yeni_sifre, salt);

  await userRepository.save(user);

  try {
    await notificationService.createFromEvent({
      kullaniciId: userId,
      tip: "password_changed",
      link: user.rol === "hasta" ? "/patient/settings" : "/settings",
      metadata: {
        user_id: userId,
      },
    });
  } catch (notificationError) {
    console.error(
      "Şifre değişikliği bildirimi oluşturulamadı:",
      notificationError.message,
    );
  }
};

module.exports = {
  updateProfile,
  changePassword,
};

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const { sequelize } = require("../config/db");

const userRepository = require("../repositories/userRepository");
const doctorRepository = require("../repositories/doctorRepository");
const patientRepository = require("../repositories/patientRepository");

const notificationService = require("./notificationService");

const serviceError = (status, message) => {
  const error = new Error(message);
  error.status = status;

  return error;
};

const createToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      rol: user.rol,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "30d",
    },
  );
};

const formatUserResponse = (user, doctor = null) => {
  const kullanici = {
    id: user.id,
    ad: user.ad,
    soyad: user.soyad,
    email: user.email,
    rol: user.rol,
  };

  if (user.rol === "doktor" && doctor) {
    kullanici.klinik_id = doctor.klinik_id;

    kullanici.klinik_adi = doctor.Klinik?.ad || "Klinik Atanmamış";

    kullanici.unvan = doctor.unvan;
  }

  return kullanici;
};

const login = async (email, sifre) => {
  if (!email || !sifre) {
    throw serviceError(400, "E-posta ve şifre zorunludur.");
  }

  const user = await userRepository.findByEmail(email);

  if (!user) {
    throw serviceError(401, "Geçersiz e-posta veya şifre.");
  }

  if (!user.sifre) {
    throw serviceError(
      403,
      "Şifrenizi henüz belirlemediniz. Lütfen e-postanızı kontrol edin.",
    );
  }

  const isMatch = await bcrypt.compare(sifre, user.sifre);

  if (!isMatch) {
    throw serviceError(401, "Geçersiz e-posta veya şifre.");
  }

  if (!user.aktif) {
    throw serviceError(
      403,
      "Hesabınız aktif değil. Lütfen yöneticiyle iletişime geçin.",
    );
  }

  let doctor = null;

  if (user.rol === "doktor") {
    doctor = await doctorRepository.findByUserIdWithClinic(user.id);
  }

  return {
    token: createToken(user),

    kullanici: formatUserResponse(user, doctor),
  };
};

const setPassword = async (token, sifre) => {
  if (!token || !sifre) {
    throw serviceError(400, "Token ve şifre zorunludur.");
  }

  if (sifre.length < 6) {
    throw serviceError(400, "Şifre en az 6 karakter olmalıdır.");
  }

  let decoded;

  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw serviceError(400, "Geçersiz veya süresi dolmuş link.");
  }

  const user = await userRepository.findById(decoded.id);

  if (!user) {
    throw serviceError(404, "Kullanıcı bulunamadı.");
  }

  const salt = await bcrypt.genSalt(10);

  user.sifre = await bcrypt.hash(sifre, salt);

  user.aktif = true;

  await userRepository.save(user);

  if (user.rol === "hasta") {
    try {
      const patient = await patientRepository.findByUserId(user.id);

      if (patient) {
        const doctor = await doctorRepository.findById(patient.doktor_id);

        if (doctor?.user_id) {
          await notificationService.createFromEvent({
            kullaniciId: doctor.user_id,

            tip: "patient_account_activated",

            data: {
              hastaAdi: `${user.ad} ${user.soyad}`.trim(),
            },

            link: `/patients/${patient.id}`,

            metadata: {
              patient_id: patient.id,

              user_id: user.id,
            },
          });
        }
      }
    } catch (notificationError) {
      console.error(
        "Hasta aktivasyon bildirimi oluşturulamadı:",
        notificationError.message,
      );
    }
  }

  let doctor = null;

  if (user.rol === "doktor") {
    doctor = await doctorRepository.findByUserIdWithClinic(user.id);
  }

  return {
    token: createToken(user),

    kullanici: formatUserResponse(user, doctor),
  };
};

const createDoctor = async (data) => {
  const transaction = await sequelize.transaction();

  try {
    const {
      ad,
      soyad,
      email,
      sifre,
      tc_kimlik,
      telefon,
      unvan,
      uzmanlik,
      organ,
      klinik_id,
    } = data;

    if (!ad || !soyad || !email || !sifre || !unvan || !uzmanlik || !organ) {
      throw serviceError(400, "Eksik bilgi girdiniz.");
    }

    const existingUser = await userRepository.findByEmail(email, transaction);

    if (existingUser) {
      throw serviceError(400, "Bu e-posta adresi sistemde zaten kayıtlı.");
    }

    const salt = await bcrypt.genSalt(10);

    const hashedPassword = await bcrypt.hash(sifre, salt);

    const newDoctorUser = await userRepository.create(
      {
        ad,
        soyad,
        email,

        sifre: hashedPassword,

        rol: "doktor",

        tc_kimlik: tc_kimlik || null,

        telefon: telefon || null,

        aktif: true,
      },
      transaction,
    );

    await doctorRepository.create(
      {
        user_id: newDoctorUser.id,

        unvan,

        uzmanlik,

        organ,

        klinik_id: klinik_id || null,
      },
      transaction,
    );

    await transaction.commit();

    return {
      id: newDoctorUser.id,
      ad: newDoctorUser.ad,
      email: newDoctorUser.email,
    };
  } catch (error) {
    if (!transaction.finished) {
      await transaction.rollback();
    }

    throw error;
  }
};

module.exports = {
  login,
  setPassword,
  createDoctor,
};

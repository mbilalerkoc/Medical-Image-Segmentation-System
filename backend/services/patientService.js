const jwt = require("jsonwebtoken");

const { sequelize } = require("../config/db");

const userRepository = require("../repositories/userRepository");
const doctorRepository = require("../repositories/doctorRepository");
const patientRepository = require("../repositories/patientRepository");
const analysisRepository = require("../repositories/analysisRepository");
const reportRepository = require("../repositories/reportRepository");
const appointmentRepository = require("../repositories/appointmentRepository");

const notificationService = require("./notificationService");
const mailService = require("./mailService");

const serviceError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;

  return error;
};

const addPatient = async (userId, data) => {
  const transaction = await sequelize.transaction();

  try {
    const doctor = await doctorRepository.findByUserId(userId, transaction);

    if (!doctor) {
      throw serviceError(403, "Doktor profili bulunamadı.");
    }

    const existingUser = await userRepository.findByTcKimlik(
      data.tc_kimlik,
      transaction,
    );

    if (existingUser) {
      throw serviceError(400, "Bu TC Kimlik numarası zaten kayıtlı.");
    }

    const newUser = await userRepository.create(
      {
        ad: data.ad,
        soyad: data.soyad,
        email: data.email,
        tc_kimlik: data.tc_kimlik,
        telefon: data.telefon || null,
        dogum_tarihi: data.dogum_tarihi || null,
        rol: "hasta",
        aktif: false,
        sifre: null,
      },
      transaction,
    );

    const newPatient = await patientRepository.create(
      {
        user_id: newUser.id,
        doktor_id: doctor.id,
        tc_kimlik: data.tc_kimlik,
        cinsiyet: data.cinsiyet || null,
        kan_grubu: data.kan_grubu || null,
        adres: data.adres || "",
      },
      transaction,
    );

    await notificationService.createFromEvent({
      kullaniciId: userId,
      tip: "patient_assigned",
      data: {
        hastaAdi: `${newUser.ad} ${newUser.soyad}`.trim(),
      },
      link: `/patients/${newPatient.id}`,
      metadata: {
        patient_id: newPatient.id,
        user_id: newUser.id,
      },
      transaction,
    });

    await transaction.commit();

    const inviteToken = jwt.sign(
      {
        id: newUser.id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      },
    );

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

    const inviteLink = `${frontendUrl}/set-password?token=${inviteToken}`;

    let mailSent = false;

    try {
      await mailService.sendPatientInvitation({
        email: newUser.email,
        ad: newUser.ad,
        soyad: newUser.soyad,
        inviteLink,
      });

      mailSent = true;
    } catch (mailError) {
      console.error("HASTA DAVET MAILİ GÖNDERİLEMEDİ:", mailError.message);
    }

    return {
      patient: newPatient,
      mailSent,
      inviteLink,
    };
  } catch (error) {
    if (!transaction.finished) {
      await transaction.rollback();
    }

    throw error;
  }
};

const getPatients = async (userId) => {
  const doctor = await doctorRepository.findByUserId(userId);

  if (!doctor) {
    throw serviceError(403, "Doktor profili bulunamadı.");
  }

  const patients = await patientRepository.findByDoctorIdWithUser(doctor.id);

  return patients.map((patient) => ({
    id: patient.id,
    tc_kimlik: patient.tc_kimlik,
    ad: patient.User?.ad || "",
    soyad: patient.User?.soyad || "",
    email: patient.User?.email || "",
    telefon: patient.User?.telefon || "",
    dogum_tarihi: patient.User?.dogum_tarihi || null,
    cinsiyet: patient.cinsiyet || null,
    kan_grubu: patient.kan_grubu || null,
    adres: patient.adres || "",
    User: {
      aktif: patient.User?.aktif || false,
    },
  }));
};

const getMyDashboard = async (userId) => {
  const patient = await patientRepository.findByUserIdWithUser(userId);

  if (!patient) {
    throw serviceError(404, "Hasta profili bulunamadı.");
  }

  const now = new Date();

  const [
    analysisCount,
    reportCount,
    upcomingAppointmentCount,
    recentAnalyses,
    upcomingAppointments,
  ] = await Promise.all([
    analysisRepository.countByPatientId(patient.id),

    reportRepository.countByPatientId(patient.id),

    appointmentRepository.countUpcomingByPatientId(patient.id, now),

    analysisRepository.findRecentByPatientId(patient.id, 5),

    appointmentRepository.findUpcomingByPatientId(patient.id, 3, now),
  ]);

  return {
    hasta: {
      id: patient.id,
      ad: patient.User?.ad || "",
      soyad: patient.User?.soyad || "",
      email: patient.User?.email || "",
      telefon: patient.User?.telefon || "",
      dogum_tarihi: patient.User?.dogum_tarihi || null,
      tc_kimlik: patient.tc_kimlik,
      cinsiyet: patient.cinsiyet || null,
      kan_grubu: patient.kan_grubu || null,
      adres: patient.adres || "",
    },

    istatistikler: {
      toplam_analiz: analysisCount,
      toplam_rapor: reportCount,
      yaklasan_randevu: upcomingAppointmentCount,
    },

    son_analizler: recentAnalyses,

    yaklasan_randevular: upcomingAppointments,
  };
};

const getMyAnalyses = async (userId) => {
  const patient = await patientRepository.findByUserId(userId);

  if (!patient) {
    throw serviceError(404, "Hasta profili bulunamadı.");
  }

  const analyses = await analysisRepository.findByPatientId(patient.id);

  return Promise.all(
    analyses.map(async (analysis) => {
      const report = await reportRepository.findLatestByAnalysisId(
        analysis.id,
        patient.id,
      );

      return {
        id: analysis.id,

        analiz_adi: analysis.analiz_adi || `Analiz #${analysis.id}`,

        organ: analysis.organ,
        model: analysis.model,
        durum: analysis.durum,

        rapor_var: Boolean(report),

        tarih: report?.olusturulma_tarihi || null,
      };
    }),
  );
};

const getPatientById = async (userId, patientId) => {
  const doctor = await doctorRepository.findByUserId(userId);

  if (!doctor) {
    throw serviceError(403, "Doktor profili bulunamadı.");
  }

  const patient = await patientRepository.findByIdWithUser(patientId);

  if (!patient) {
    throw serviceError(404, "Hasta bulunamadı.");
  }

  if (Number(patient.doktor_id) !== Number(doctor.id)) {
    throw serviceError(403, "Bu hastayı görüntüleme yetkiniz bulunmuyor.");
  }

  const analyses = await analysisRepository.findByPatientId(patient.id);

  const formattedAnalyses = await Promise.all(
    analyses.map(async (analysis) => {
      const report = await reportRepository.findLatestByAnalysisId(analysis.id);

      return {
        id: analysis.id,

        analiz_adi: analysis.analiz_adi || `Analiz #${analysis.id}`,

        organ: analysis.organ,
        model: analysis.model,
        durum: analysis.durum,

        tarih: report?.olusturulma_tarihi || null,

        doktor_notu: report?.doktor_notu || null,
      };
    }),
  );

  return {
    hasta: {
      id: patient.id,
      tc_kimlik: patient.tc_kimlik,
      ad: patient.User?.ad || "",
      soyad: patient.User?.soyad || "",
      email: patient.User?.email || "",
      telefon: patient.User?.telefon || "",
      dogum_tarihi: patient.User?.dogum_tarihi || null,
      cinsiyet: patient.cinsiyet || null,
      kan_grubu: patient.kan_grubu || null,
      adres: patient.adres || "",
      aktif: patient.User?.aktif || false,
    },

    analizler: formattedAnalyses,
  };
};

module.exports = {
  addPatient,
  getPatients,
  getMyDashboard,
  getMyAnalyses,
  getPatientById,
};

const doctorRepository = require("../repositories/doctorRepository");
const patientRepository = require("../repositories/patientRepository");
const analysisRepository = require("../repositories/analysisRepository");
const appointmentRepository = require("../repositories/appointmentRepository");
const reportRepository = require("../repositories/reportRepository");

const serviceError = (status, message) => {
  const error = new Error(message);
  error.status = status;

  return error;
};

const getDashboard = async (userId) => {
  const doctor = await doctorRepository.findByUserId(userId);

  if (!doctor) {
    throw serviceError(404, "Doktor kaydı bulunamadı.");
  }

  const now = new Date();

  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);

  const todayEnd = new Date(todayStart);
  todayEnd.setDate(todayEnd.getDate() + 1);

  const [
    toplamHasta,
    toplamAnaliz,
    tamamlananAnaliz,
    bekleyenAnaliz,
    bugunkuRandevu,
    yaklasanRandevu,
    analyses,
    appointments,
  ] = await Promise.all([
    patientRepository.countByDoctorId(doctor.id),

    analysisRepository.countByDoctorId(doctor.id),

    analysisRepository.countCompletedByDoctorId(doctor.id),

    analysisRepository.countPendingByDoctorId(doctor.id),

    appointmentRepository.countTodayByDoctorId(doctor.id, todayStart, todayEnd),

    appointmentRepository.countUpcomingByDoctorId(doctor.id, now),

    analysisRepository.findRecentByDoctorId(doctor.id, 6),

    appointmentRepository.findTodayByDoctorId(
      doctor.id,
      todayStart,
      todayEnd,
      6,
    ),
  ]);

  const patientIds = [
    ...new Set([
      ...analyses.map((analysis) => analysis.hasta_id),
      ...appointments.map((appointment) => appointment.hasta_id),
    ]),
  ];

  const patients =
    patientIds.length > 0
      ? await patientRepository.findByIdsWithUser(patientIds)
      : [];

  const patientMap = {};

  patients.forEach((patient) => {
    patientMap[patient.id] = patient;
  });

  const analysisIds = analyses.map((analysis) => analysis.id);

  const reports =
    analysisIds.length > 0
      ? await reportRepository.findByAnalysisIds(analysisIds)
      : [];

  const reportMap = {};

  reports.forEach((report) => {
    if (!reportMap[report.analiz_id]) {
      reportMap[report.analiz_id] = report;
    }
  });

  const sonAnalizler = analyses.map((analysis) => {
    const patient = patientMap[analysis.hasta_id];

    const report = reportMap[analysis.id];

    return {
      id: analysis.id,

      analiz_adi: analysis.analiz_adi || `Analiz #${analysis.id}`,

      hasta_id: analysis.hasta_id,

      hasta_adi: patient?.User
        ? `${patient.User.ad || ""} ${patient.User.soyad || ""}`.trim()
        : "-",

      tc_kimlik: patient?.tc_kimlik || "-",

      organ: analysis.organ,

      model: analysis.model,

      durum: analysis.durum,

      tarih: report?.olusturulma_tarihi || analysis.olusturulma_tarihi,
    };
  });

  const bugunkuRandevular = appointments.map((appointment) => {
    const patient = patientMap[appointment.hasta_id];

    return {
      id: appointment.id,

      hasta_id: appointment.hasta_id,

      hasta_adi: patient?.User
        ? `${patient.User.ad || ""} ${patient.User.soyad || ""}`.trim()
        : "-",

      tc_kimlik: patient?.tc_kimlik || "-",

      telefon: patient?.User?.telefon || null,

      tarih_saat: appointment.tarih_saat,

      sure_dakika: appointment.sure_dakika,

      randevu_nedeni: appointment.randevu_nedeni,

      durum: appointment.durum,
    };
  });

  return {
    istatistikler: {
      toplam_hasta: toplamHasta,

      toplam_analiz: toplamAnaliz,

      tamamlanan_analiz: tamamlananAnaliz,

      bekleyen_analiz: bekleyenAnaliz,

      bugunku_randevu: bugunkuRandevu,

      yaklasan_randevu: yaklasanRandevu,
    },

    son_analizler: sonAnalizler,

    bugunku_randevular: bugunkuRandevular,
  };
};

module.exports = {
  getDashboard,
};

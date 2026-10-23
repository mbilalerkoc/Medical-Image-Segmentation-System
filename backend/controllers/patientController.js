const patientService = require("../services/patientService");

exports.addPatient = async (req, res) => {
  try {
    const result = await patientService.addPatient(req.user.id, req.body);

    return res.status(201).json({
      basarili: true,

      mesaj: result.mailSent
        ? "Hasta başarıyla eklendi ve davet e-postası gönderildi."
        : "Hasta başarıyla eklendi ancak davet e-postası gönderilemedi.",

      mail_gonderildi: result.mailSent,

      davet_linki: result.inviteLink,

      hasta: result.patient,
    });
  } catch (error) {
    console.error("PATIENT KAYIT HATASI:", error.message);

    return res.status(error.statusCode || 500).json({
      basarili: false,
      mesaj: error.statusCode ? error.message : "Hasta eklenirken hata oluştu.",
      detay: error.statusCode ? undefined : error.message,
    });
  }
};

exports.getPatients = async (req, res) => {
  try {
    const patients = await patientService.getPatients(req.user.id);

    return res.status(200).json({
      basarili: true,
      hastalar: patients,
    });
  } catch (error) {
    console.error("GET PATIENTS HATASI:", error.message);

    return res.status(error.statusCode || 500).json({
      basarili: false,
      mesaj: error.statusCode ? error.message : "Hastalar getirilemedi.",
      hata: error.statusCode ? undefined : error.message,
    });
  }
};

exports.getMyDashboard = async (req, res) => {
  try {
    const dashboard = await patientService.getMyDashboard(req.user.id);

    return res.status(200).json({
      basarili: true,
      ...dashboard,
    });
  } catch (error) {
    console.error("HASTA DASHBOARD HATASI:", error.message);

    return res.status(error.statusCode || 500).json({
      basarili: false,
      mesaj: error.statusCode
        ? error.message
        : "Dashboard bilgileri getirilemedi.",
      hata: error.statusCode ? undefined : error.message,
    });
  }
};

exports.getMyAnalyses = async (req, res) => {
  try {
    const analyses = await patientService.getMyAnalyses(req.user.id);

    return res.status(200).json({
      basarili: true,
      analizler: analyses,
    });
  } catch (error) {
    console.error("HASTA ANALİZLERİ HATASI:", error.message);

    return res.status(error.statusCode || 500).json({
      basarili: false,
      mesaj: error.statusCode ? error.message : "Analizler getirilemedi.",
      hata: error.statusCode ? undefined : error.message,
    });
  }
};

exports.getPatientById = async (req, res) => {
  try {
    const result = await patientService.getPatientById(
      req.user.id,
      req.params.id,
    );

    return res.status(200).json({
      basarili: true,
      ...result,
    });
  } catch (error) {
    console.error("HASTA DETAY HATASI:", error.message);

    return res.status(error.statusCode || 500).json({
      basarili: false,
      mesaj: error.statusCode ? error.message : "Hasta detayları getirilemedi.",
      hata: error.statusCode ? undefined : error.message,
    });
  }
};

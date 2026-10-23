const appointmentService = require("../services/appointmentService");

const handleError = (res, error) => {
  console.error("Randevu işlemi hatası:", error.message);

  return res.status(error.status || 500).json({
    basarili: false,
    mesaj: error.status
      ? error.message
      : "Randevu işlemi sırasında bir hata oluştu.",
  });
};

exports.getAppointments = async (req, res) => {
  try {
    const filter = req.query.filter || "all";

    const allowedFilters = ["all", "today", "upcoming", "past", "cancelled"];

    if (!allowedFilters.includes(filter)) {
      return res.status(400).json({
        basarili: false,
        mesaj: "Geçersiz randevu filtresi.",
      });
    }

    const appointments = await appointmentService.getDoctorAppointments(
      req.user.id,
      filter,
    );

    return res.status(200).json({
      basarili: true,
      toplam: appointments.length,
      randevular: appointments,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

exports.createAppointment = async (req, res) => {
  try {
    const appointment = await appointmentService.createAppointment(
      req.user.id,
      req.body,
    );

    return res.status(201).json({
      basarili: true,
      mesaj: "Randevu başarıyla oluşturuldu.",
      randevu: appointment,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { durum } = req.body;

    if (!durum) {
      return res.status(400).json({
        basarili: false,
        mesaj: "Randevu durumu zorunludur.",
      });
    }

    const appointment = await appointmentService.updateAppointmentStatus(
      req.user.id,
      req.params.id,
      durum,
    );

    return res.status(200).json({
      basarili: true,
      mesaj: "Randevu durumu güncellendi.",
      randevu: appointment,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

exports.getAvailability = async (req, res) => {
  try {
    const availability = await appointmentService.getDoctorAvailability(
      req.user.id,
    );

    return res.status(200).json({
      basarili: true,
      musaitlikler: availability,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

exports.saveAvailability = async (req, res) => {
  try {
    const { musaitlikler } = req.body;

    const availability = await appointmentService.saveDoctorAvailability(
      req.user.id,
      musaitlikler,
    );

    return res.status(200).json({
      basarili: true,
      mesaj: "Doktor müsaitlik bilgileri güncellendi.",
      musaitlikler: availability,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

exports.getAvailableSlots = async (req, res) => {
  try {
    const { date, duration = 30 } = req.query;

    if (!date) {
      return res.status(400).json({
        basarili: false,
        mesaj: "Tarih bilgisi zorunludur.",
      });
    }

    const result = await appointmentService.getAvailableSlots(
      req.user.id,
      date,
      Number(duration),
    );

    return res.status(200).json({
      basarili: true,
      tarih: result.tarih,
      gun: result.gun,
      sure_dakika: result.sure_dakika,
      saatler: result.saatler,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

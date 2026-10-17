const { Op } = require("sequelize");

const Appointment = require("../models/Appointment");
const Doctor = require("../models/Doctor");
const Patient = require("../models/Patient");
const User = require("../models/User");
const Notification = require("../models/Notification");

const notificationService = require("./notificationService");

const REMINDER_HOURS = 24;

const sendAppointmentReminders = async () => {
  try {
    const now = new Date();
    const reminderLimit = new Date(
      now.getTime() + REMINDER_HOURS * 60 * 60 * 1000,
    );

    const appointments = await Appointment.findAll({
      where: {
        durum: "onaylandi",
        tarih_saat: {
          [Op.gt]: now,
          [Op.lte]: reminderLimit,
        },
      },
    });

    for (const appointment of appointments) {
      try {
        const doctor = await Doctor.findByPk(
          appointment.doktor_id,
        );

        if (!doctor?.user_id) continue;

        const alreadySent = await Notification.findOne({
          where: {
            kullanici_id: doctor.user_id,
            tip: "appointment_reminder",
            metadata: {
              [Op.contains]: {
                appointment_id: appointment.id,
              },
            },
          },
        });

        if (alreadySent) continue;

        const patient = await Patient.findByPk(
          appointment.hasta_id,
          {
            include: [
              {
                model: User,
                attributes: ["ad", "soyad"],
              },
            ],
          },
        );

        const hastaAdi = patient?.User
          ? `${patient.User.ad || ""} ${patient.User.soyad || ""}`.trim()
          : null;

        await notificationService.createFromEvent({
          kullaniciId: doctor.user_id,
          tip: "appointment_reminder",
          data: {
            hastaAdi,
            tarihSaat: appointment.tarih_saat,
          },
          link: "/appointments",
          metadata: {
            appointment_id: appointment.id,
            patient_id: appointment.hasta_id,
          },
        });
      } catch (appointmentError) {
        console.error(
          `Randevu #${appointment.id} hatırlatıcısı oluşturulamadı:`,
          appointmentError.message,
        );
      }
    }
  } catch (error) {
    console.error(
      "Randevu hatırlatma işlemi başarısız:",
      error.message,
    );
  }
};

module.exports = {
  sendAppointmentReminders,
};
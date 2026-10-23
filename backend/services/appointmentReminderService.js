const appointmentRepository = require("../repositories/appointmentRepository");
const doctorRepository = require("../repositories/doctorRepository");
const patientRepository = require("../repositories/patientRepository");
const notificationRepository = require("../repositories/notificationRepository");

const notificationService = require("./notificationService");

const REMINDER_HOURS = 24;

const sendAppointmentReminders = async () => {
  try {
    const now = new Date();

    const reminderLimit = new Date(
      now.getTime() + REMINDER_HOURS * 60 * 60 * 1000,
    );

    const appointments = await appointmentRepository.findApprovedBetween(
      now,
      reminderLimit,
    );

    for (const appointment of appointments) {
      try {
        const doctor = await doctorRepository.findById(appointment.doktor_id);

        if (!doctor?.user_id) {
          continue;
        }

        const alreadySent =
          await notificationRepository.findAppointmentReminder(
            doctor.user_id,
            appointment.id,
          );

        if (alreadySent) {
          continue;
        }

        const patient = await patientRepository.findByIdWithUser(
          appointment.hasta_id,
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
      } catch (error) {
        console.error(
          `Randevu #${appointment.id} hatırlatıcısı oluşturulamadı:`,
          error.message,
        );
      }
    }
  } catch (error) {
    console.error("Randevu hatırlatma işlemi başarısız:", error.message);
  }
};

module.exports = {
  sendAppointmentReminders,
};

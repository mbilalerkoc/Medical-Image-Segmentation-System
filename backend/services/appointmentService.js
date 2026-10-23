const { sequelize } = require("../config/db");

const appointmentRepository = require("../repositories/appointmentRepository");
const doctorAvailabilityRepository = require("../repositories/doctorAvailabilityRepository");
const doctorRepository = require("../repositories/doctorRepository");
const patientRepository = require("../repositories/patientRepository");

const notificationService = require("./notificationService");

const GUNLER = [
  "pazar",
  "pazartesi",
  "sali",
  "carsamba",
  "persembe",
  "cuma",
  "cumartesi",
];

const GECERLI_DURUMLAR = [
  "bekliyor",
  "onaylandi",
  "tamamlandi",
  "iptal_edildi",
  "gelmedi",
];

const serviceError = (status, mesaj) => {
  const error = new Error(mesaj);
  error.status = status;

  return error;
};

const timeToMinutes = (time) => {
  if (!time) return 0;

  const [hour, minute] = String(time).split(":").map(Number);

  return hour * 60 + minute;
};

const getDayBounds = (date) => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  return {
    start,
    end,
  };
};

const getDoctorByUserId = async (userId, transaction = null, lock = false) => {
  const doctor = await doctorRepository.findByUserId(userId, transaction, lock);

  if (!doctor) {
    throw serviceError(
      404,
      "Giriş yapan kullanıcıya ait doktor kaydı bulunamadı.",
    );
  }

  return doctor;
};

exports.getDoctorAppointments = async (userId, filter = "all") => {
  const doctor = await getDoctorByUserId(userId);

  const appointments = await appointmentRepository.findDoctorAppointments(
    doctor.id,
    filter,
    new Date(),
  );

  if (appointments.length === 0) {
    return [];
  }

  const patientIds = [
    ...new Set(appointments.map((appointment) => appointment.hasta_id)),
  ];

  const patients = await patientRepository.findByIdsWithUser(patientIds);

  const patientMap = {};

  patients.forEach((patient) => {
    patientMap[patient.id] = patient;
  });

  return appointments.map((appointment) => {
    const patient = patientMap[appointment.hasta_id];

    return {
      id: appointment.id,

      hasta_id: appointment.hasta_id,

      hasta_adi: patient?.User
        ? `${patient.User.ad || ""} ${patient.User.soyad || ""}`.trim()
        : "-",

      tc_kimlik: patient?.tc_kimlik || "-",

      telefon: patient?.User?.telefon || null,

      doktor_id: appointment.doktor_id,

      klinik_id: appointment.klinik_id,

      tarih_saat: appointment.tarih_saat,

      sure_dakika: appointment.sure_dakika,

      randevu_nedeni: appointment.randevu_nedeni,

      notlar: appointment.notlar,

      durum: appointment.durum,

      olusturulma_tarihi: appointment.olusturulma_tarihi,
    };
  });
};

exports.createAppointment = async (userId, data) => {
  return sequelize.transaction(async (transaction) => {
    const doctor = await getDoctorByUserId(userId, transaction, true);

    if (!doctor.klinik_id) {
      throw serviceError(400, "Doktora atanmış bir klinik bulunamadı.");
    }

    const {
      hasta_id,
      tarih_saat,
      randevu_nedeni,
      notlar,
      sure_dakika = 30,
    } = data;

    if (!hasta_id || !tarih_saat) {
      throw serviceError(400, "Hasta ve randevu tarihi zorunludur.");
    }

    const patient = await patientRepository.findByIdAndDoctorId(
      hasta_id,
      doctor.id,
      transaction,
    );

    if (!patient) {
      throw serviceError(404, "Hasta bulunamadı veya bu doktora bağlı değil.");
    }

    const appointmentStart = new Date(tarih_saat);

    if (Number.isNaN(appointmentStart.getTime())) {
      throw serviceError(400, "Geçerli bir randevu tarihi giriniz.");
    }

    const now = new Date();

    if (appointmentStart <= now) {
      throw serviceError(400, "Geçmiş tarih veya saate randevu oluşturulamaz.");
    }

    const duration = Number(sure_dakika);

    if (!Number.isInteger(duration) || duration < 5) {
      throw serviceError(400, "Randevu süresi en az 5 dakika olmalıdır.");
    }

    const appointmentEnd = new Date(
      appointmentStart.getTime() + duration * 60 * 1000,
    );

    if (appointmentStart.toDateString() !== appointmentEnd.toDateString()) {
      throw serviceError(400, "Randevu aynı gün içerisinde tamamlanmalıdır.");
    }

    const gun = GUNLER[appointmentStart.getDay()];

    const availability = await doctorAvailabilityRepository.findByDoctorAndDay(
      doctor.id,
      gun,
      transaction,
    );

    if (availability.length === 0) {
      throw serviceError(
        400,
        `Doktorun ${gun} günü için müsaitlik kaydı bulunmuyor.`,
      );
    }

    const startMinutes =
      appointmentStart.getHours() * 60 + appointmentStart.getMinutes();

    const endMinutes =
      appointmentEnd.getHours() * 60 + appointmentEnd.getMinutes();

    const uygunCalismaAraligi = availability.some((item) => {
      const availabilityStart = timeToMinutes(item.baslangic_saati);

      const availabilityEnd = timeToMinutes(item.bitis_saati);

      return startMinutes >= availabilityStart && endMinutes <= availabilityEnd;
    });

    if (!uygunCalismaAraligi) {
      throw serviceError(
        400,
        "Seçilen randevu saati doktorun çalışma saatleri dışında.",
      );
    }

    const { start: dayStart, end: dayEnd } = getDayBounds(appointmentStart);

    const existingAppointments =
      await appointmentRepository.findActiveByDoctorAndDateRange(
        doctor.id,
        dayStart,
        dayEnd,
        transaction,
      );

    const conflict = existingAppointments.find((existing) => {
      const existingStart = new Date(existing.tarih_saat);

      const existingEnd = new Date(
        existingStart.getTime() +
          Number(existing.sure_dakika || 30) * 60 * 1000,
      );

      return appointmentStart < existingEnd && appointmentEnd > existingStart;
    });

    if (conflict) {
      throw serviceError(
        409,
        "Seçilen saat aralığında başka bir randevu bulunuyor.",
      );
    }

    const appointment = await appointmentRepository.create(
      {
        hasta_id: patient.id,

        doktor_id: doctor.id,

        klinik_id: doctor.klinik_id,

        tarih_saat: appointmentStart,

        sure_dakika: duration,

        randevu_nedeni: randevu_nedeni?.trim() || null,

        notlar: notlar?.trim() || null,

        durum: "onaylandi",
      },
      transaction,
    );

    await notificationService.createFromEvent({
      kullaniciId: patient.user_id,

      tip: "appointment_created",

      data: {
        tarihSaat: appointment.tarih_saat,
      },

      link: "/hasta-panel/appointments",

      metadata: {
        appointment_id: appointment.id,
      },

      transaction,
    });

    return appointment;
  });
};

exports.updateAppointmentStatus = async (userId, appointmentId, durum) => {
  if (!GECERLI_DURUMLAR.includes(durum)) {
    throw serviceError(400, "Geçersiz randevu durumu.");
  }

  return sequelize.transaction(async (transaction) => {
    const doctor = await getDoctorByUserId(userId, transaction);

    const appointment = await appointmentRepository.findByIdAndDoctorId(
      appointmentId,
      doctor.id,
      transaction,
    );

    if (!appointment) {
      throw serviceError(404, "Randevu bulunamadı.");
    }

    if (appointment.durum === durum) {
      return appointment;
    }

    const patient = await patientRepository.findById(
      appointment.hasta_id,
      transaction,
    );

    if (!patient) {
      throw serviceError(404, "Randevuya ait hasta bulunamadı.");
    }

    appointment.durum = durum;

    await appointmentRepository.save(appointment, transaction);

    const eventMap = {
      onaylandi: "appointment_approved",
      tamamlandi: "appointment_completed",
      iptal_edildi: "appointment_cancelled",
    };

    const tip = eventMap[durum];

    if (tip) {
      await notificationService.createFromEvent({
        kullaniciId: patient.user_id,

        tip,

        data: {
          tarihSaat: appointment.tarih_saat,
        },

        link: "/hasta-panel/appointments",

        metadata: {
          appointment_id: appointment.id,
        },

        transaction,
      });
    }

    return appointment;
  });
};

exports.getDoctorAvailability = async (userId) => {
  const doctor = await getDoctorByUserId(userId);

  const availability = await doctorAvailabilityRepository.findByDoctorId(
    doctor.id,
  );

  const gunSirasi = {
    pazartesi: 1,
    sali: 2,
    carsamba: 3,
    persembe: 4,
    cuma: 5,
    cumartesi: 6,
    pazar: 7,
  };

  return availability.sort((a, b) => {
    const dayDifference = gunSirasi[a.gun] - gunSirasi[b.gun];

    if (dayDifference !== 0) {
      return dayDifference;
    }

    return String(a.baslangic_saati).localeCompare(String(b.baslangic_saati));
  });
};

exports.saveDoctorAvailability = async (userId, musaitlikler) => {
  if (!Array.isArray(musaitlikler)) {
    throw serviceError(
      400,
      "Müsaitlik bilgileri liste halinde gönderilmelidir.",
    );
  }

  const doctor = await getDoctorByUserId(userId);

  for (const item of musaitlikler) {
    if (!item.gun || !GUNLER.includes(item.gun)) {
      throw serviceError(400, `Geçersiz gün: ${item.gun || "-"}`);
    }

    if (!item.baslangic_saati || !item.bitis_saati) {
      throw serviceError(400, "Başlangıç ve bitiş saatleri zorunludur.");
    }

    const start = timeToMinutes(item.baslangic_saati);

    const end = timeToMinutes(item.bitis_saati);

    if (start >= end) {
      throw serviceError(
        400,
        `${item.gun} günü için bitiş saati başlangıç saatinden sonra olmalıdır.`,
      );
    }
  }

  return sequelize.transaction(async (transaction) => {
    await doctorAvailabilityRepository.deleteByDoctorId(doctor.id, transaction);

    if (musaitlikler.length === 0) {
      return [];
    }

    const records = musaitlikler.map((item) => ({
      doktor_id: doctor.id,

      gun: item.gun,

      baslangic_saati: item.baslangic_saati,

      bitis_saati: item.bitis_saati,
    }));

    return doctorAvailabilityRepository.bulkCreate(records, transaction);
  });
};

exports.getPatientAppointments = async (userId, filter = "all") => {
  const patient = await patientRepository.findByUserId(userId);

  if (!patient) {
    throw serviceError(404, "Hasta profili bulunamadı.");
  }

  const appointments = await appointmentRepository.findPatientAppointments(
    patient.id,
    filter,
    new Date(),
  );

  if (appointments.length === 0) {
    return [];
  }

  const doctorIds = [
    ...new Set(appointments.map((appointment) => appointment.doktor_id)),
  ];

  const doctors = await doctorRepository.findByIdsWithUserAndClinic(doctorIds);

  const doctorMap = {};

  doctors.forEach((doctor) => {
    doctorMap[doctor.id] = doctor;
  });

  return appointments.map((appointment) => {
    const doctor = doctorMap[appointment.doktor_id];

    return {
      id: appointment.id,
      doktor_id: appointment.doktor_id,

      doktor_adi: doctor?.User
        ? `${doctor.User.ad || ""} ${doctor.User.soyad || ""}`.trim()
        : "-",

      doktor_unvan: doctor?.unvan || null,

      uzmanlik: doctor?.uzmanlik || null,

      klinik_id: appointment.klinik_id,

      klinik_adi: doctor?.Klinik?.ad || "-",

      tarih_saat: appointment.tarih_saat,

      sure_dakika: appointment.sure_dakika,

      randevu_nedeni: appointment.randevu_nedeni,

      notlar: appointment.notlar,

      durum: appointment.durum,

      olusturulma_tarihi: appointment.olusturulma_tarihi,
    };
  });
};

exports.getAvailableSlots = async (userId, dateString, duration = 30) => {
  if (!dateString || !/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    throw serviceError(400, "Geçerli bir tarih giriniz.");
  }

  const appointmentDuration = Number(duration);

  if (!Number.isInteger(appointmentDuration) || appointmentDuration < 5) {
    throw serviceError(400, "Randevu süresi en az 5 dakika olmalıdır.");
  }

  const doctor = await getDoctorByUserId(userId);

  const selectedDate = new Date(`${dateString}T12:00:00`);

  if (Number.isNaN(selectedDate.getTime())) {
    throw serviceError(400, "Geçersiz tarih.");
  }

  const gun = GUNLER[selectedDate.getDay()];

  const availability = await doctorAvailabilityRepository.findByDoctorAndDay(
    doctor.id,
    gun,
  );

  if (availability.length === 0) {
    return {
      gun,
      tarih: dateString,
      saatler: [],
    };
  }

  const dayStart = new Date(`${dateString}T00:00:00`);

  const dayEnd = new Date(dayStart);

  dayEnd.setDate(dayEnd.getDate() + 1);

  const existingAppointments =
    await appointmentRepository.findActiveByDoctorAndDateRange(
      doctor.id,
      dayStart,
      dayEnd,
    );

  const now = new Date();

  const slots = [];

  const SLOT_STEP = 15;

  availability.forEach((availabilityItem) => {
    const availabilityStart = timeToMinutes(availabilityItem.baslangic_saati);

    const availabilityEnd = timeToMinutes(availabilityItem.bitis_saati);

    for (
      let startMinutes = availabilityStart;
      startMinutes + appointmentDuration <= availabilityEnd;
      startMinutes += SLOT_STEP
    ) {
      const hour = Math.floor(startMinutes / 60);

      const minute = startMinutes % 60;

      const slotStart = new Date(dayStart);

      slotStart.setHours(hour, minute, 0, 0);

      const slotEnd = new Date(
        slotStart.getTime() + appointmentDuration * 60 * 1000,
      );

      if (slotStart <= now) {
        continue;
      }

      const conflict = existingAppointments.some((appointment) => {
        const existingStart = new Date(appointment.tarih_saat);

        const existingEnd = new Date(
          existingStart.getTime() +
            Number(appointment.sure_dakika || 30) * 60 * 1000,
        );

        return slotStart < existingEnd && slotEnd > existingStart;
      });

      if (conflict) {
        continue;
      }

      const baslangic = `${String(hour).padStart(2, "0")}:${String(
        minute,
      ).padStart(2, "0")}`;

      const endMinutes = startMinutes + appointmentDuration;

      const endHour = Math.floor(endMinutes / 60);

      const endMinute = endMinutes % 60;

      const bitis = `${String(endHour).padStart(2, "0")}:${String(
        endMinute,
      ).padStart(2, "0")}`;

      slots.push({
        baslangic,
        bitis,
      });
    }
  });

  const uniqueSlots = Array.from(
    new Map(
      slots.map((slot) => [`${slot.baslangic}-${slot.bitis}`, slot]),
    ).values(),
  );

  uniqueSlots.sort((a, b) => a.baslangic.localeCompare(b.baslangic));

  return {
    tarih: dateString,

    gun,

    sure_dakika: appointmentDuration,

    saatler: uniqueSlots,
  };
};

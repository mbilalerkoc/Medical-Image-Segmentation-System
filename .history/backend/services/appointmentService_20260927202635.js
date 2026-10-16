const { Op } = require("sequelize");
const { sequelize } = require("../config/db");

const Appointment = require("../models/Appointment");
const DoctorAvailability = require("../models/DoctorAvailability");
const Doctor = require("../models/Doctor");
const Patient = require("../models/Patient");
const User = require("../models/User");

// =====================================================
// SABİTLER
// =====================================================

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

// =====================================================
// SERVICE ERROR
// =====================================================

const serviceError = (status, mesaj) => {
  const error = new Error(mesaj);
  error.status = status;

  return error;
};

// =====================================================
// SAAT -> DAKİKA
// 09:30:00 -> 570
// =====================================================

const timeToMinutes = (time) => {
  if (!time) return 0;

  const [hour, minute] = String(time)
    .split(":")
    .map(Number);

  return hour * 60 + minute;
};

// =====================================================
// TARİHİN BAŞLANGIÇ / BİTİŞİ
// =====================================================

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

// =====================================================
// GİRİŞ YAPAN KULLANICININ DOKTOR KAYDI
// =====================================================

const getDoctorByUserId = async (
  userId,
  transaction = null,
  lock = false
) => {
  const options = {
    where: {
      user_id: userId,
    },
    transaction,
  };

  if (lock && transaction) {
    options.lock = transaction.LOCK.UPDATE;
  }

  const doctor = await Doctor.findOne(options);

  if (!doctor) {
    throw serviceError(
      404,
      "Giriş yapan kullanıcıya ait doktor kaydı bulunamadı."
    );
  }

  return doctor;
};

// =====================================================
// DOKTORUN RANDEVULARINI GETİR
// =====================================================

exports.getDoctorAppointments = async (
  userId,
  filter = "all"
) => {
  const doctor =
    await getDoctorByUserId(userId);

  const now = new Date();

  const where = {
    doktor_id: doctor.id,
  };

  let order = [["tarih_saat", "DESC"]];

  // BUGÜN
  if (filter === "today") {
    const {
      start,
      end,
    } = getDayBounds(now);

    where.tarih_saat = {
      [Op.gte]: start,
      [Op.lt]: end,
    };

    order = [["tarih_saat", "ASC"]];
  }

  // YAKLAŞAN
  if (filter === "upcoming") {
    where.tarih_saat = {
      [Op.gte]: now,
    };

    where.durum = {
      [Op.ne]: "iptal_edildi",
    };

    order = [["tarih_saat", "ASC"]];
  }

  // GEÇMİŞ
  if (filter === "past") {
    where.tarih_saat = {
      [Op.lt]: now,
    };
  }

  // İPTAL
  if (filter === "cancelled") {
    where.durum = "iptal_edildi";
  }

  const appointments =
    await Appointment.findAll({
      where,
      order,
    });

  if (appointments.length === 0) {
    return [];
  }

  // =====================================================
  // HASTA BİLGİLERİNİ GETİR
  // =====================================================

  const patientIds = [
    ...new Set(
      appointments.map(
        (appointment) =>
          appointment.hasta_id
      )
    ),
  ];

  const patients =
    await Patient.findAll({
      where: {
        id: {
          [Op.in]: patientIds,
        },
      },

      include: [
        {
          model: User,

          attributes: [
            "ad",
            "soyad",
            "email",
            "telefon",
            "dogum_tarihi",
          ],
        },
      ],
    });

  const patientMap = {};

  patients.forEach((patient) => {
    patientMap[patient.id] =
      patient;
  });

  // =====================================================
  // RESPONSE FORMAT
  // =====================================================

  return appointments.map(
    (appointment) => {
      const patient =
        patientMap[
          appointment.hasta_id
        ];

      return {
        id:
          appointment.id,

        hasta_id:
          appointment.hasta_id,

        hasta_adi:
          patient?.User
            ? `${patient.User.ad || ""} ${patient.User.soyad || ""}`.trim()
            : "-",

        tc_kimlik:
          patient?.tc_kimlik ||
          "-",

        telefon:
          patient?.User?.telefon ||
          null,

        doktor_id:
          appointment.doktor_id,

        klinik_id:
          appointment.klinik_id,

        tarih_saat:
          appointment.tarih_saat,

        sure_dakika:
          appointment.sure_dakika,

        randevu_nedeni:
          appointment.randevu_nedeni,

        notlar:
          appointment.notlar,

        durum:
          appointment.durum,

        olusturulma_tarihi:
          appointment.olusturulma_tarihi,
      };
    }
  );
};

// =====================================================
// YENİ RANDEVU OLUŞTUR
// =====================================================

exports.createAppointment = async (
  userId,
  data
) => {
  return sequelize.transaction(
    async (transaction) => {
      // =================================================
      // 1. DOKTOR
      // =================================================

      const doctor =
        await getDoctorByUserId(
          userId,
          transaction,
          true
        );

      if (!doctor.klinik_id) {
        throw serviceError(
          400,
          "Doktora atanmış bir klinik bulunamadı."
        );
      }

      const {
        hasta_id,
        tarih_saat,
        randevu_nedeni,
        notlar,
        sure_dakika = 30,
      } = data;

      // =================================================
      // 2. ZORUNLU ALANLAR
      // =================================================

      if (
        !hasta_id ||
        !tarih_saat
      ) {
        throw serviceError(
          400,
          "Hasta ve randevu tarihi zorunludur."
        );
      }

      // =================================================
      // 3. HASTA BU DOKTORA MI AİT?
      // =================================================

      const patient =
        await Patient.findOne({
          where: {
            id: hasta_id,
            doktor_id:
              doctor.id,
          },
          transaction,
        });

      if (!patient) {
        throw serviceError(
          404,
          "Hasta bulunamadı veya bu doktora bağlı değil."
        );
      }

      // =================================================
      // 4. TARİH
      // =================================================

      const appointmentStart =
        new Date(tarih_saat);

      if (
        Number.isNaN(
          appointmentStart.getTime()
        )
      ) {
        throw serviceError(
          400,
          "Geçerli bir randevu tarihi giriniz."
        );
      }

      const now = new Date();

      if (
        appointmentStart <= now
      ) {
        throw serviceError(
          400,
          "Geçmiş tarih veya saate randevu oluşturulamaz."
        );
      }

      // =================================================
      // 5. SÜRE
      // =================================================

      const duration =
        Number(sure_dakika);

      if (
        !Number.isInteger(duration) ||
        duration < 5
      ) {
        throw serviceError(
          400,
          "Randevu süresi en az 5 dakika olmalıdır."
        );
      }

      const appointmentEnd =
        new Date(
          appointmentStart.getTime() +
            duration * 60 * 1000
        );

      // Gece yarısını geçen randevu istemiyoruz
      if (
        appointmentStart.toDateString() !==
        appointmentEnd.toDateString()
      ) {
        throw serviceError(
          400,
          "Randevu aynı gün içerisinde tamamlanmalıdır."
        );
      }

      // =================================================
      // 6. DOKTOR O GÜN ÇALIŞIYOR MU?
      // =================================================

      const gun =
        GUNLER[
          appointmentStart.getDay()
        ];

      const availability =
        await DoctorAvailability.findAll({
          where: {
            doktor_id:
              doctor.id,

            gun,
          },

          transaction,
        });

      if (
        availability.length === 0
      ) {
        throw serviceError(
          400,
          `Doktorun ${gun} günü için müsaitlik kaydı bulunmuyor.`
        );
      }

      const startMinutes =
        appointmentStart.getHours() *
          60 +
        appointmentStart.getMinutes();

      const endMinutes =
        appointmentEnd.getHours() *
          60 +
        appointmentEnd.getMinutes();

      const uygunCalismaAraligi =
        availability.some(
          (item) => {
            const availabilityStart =
              timeToMinutes(
                item.baslangic_saati
              );

            const availabilityEnd =
              timeToMinutes(
                item.bitis_saati
              );

            return (
              startMinutes >=
                availabilityStart &&
              endMinutes <=
                availabilityEnd
            );
          }
        );

      if (!uygunCalismaAraligi) {
        throw serviceError(
          400,
          "Seçilen randevu saati doktorun çalışma saatleri dışında."
        );
      }

      // =================================================
      // 7. AYNI GÜNÜN RANDEVULARI
      // =================================================

      const {
        start: dayStart,
        end: dayEnd,
      } = getDayBounds(
        appointmentStart
      );

      const existingAppointments =
        await Appointment.findAll({
          where: {
            doktor_id:
              doctor.id,

            tarih_saat: {
              [Op.gte]:
                dayStart,

              [Op.lt]:
                dayEnd,
            },

            durum: {
              [Op.ne]:
                "iptal_edildi",
            },
          },

          transaction,
        });

      // =================================================
      // 8. ÇAKIŞMA KONTROLÜ
      // =================================================

      const conflict =
        existingAppointments.find(
          (existing) => {
            const existingStart =
              new Date(
                existing.tarih_saat
              );

            const existingEnd =
              new Date(
                existingStart.getTime() +
                  Number(
                    existing.sure_dakika ||
                      30
                  ) *
                    60 *
                    1000
              );

            return (
              appointmentStart <
                existingEnd &&
              appointmentEnd >
                existingStart
            );
          }
        );

      if (conflict) {
        throw serviceError(
          409,
          "Seçilen saat aralığında başka bir randevu bulunuyor."
        );
      }

      // =================================================
      // 9. RANDEVUYU OLUŞTUR
      // =================================================

      const appointment =
        await Appointment.create(
          {
            hasta_id:
              patient.id,

            doktor_id:
              doctor.id,

            klinik_id:
              doctor.klinik_id,

            tarih_saat:
              appointmentStart,

            sure_dakika:
              duration,

            randevu_nedeni:
              randevu_nedeni?.trim() ||
              null,

            notlar:
              notlar?.trim() ||
              null,

            // Doktor kendisi oluşturduğu için
            // direkt onaylı kabul ediyoruz.
            durum:
              "onaylandi",
          },
          {
            transaction,
          }
        );

      return appointment;
    }
  );
};

// =====================================================
// RANDEVU DURUMUNU GÜNCELLE
// =====================================================

exports.updateAppointmentStatus =
  async (
    userId,
    appointmentId,
    durum
  ) => {
    if (
      !GECERLI_DURUMLAR.includes(
        durum
      )
    ) {
      throw serviceError(
        400,
        "Geçersiz randevu durumu."
      );
    }

    const doctor =
      await getDoctorByUserId(
        userId
      );

    const appointment =
      await Appointment.findOne({
        where: {
          id: appointmentId,
          doktor_id:
            doctor.id,
        },
      });

    if (!appointment) {
      throw serviceError(
        404,
        "Randevu bulunamadı."
      );
    }

    appointment.durum =
      durum;

    await appointment.save();

    return appointment;
  };

// =====================================================
// DOKTORUN MÜSAİTLİĞİNİ GETİR
// =====================================================

exports.getDoctorAvailability =
  async (userId) => {
    const doctor =
      await getDoctorByUserId(
        userId
      );

    const availability =
      await DoctorAvailability.findAll({
        where: {
          doktor_id:
            doctor.id,
        },
      });

    const gunSirasi = {
      pazartesi: 1,
      sali: 2,
      carsamba: 3,
      persembe: 4,
      cuma: 5,
      cumartesi: 6,
      pazar: 7,
    };

    return availability.sort(
      (a, b) => {
        const dayDifference =
          gunSirasi[a.gun] -
          gunSirasi[b.gun];

        if (dayDifference !== 0) {
          return dayDifference;
        }

        return String(
          a.baslangic_saati
        ).localeCompare(
          String(
            b.baslangic_saati
          )
        );
      }
    );
  };

// =====================================================
// DOKTORUN HAFTALIK MÜSAİTLİĞİNİ KAYDET
// =====================================================

exports.saveDoctorAvailability =
  async (
    userId,
    musaitlikler
  ) => {
    if (
      !Array.isArray(
        musaitlikler
      )
    ) {
      throw serviceError(
        400,
        "Müsaitlik bilgileri liste halinde gönderilmelidir."
      );
    }

    const doctor =
      await getDoctorByUserId(
        userId
      );

    // =================================================
    // VALIDATION
    // =================================================

    for (
      const item of
      musaitlikler
    ) {
      if (
        !item.gun ||
        !GUNLER.includes(
          item.gun
        )
      ) {
        throw serviceError(
          400,
          `Geçersiz gün: ${item.gun || "-"}`
        );
      }

      if (
        !item.baslangic_saati ||
        !item.bitis_saati
      ) {
        throw serviceError(
          400,
          "Başlangıç ve bitiş saatleri zorunludur."
        );
      }

      const start =
        timeToMinutes(
          item.baslangic_saati
        );

      const end =
        timeToMinutes(
          item.bitis_saati
        );

      if (start >= end) {
        throw serviceError(
          400,
          `${item.gun} günü için bitiş saati başlangıç saatinden sonra olmalıdır.`
        );
      }
    }

    return sequelize.transaction(
      async (transaction) => {
        // Eski haftalık programı temizle
        await DoctorAvailability.destroy(
          {
            where: {
              doktor_id:
                doctor.id,
            },

            transaction,
          }
        );

        if (
          musaitlikler.length ===
          0
        ) {
          return [];
        }

        const records =
          musaitlikler.map(
            (item) => ({
              doktor_id:
                doctor.id,

              gun:
                item.gun,

              baslangic_saati:
                item.baslangic_saati,

              bitis_saati:
                item.bitis_saati,
            })
          );

        return DoctorAvailability.bulkCreate(
          records,
          {
            transaction,
          }
        );
      }
    );
  };
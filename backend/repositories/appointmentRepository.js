const { Op } = require("sequelize");
const Appointment = require("../models/Appointment");

const countUpcomingByPatientId = async (patientId, now = new Date()) => {
  return Appointment.count({
    where: {
      hasta_id: patientId,
      tarih_saat: {
        [Op.gte]: now,
      },
      durum: {
        [Op.in]: ["bekliyor", "onaylandi"],
      },
    },
  });
};

const findUpcomingByPatientId = async (
  patientId,
  limit = 3,
  now = new Date(),
) => {
  return Appointment.findAll({
    where: {
      hasta_id: patientId,
      tarih_saat: {
        [Op.gte]: now,
      },
      durum: {
        [Op.in]: ["bekliyor", "onaylandi"],
      },
    },
    attributes: [
      "id",
      "doktor_id",
      "klinik_id",
      "tarih_saat",
      "durum",
      "randevu_nedeni",
      "sure_dakika",
    ],
    order: [["tarih_saat", "ASC"]],
    limit,
  });
};

const countTodayByDoctorId = async (doctorId, start, end) => {
  return Appointment.count({
    where: {
      doktor_id: doctorId,
      tarih_saat: {
        [Op.gte]: start,
        [Op.lt]: end,
      },
      durum: {
        [Op.ne]: "iptal_edildi",
      },
    },
  });
};

const countUpcomingByDoctorId = async (doctorId, now = new Date()) => {
  return Appointment.count({
    where: {
      doktor_id: doctorId,
      tarih_saat: {
        [Op.gte]: now,
      },
      durum: {
        [Op.ne]: "iptal_edildi",
      },
    },
  });
};

const findTodayByDoctorId = async (doctorId, start, end, limit = 6) => {
  return Appointment.findAll({
    where: {
      doktor_id: doctorId,
      tarih_saat: {
        [Op.gte]: start,
        [Op.lt]: end,
      },
      durum: {
        [Op.ne]: "iptal_edildi",
      },
    },
    order: [["tarih_saat", "ASC"]],
    limit,
  });
};

const findDoctorAppointments = async (
  doctorId,
  filter = "all",
  now = new Date(),
) => {
  const where = {
    doktor_id: doctorId,
  };

  let order = [["tarih_saat", "DESC"]];

  if (filter === "today") {
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setDate(end.getDate() + 1);

    where.tarih_saat = {
      [Op.gte]: start,
      [Op.lt]: end,
    };

    order = [["tarih_saat", "ASC"]];
  }

  if (filter === "upcoming") {
    where.tarih_saat = {
      [Op.gte]: now,
    };

    where.durum = {
      [Op.ne]: "iptal_edildi",
    };

    order = [["tarih_saat", "ASC"]];
  }

  if (filter === "past") {
    where.tarih_saat = {
      [Op.lt]: now,
    };
  }

  if (filter === "cancelled") {
    where.durum = "iptal_edildi";
  }

  return Appointment.findAll({
    where,
    order,
  });
};

const findActiveByDoctorAndDateRange = async (
  doctorId,
  start,
  end,
  transaction = null,
) => {
  return Appointment.findAll({
    where: {
      doktor_id: doctorId,
      tarih_saat: {
        [Op.gte]: start,
        [Op.lt]: end,
      },
      durum: {
        [Op.ne]: "iptal_edildi",
      },
    },
    order: [["tarih_saat", "ASC"]],
    transaction,
  });
};

const findByIdAndDoctorId = async (
  appointmentId,
  doctorId,
  transaction = null,
) => {
  return Appointment.findOne({
    where: {
      id: appointmentId,
      doktor_id: doctorId,
    },
    transaction,
  });
};

const create = async (data, transaction = null) => {
  return Appointment.create(data, {
    transaction,
  });
};

const save = async (appointment, transaction = null) => {
  return appointment.save({
    transaction,
  });
};

const findApprovedBetween = async (start, end) => {
  return Appointment.findAll({
    where: {
      durum: "onaylandi",
      tarih_saat: {
        [Op.gt]: start,
        [Op.lte]: end,
      },
    },
  });
};

const findPatientAppointments = async (
  patientId,
  filter = "all",
  now = new Date(),
) => {
  const where = {
    hasta_id: patientId,
  };

  let order = [["tarih_saat", "DESC"]];

  if (filter === "today") {
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setDate(end.getDate() + 1);

    where.tarih_saat = {
      [Op.gte]: start,
      [Op.lt]: end,
    };

    order = [["tarih_saat", "ASC"]];
  }

  if (filter === "upcoming") {
    where.tarih_saat = {
      [Op.gte]: now,
    };

    where.durum = {
      [Op.ne]: "iptal_edildi",
    };

    order = [["tarih_saat", "ASC"]];
  }

  if (filter === "past") {
    where.tarih_saat = {
      [Op.lt]: now,
    };
  }

  if (filter === "cancelled") {
    where.durum = "iptal_edildi";
  }

  return Appointment.findAll({
    where,
    order,
  });
};

module.exports = {
  countUpcomingByPatientId,
  findUpcomingByPatientId,
  countTodayByDoctorId,
  countUpcomingByDoctorId,
  findTodayByDoctorId,
  findDoctorAppointments,
  findActiveByDoctorAndDateRange,
  findByIdAndDoctorId,
  create,
  save,
  findApprovedBetween,
  findPatientAppointments,
};

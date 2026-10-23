const DoctorAvailability = require("../models/DoctorAvailability");

const findByDoctorId = async (doctorId) => {
  return DoctorAvailability.findAll({
    where: {
      doktor_id: doctorId,
    },
  });
};

const findByDoctorAndDay = async (doctorId, day, transaction = null) => {
  return DoctorAvailability.findAll({
    where: {
      doktor_id: doctorId,
      gun: day,
    },
    order: [["baslangic_saati", "ASC"]],
    transaction,
  });
};

const deleteByDoctorId = async (doctorId, transaction = null) => {
  return DoctorAvailability.destroy({
    where: {
      doktor_id: doctorId,
    },
    transaction,
  });
};

const bulkCreate = async (records, transaction = null) => {
  return DoctorAvailability.bulkCreate(records, {
    transaction,
  });
};

module.exports = {
  findByDoctorId,
  findByDoctorAndDay,
  deleteByDoctorId,
  bulkCreate,
};

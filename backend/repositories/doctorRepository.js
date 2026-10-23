const Doctor = require("../models/Doctor");
const Klinik = require("../models/Klinik");

const findByUserId = async (userId, transaction = null, lock = false) => {
  const options = {
    where: {
      user_id: userId,
    },
    transaction,
  };

  if (lock && transaction) {
    options.lock = transaction.LOCK.UPDATE;
  }

  return Doctor.findOne(options);
};

const findByUserIdWithClinic = async (userId, transaction = null) => {
  return Doctor.findOne({
    where: {
      user_id: userId,
    },
    include: [
      {
        model: Klinik,
        attributes: ["ad"],
      },
    ],
    transaction,
  });
};

const findById = async (doctorId, transaction = null) => {
  return Doctor.findByPk(doctorId, {
    transaction,
  });
};

const create = async (data, transaction = null) => {
  return Doctor.create(data, {
    transaction,
  });
};

module.exports = {
  findByUserId,
  findByUserIdWithClinic,
  findById,
  create,
};

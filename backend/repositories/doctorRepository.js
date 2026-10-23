const { Op } = require("sequelize");

const Doctor = require("../models/Doctor");
const User = require("../models/User");
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

const findByIdsWithUserAndClinic = async (doctorIds) => {
  if (!doctorIds.length) {
    return [];
  }

  return Doctor.findAll({
    where: {
      id: {
        [Op.in]: doctorIds,
      },
    },
    include: [
      {
        model: User,
        attributes: ["ad", "soyad"],
      },
      {
        model: Klinik,
        attributes: ["ad"],
      },
    ],
  });
};

module.exports = {
  findByUserId,
  findByUserIdWithClinic,
  findById,
  create,
  findByIdsWithUserAndClinic,
};

const { Op } = require("sequelize");

const Patient = require("../models/Patient");
const User = require("../models/User");

const userAttributes = [
  "ad",
  "soyad",
  "email",
  "telefon",
  "dogum_tarihi",
  "aktif",
];

const create = async (data, transaction = null) => {
  return Patient.create(data, {
    transaction,
  });
};

const findByUserId = async (userId, transaction = null) => {
  return Patient.findOne({
    where: {
      user_id: userId,
    },
    transaction,
  });
};

const findByTcKimlik = async (tcKimlik, transaction = null) => {
  return Patient.findOne({
    where: {
      tc_kimlik: tcKimlik,
    },
    transaction,
  });
};

const findByUserIdWithUser = async (userId, transaction = null) => {
  return Patient.findOne({
    where: {
      user_id: userId,
    },
    include: [
      {
        model: User,
        attributes: userAttributes,
      },
    ],
    transaction,
  });
};

const findByDoctorIdWithUser = async (doctorId, transaction = null) => {
  return Patient.findAll({
    where: {
      doktor_id: doctorId,
    },
    include: [
      {
        model: User,
        attributes: userAttributes,
      },
    ],
    transaction,
  });
};

const findByIdWithUser = async (patientId, transaction = null) => {
  return Patient.findByPk(patientId, {
    include: [
      {
        model: User,
        attributes: userAttributes,
      },
    ],
    transaction,
  });
};

const findById = async (patientId, transaction = null) => {
  return Patient.findByPk(patientId, {
    transaction,
  });
};

const findByIdAndDoctorId = async (patientId, doctorId, transaction = null) => {
  return Patient.findOne({
    where: {
      id: patientId,
      doktor_id: doctorId,
    },
    transaction,
  });
};

const findByIdsWithUser = async (patientIds) => {
  if (!patientIds.length) {
    return [];
  }

  return Patient.findAll({
    where: {
      id: {
        [Op.in]: patientIds,
      },
    },
    include: [
      {
        model: User,
        attributes: userAttributes,
      },
    ],
  });
};

const countByDoctorId = async (doctorId) => {
  return Patient.count({
    where: {
      doktor_id: doctorId,
    },
  });
};

module.exports = {
  create,
  findByUserId,
  findByTcKimlik,
  findByUserIdWithUser,
  findByDoctorIdWithUser,
  findByIdWithUser,
  findById,
  findByIdAndDoctorId,
  findByIdsWithUser,
  countByDoctorId,
};

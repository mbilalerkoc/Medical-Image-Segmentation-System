const { Op } = require("sequelize");
const Analysis = require("../models/Analysis");

const patientAnalysisAttributes = [
  "id",
  "analiz_adi",
  "organ",
  "model",
  "durum",
];

const create = async (data, transaction = null) => {
  return Analysis.create(data, {
    transaction,
  });
};

const countByPatientId = async (patientId) => {
  return Analysis.count({
    where: {
      hasta_id: patientId,
    },
  });
};

const countByDoctorId = async (doctorId) => {
  return Analysis.count({
    where: {
      doktor_id: doctorId,
    },
  });
};

const countCompletedByDoctorId = async (doctorId) => {
  return Analysis.count({
    where: {
      doktor_id: doctorId,
      durum: {
        [Op.in]: ["tamamlandi", "onaylandi"],
      },
    },
  });
};

const countPendingByDoctorId = async (doctorId) => {
  return Analysis.count({
    where: {
      doktor_id: doctorId,
      durum: "bekliyor",
    },
  });
};

const findByPatientId = async (patientId) => {
  return Analysis.findAll({
    where: {
      hasta_id: patientId,
    },
    attributes: patientAnalysisAttributes,
    order: [["id", "DESC"]],
  });
};

const findRecentByPatientId = async (patientId, limit = 5) => {
  return Analysis.findAll({
    where: {
      hasta_id: patientId,
    },
    attributes: patientAnalysisAttributes,
    order: [["id", "DESC"]],
    limit,
  });
};

const findRecentByDoctorId = async (doctorId, limit = 6) => {
  return Analysis.findAll({
    where: {
      doktor_id: doctorId,
    },
    order: [["id", "DESC"]],
    limit,
  });
};

const findById = async (analysisId, attributes = null, transaction = null) => {
  const options = {
    transaction,
  };

  if (attributes) {
    options.attributes = attributes;
  }

  return Analysis.findByPk(analysisId, options);
};

const findByIdAndPatientId = async (
  analysisId,
  patientId,
  transaction = null,
) => {
  return Analysis.findOne({
    where: {
      id: analysisId,
      hasta_id: patientId,
    },
    transaction,
  });
};

const findByIdPatientAndDoctor = async (
  analysisId,
  patientId,
  doctorId,
  transaction = null,
) => {
  return Analysis.findOne({
    where: {
      id: analysisId,
      hasta_id: patientId,
      doktor_id: doctorId,
    },
    transaction,
  });
};

module.exports = {
  create,
  countByPatientId,
  countByDoctorId,
  countCompletedByDoctorId,
  countPendingByDoctorId,
  findByPatientId,
  findRecentByPatientId,
  findRecentByDoctorId,
  findById,
  findByIdAndPatientId,
  findByIdPatientAndDoctor,
};

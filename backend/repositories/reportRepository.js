const { Op } = require("sequelize");
const Report = require("../models/Report");

const create = async (data, transaction = null) => {
  return Report.create(data, {
    transaction,
  });
};

const countByPatientId = async (patientId) => {
  return Report.count({
    where: {
      hasta_id: patientId,
    },
  });
};

const findByPatientId = async (patientId) => {
  return Report.findAll({
    where: {
      hasta_id: patientId,
    },
    order: [
      ["olusturulma_tarihi", "DESC"],
      ["id", "DESC"],
    ],
  });
};

const findByIdAndPatientId = async (reportId, patientId) => {
  return Report.findOne({
    where: {
      id: reportId,
      hasta_id: patientId,
    },
  });
};

const findByAnalysisIds = async (analysisIds) => {
  if (!analysisIds.length) {
    return [];
  }

  return Report.findAll({
    where: {
      analiz_id: {
        [Op.in]: analysisIds,
      },
    },
    order: [["olusturulma_tarihi", "DESC"]],
  });
};

const findLatestByAnalysisId = async (analysisId, patientId = null) => {
  const where = {
    analiz_id: analysisId,
  };

  if (patientId !== null) {
    where.hasta_id = patientId;
  }

  return Report.findOne({
    where,
    order: [["id", "DESC"]],
  });
};

module.exports = {
  create,
  countByPatientId,
  findByPatientId,
  findByIdAndPatientId,
  findByAnalysisIds,
  findLatestByAnalysisId,
};

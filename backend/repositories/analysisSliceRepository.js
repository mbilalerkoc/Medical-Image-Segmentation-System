const AnalysisSlice = require("../models/AnalysisSlice");

const create = async (data, transaction = null) => {
  return AnalysisSlice.create(data, {
    transaction,
  });
};

const findByAnalysisId = async (
  analysisId,
  attributes = null,
  transaction = null,
) => {
  const options = {
    where: {
      analiz_id: analysisId,
    },
    transaction,
  };

  if (attributes) {
    options.attributes = attributes;
  }

  return AnalysisSlice.findOne(options);
};

module.exports = {
  create,
  findByAnalysisId,
};

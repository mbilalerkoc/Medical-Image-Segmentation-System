import api from "./api";

export const predictAnalysis = async (model, formData) => {
  const response = await api.post(`/analyze/predict/${model}`, formData);

  return response.data;
};

export const createReport = async (reportData) => {
  const response = await api.post("/analyze/reports/create", reportData);

  return response.data;
};

export const getAnalysisById = async (analysisId) => {
  const response = await api.get(`/analyze/analyses/${analysisId}`);

  return response.data;
};

import api from './api';

export const predictAnalysis = async (model, formData) => {
  const response = await api.post(`/analyze/predict/${model}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

export const createReport = async (payload) => {
  const response = await api.post('/reports/create', payload);
  return response.data;
};
export const getAnalysisById = async (analizId) => {
  const token = localStorage.getItem("token");

  const response = await fetch(
    `http://localhost:5000/api/analyses/${analizId}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.mesaj || "Analiz bilgileri alınırken hata oluştu."
    );
  }

  return data;
};
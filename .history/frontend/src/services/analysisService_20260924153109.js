import api from './api';

export const predictAnalysis = async (model, formData) => {
  // api.js zaten localStorage'daki gerçek token'ı (ID: 26) otomatik olarak header'a ekliyor.
  const response = await api.post(`/analyze/predict/${model}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

export const createReport = async (payload) => {
  const response = await api.post('/reports/create', payload);
  return response.data;
};
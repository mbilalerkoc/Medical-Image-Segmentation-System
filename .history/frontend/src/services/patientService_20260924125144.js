import api from './api';

// Tüm hastaları getir
export const getPatients = async () => {
  const response = await api.get('/patients');
  return response.data;
};

// Yeni hasta ekle
export const addPatient = async (patientData) => {
  const response = await api.post('/patients/add', patientData);
  return response.data;
};
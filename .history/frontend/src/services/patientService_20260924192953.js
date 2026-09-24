import api from "./api";

// =====================================================
// TÜM HASTALARI GETİR
// =====================================================

export const getPatients = async () => {
  const response = await api.get("/patients");

  return response.data;
};


// =====================================================
// TEK HASTA DETAYINI GETİR
// =====================================================

export const getPatientById = async (patientId) => {
  const response = await api.get(
    `/patients/${patientId}`
  );

  return response.data;
};

export const addPatient = async (patientData) => {
  const response = await api.post(
    "/patients/add",
    patientData
  );

  return response.data;
};
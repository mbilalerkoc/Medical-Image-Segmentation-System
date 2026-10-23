import api from "./api";

export const getPatients = async () => {
  const response = await api.get("/patients");

  return response.data;
};

export const getPatientById = async (patientId) => {
  const response = await api.get(`/patients/${patientId}`);

  return response.data;
};

export const addPatient = async (patientData) => {
  const response = await api.post("/patients/add", patientData);

  return response.data;
};

export const getMyDashboard = async () => {
  const response = await api.get("/patients/me/dashboard");

  return response.data;
};

export const getMyAnalyses = async () => {
  const response = await api.get("/patients/me/analyses");

  return response.data;
};

export const getMyReports = async () => {
  const response = await api.get("/reports/me");

  return response.data;
};

export const getMyReportById = async (reportId) => {
  const response = await api.get(`/reports/me/${reportId}`);

  return response.data;
};

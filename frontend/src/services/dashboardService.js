import api from "./api";

// DASHBOARD VERİLERİNİ GETİR
export const getDashboard = async () => {
  const response = await api.get("/dashboard");

  return response.data;
};
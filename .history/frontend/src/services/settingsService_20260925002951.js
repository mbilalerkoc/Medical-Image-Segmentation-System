import api from "./api";

// PROFİL BİLGİLERİNİ GÜNCELLE
export const updateProfile = async (profileData) => {
  const response = await api.put(
    "/settings/profile",
    profileData
  );

  return response.data;
};

// ŞİFRE DEĞİŞTİR
export const changePassword = async (passwordData) => {
  const response = await api.put(
    "/settings/password",
    passwordData
  );

  return response.data;
};
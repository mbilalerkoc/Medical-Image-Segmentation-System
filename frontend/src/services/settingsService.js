import api from "./api";

/* PROFİL BİLGİLERİ */
export const updateProfile = async (profileData) => {
  const response = await api.put(
    "/settings/profile",
    profileData,
  );

  return response.data;
};

/* PROFİL FOTOĞRAFI */
export const uploadProfilePhoto = async (file) => {
  const formData = new FormData();

  formData.append(
    "profil_resmi",
    file,
    file.name,
  );

  const response = await api.put(
    "/settings/profile/photo",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  return response.data;
};

/* PROFİL FOTOĞRAFI SİL */
export const deleteProfilePhoto = async () => {
  const response = await api.delete(
    "/settings/profile/photo",
  );

  return response.data;
};

/* ŞİFRE DEĞİŞTİR */
export const changePassword = async (passwordData) => {
  const response = await api.put(
    "/settings/password",
    passwordData,
  );

  return response.data;
};

/* PROFİL FOTOĞRAFI URL */
export const getProfilePhotoUrl = (photoPath) => {
  if (!photoPath) return null;

  if (
    photoPath.startsWith("http://") ||
    photoPath.startsWith("https://") ||
    photoPath.startsWith("data:") ||
    photoPath.startsWith("blob:")
  ) {
    return photoPath;
  }

  const baseURL = api.defaults.baseURL || "";

  if (baseURL.startsWith("http")) {
    try {
      const origin = new URL(baseURL).origin;

      return `${origin}${
        photoPath.startsWith("/") ? "" : "/"
      }${photoPath}`;
    } catch {
      return photoPath;
    }
  }

  return photoPath;
};
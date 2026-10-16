import api from "./api";

// RANDEVULARI GETİR
export const getAppointments = async (filter = "all") => {
  const response = await api.get("/appointments", {
    params: {
      filter,
    },
  });

  return response.data;
};

// RANDEVU DURUMUNU GÜNCELLE
export const updateAppointmentStatus = async (
  appointmentId,
  durum
) => {
  const response = await api.patch(
    `/appointments/${appointmentId}/status`,
    {
      durum,
    }
  );

  return response.data;
};

// DOKTOR MÜSAİTLİĞİNİ GETİR
export const getAvailability = async () => {
  const response = await api.get(
    "/appointments/availability"
  );

  return response.data;
};

// DOKTOR MÜSAİTLİĞİNİ KAYDET
export const saveAvailability = async (
  musaitlikler
) => {
  const response = await api.put(
    "/appointments/availability",
    {
      musaitlikler,
    }
  );

  return response.data;
};

// YENİ RANDEVU OLUŞTUR
// 8. adımda kullanacağız
export const createAppointment = async (
  appointmentData
) => {
  const response = await api.post(
    "/appointments",
    appointmentData
  );

  return response.data;
};
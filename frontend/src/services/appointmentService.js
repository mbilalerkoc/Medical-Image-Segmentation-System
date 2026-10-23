import api from "./api";

export const getAppointments = async (filter = "all") => {
  const response = await api.get("/appointments", {
    params: {
      filter,
    },
  });

  return response.data;
};

export const updateAppointmentStatus = async (appointmentId, durum) => {
  const response = await api.patch(`/appointments/${appointmentId}/status`, {
    durum,
  });

  return response.data;
};

export const getAvailability = async () => {
  const response = await api.get("/appointments/availability");

  return response.data;
};

export const saveAvailability = async (musaitlikler) => {
  const response = await api.put("/appointments/availability", {
    musaitlikler,
  });

  return response.data;
};

export const createAppointment = async (appointmentData) => {
  const response = await api.post("/appointments", appointmentData);

  return response.data;
};

export const getAvailableSlots = async (date, duration = 30) => {
  const response = await api.get("/appointments/availability/slots", {
    params: {
      date,
      duration,
    },
  });

  return response.data;
};

import api from './api';

export const loginUser = async (email, sifre) => {
  const response = await api.post('/auth/login', { email, sifre });
  return response.data;
};

export const logoutUser = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};
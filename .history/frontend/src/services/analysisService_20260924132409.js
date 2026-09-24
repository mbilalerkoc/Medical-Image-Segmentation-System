import api from './api';

// Orijinal kodundaki çalışan test token'ını buraya geri aldık
const TEST_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicm9sIjoic3VwZXJhZG1pbiIsImlhdCI6MTc4OTkzMDgxNiwiZXhwIjoxNzkyNTIyODE2fQ.QVJEgEOsxfKx2jm0_0wbzlCVZhb0jExPQpGg_L_BVGQ";

export const predictAnalysis = async (model, formData) => {
  const response = await api.post(`/analyze/predict/${model}`, formData, {
    headers: { 
      'Authorization': `Bearer ${TEST_TOKEN}`, // Token'ı manuel eziyoruz
      'Content-Type': 'multipart/form-data' 
    }
  });
  return response.data;
};

export const createReport = async (payload) => {
  const response = await api.post('/reports/create', payload, {
    headers: {
      'Authorization': `Bearer ${TEST_TOKEN}` // Rapor kaydında da aynı token
    }
  });
  return response.data;
};
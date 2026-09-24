import axios from 'axios';
// DİKKAT: api.js kullanmıyoruz, çünkü interceptor bizim TEST_TOKEN'ımızı eziyor!

const TEST_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicm9sIjoic3VwZXJhZG1pbiIsImlhdCI6MTc4OTkzMDgxNiwiZXhwIjoxNzkyNTIyODE2fQ.QVJEgEOsxfKx2jm0_0wbzlCVZhb0jExPQpGg_L_BVGQ";

export const predictAnalysis = async (model, formData) => {
  // Senin orijinal kodundaki gibi saf axios.post kullanıyoruz
  const response = await axios.post(`http://localhost:5000/api/analyze/predict/${model}`, formData, {
    headers: { 
      'Authorization': `Bearer ${TEST_TOKEN}`,
      'Content-Type': 'multipart/form-data' 
    }
  });
  return response.data;
};

export const createReport = async (payload) => {
  const response = await axios.post('http://localhost:5000/api/reports/create', payload, {
    headers: {
      'Authorization': `Bearer ${TEST_TOKEN}`
    }
  });
  return response.data;
};
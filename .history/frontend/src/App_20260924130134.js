import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Yeni mimarideki sayfa importları
import Login from './features/auth/Login';
import Dashboard from './features/dashboard/Dashboard';
import PatientList from './features/patients/PatientList';
import NewAnalysis from './features/analysis/NewAnalysis';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      
      {/* İleride bu rotaları PrivateRoute (Sadece giriş yapanlar görebilir) ile sarmalayabilirsin */}
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/patients" element={<PatientList />} />
      <Route path="/analyze" element={<NewAnalysis />} />
    </Routes>
  );
};

export default AppRoutes;
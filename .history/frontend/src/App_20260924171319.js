import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// YENİ: ../ yerine ./ kullanıldı
import Login from './features/auth/Login';
import Dashboard from './features/dashboard/Dashboard';
import PatientList from './features/patients/PatientList';
import NewAnalysis from './features/analysis/NewAnalysis';
import AnalysisDetail from '../features/analysis/AnalysisDetail';

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/patients" element={<PatientList />} />
      <Route path="/analyze" element={<NewAnalysis />} />
    </Routes>
  );
};

export default App;
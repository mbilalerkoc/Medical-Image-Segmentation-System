import React from 'react';  
i
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import NewAnalysis from './pages/doctor/NewAnalysis';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        {/* Ana dizine gelindiğinde direkt dashboard'a yönlendir */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        {/* Sayfa Rotaları */}
        <Route path="/dashboard" element={<DoctorDashboard />} />
        <Route path="/analyze" element={<NewAnalysis />} />
      </Routes>
    </Router>
  );
}

export default App;
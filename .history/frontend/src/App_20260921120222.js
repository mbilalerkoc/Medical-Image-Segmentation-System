import React from 'react';  
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Sayfalar
import Login from './pages/Login';
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import NewAnalysis from './pages/doctor/NewAnalysis';

function App() {
  return (
    <Router>
      <Routes>
        {/* Kullanıcı siteye (localhost:3000) ilk girdiğinde direkt Login sayfasına yönlendirilir */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* Auth (Kimlik Doğrulama) Rotaları */}
        <Route path="/login" element={<Login />} />
        
        {/* Doktor Rotaları */}
        <Route path="/dashboard" element={<DoctorDashboard />} />
        <Route path="/analyze" element={<NewAnalysis />} />
      </Routes>
    </Router>
  );
}

export default App;
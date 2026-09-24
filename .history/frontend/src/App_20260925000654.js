import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// YENİ: ../ yerine ./ kullanıldı
import Login from "./features/auth/Login";
import Dashboard from "./features/dashboard/Dashboard";
import PatientList from "./features/patients/PatientList";
import NewAnalysis from "./features/analysis/NewAnalysis";
import AnalysisDetail from "./features/analysis/AnalysisDetail";
import PatientDetail from "./features/patients/PatientDetail";
import ProtectedRoute from "./components/ProtectedRoute";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/patients" element={<PatientList />} />
      <Route path="/analyze" element={<NewAnalysis />} />
      <Route path="/analyses/:id" element={<AnalysisDetail />} />
      <Route path="/patients/:id" element={<PatientDetail />} />
    </Routes>

    <Routes>

  {/* GİRİŞ SAYFASI */}
  <Route
    path="/login"
    element={<Login />}
  />

  {/* KORUMALI SAYFALAR */}
  <Route element={<ProtectedRoute />}>

    <Route
      path="/dashboard"
      element={<Dashboard />}
    />

    <Route
      path="/analyze"
      element={<NewAnalysis />}
    />

    <Route
      path="/patients"
      element={<PatientList />}
    />

    <Route
      path="/patients/:id"
      element={<PatientDetail />}
    />

    <Route
      path="/analyses/:id"
      element={<AnalysisDetail />}
    />

    <Route
      path="/settings"
      element={<Settings />}
    />

  </Route>

</Routes>
  );
};

export default App;

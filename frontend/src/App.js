import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./features/auth/Login";

import Dashboard from "./features/doctor/dashboard/Dashboard";
import Appointments from "./features/doctor/appointments/Appointments";
import PatientList from "./features/doctor/patients/PatientList";
import PatientDetail from "./features/doctor/patients/PatientDetail";
import NewAnalysis from "./features/doctor/analysis/NewAnalysis";
import AnalysisDetail from "./features/doctor/analysis/AnalysisDetail";

import Settings from "./features/doctor/settings/Settings";
import Notifications from "./features/notifications/Notifications";

import ProtectedRoute from "./components/ProtectedRoute";
import RoleRoute from "./routes/RoleRoute";

const App = () => {
  return (
    <Routes>
      <Route
        path="/"
        element={
          localStorage.getItem("token") ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route path="/login" element={<Login />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/notifications" element={<Notifications />} />

        <Route element={<RoleRoute allowedRoles={["doktor"]} />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/analyze" element={<NewAnalysis />} />
          <Route path="/patients" element={<PatientList />} />
          <Route path="/patients/:id" element={<PatientDetail />} />
          <Route path="/analyses/:id" element={<AnalysisDetail />} />
          <Route path="/appointments" element={<Appointments />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
};

export default App;

import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./features/auth/Login";
import SetPassword from "./features/auth/set-password/SetPassword";

import DoctorDashboard from "./features/doctor/dashboard/Dashboard";
import Appointments from "./features/doctor/appointments/Appointments";
import PatientList from "./features/doctor/patients/PatientList";
import PatientDetail from "./features/doctor/patients/PatientDetail";
import NewAnalysis from "./features/doctor/analysis/NewAnalysis";
import AnalysisDetail from "./features/doctor/analysis/AnalysisDetail";
import Settings from "./features/doctor/settings/Settings";

import PatientDashboard from "./features/patient/dashboard/Dashboard";
import PatientAnalyses from "./features/patient/analyses/Analyses";
import PatientReports from "./features/patient/reports/Reports";
import PatientReportDetail from "./features/patient/reports/ReportDetail";
import PatientAppointments from "./features/patient/appointments/Appointments";
import PatientSettings from "./features/patient/settings/Settings";

import Notifications from "./features/notifications/Notifications";

import RoleRoute from "./routes/RoleRoute";

const getHomePath = () => {
  const token = localStorage.getItem("token");

  if (!token) {
    return "/login";
  }

  try {
    const user = JSON.parse(localStorage.getItem("user")) || {};

    if (user.rol === "doktor") {
      return "/dashboard";
    }

    if (user.rol === "hasta") {
      return "/patient/dashboard";
    }

    return "/login";
  } catch (error) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    return "/login";
  }
};

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to={getHomePath()} replace />} />

      <Route path="/login" element={<Login />} />

      <Route path="/set-password" element={<SetPassword />} />

      <Route element={<RoleRoute />}>
        <Route path="/notifications" element={<Notifications />} />

        <Route element={<RoleRoute allowedRoles={["doktor"]} />}>
          <Route path="/dashboard" element={<DoctorDashboard />} />

          <Route path="/analyze" element={<NewAnalysis />} />

          <Route path="/patients" element={<PatientList />} />

          <Route path="/patients/:id" element={<PatientDetail />} />

          <Route path="/analyses/:id" element={<AnalysisDetail />} />

          <Route path="/appointments" element={<Appointments />} />

          <Route path="/settings" element={<Settings />} />
        </Route>

        <Route element={<RoleRoute allowedRoles={["hasta"]} />}>
          <Route path="/patient/dashboard" element={<PatientDashboard />} />

          <Route path="/patient/analyses" element={<PatientAnalyses />} />

          <Route path="/patient/reports" element={<PatientReports />} />

          <Route
            path="/patient/reports/:id"
            element={<PatientReportDetail />}
          />
          <Route
            path="/patient/appointments"
            element={<PatientAppointments />}
          />
          <Route path="/patient/settings" element={<PatientSettings />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
};

export default App;

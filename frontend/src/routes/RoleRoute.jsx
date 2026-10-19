import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const RoleRoute = ({ allowedRoles }) => {
  let user = {};

  try {
    user = JSON.parse(localStorage.getItem("user")) || {};
  } catch (error) {
    console.error("Kullanıcı bilgisi okunamadı:", error);
  }

  if (!user.rol) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.rol)) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default RoleRoute;
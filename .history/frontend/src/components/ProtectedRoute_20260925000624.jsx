import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
  const token = localStorage.getItem("token");
  const userStr = localStorage.getItem("user");

  let user = null;

  try {
    user = userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    localStorage.removeItem("user");
    localStorage.removeItem("token");

    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  if (!token || !user) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  return <Outlet />;
};

export default ProtectedRoute;
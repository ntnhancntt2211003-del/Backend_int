import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, requiredRole }) => {
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");

  // Nếu không có token, redirect to login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Nếu yêu cầu role cụ thể (ví dụ: admin)
  if (requiredRole && user) {
    try {
      const userData = JSON.parse(user);
      if (userData.role !== requiredRole) {
        return <Navigate to="/" replace />;
      }
    } catch (error) {
      console.error("Error parsing user data:", error);
      return <Navigate to="/login" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;

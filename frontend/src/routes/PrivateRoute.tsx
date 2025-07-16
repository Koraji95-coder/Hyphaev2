// src/routes/PrivateRoute.tsx
import React from "react"; // ← Required for JSX in this file!
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

type PrivateRouteProps = {
  children: React.ReactElement; // Use React.ReactElement for a single child
};

const PrivateRoute = ({ children }: PrivateRouteProps) => {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute;

import { Navigate, Outlet } from "react-router-dom";
import { useIsAuthenticated } from "@azure/msal-react";

const ProtectedRoute = () => {
  const isAuthenticated = useIsAuthenticated();

  return isAuthenticated ? <Outlet /> : <Navigate to="/" replace />;
};

export default ProtectedRoute;

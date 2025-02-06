import { Navigate, Outlet } from "react-router-dom";
import { useMsal } from "@azure/msal-react";
import { useEffect, useState } from "react";

const ProtectedRoute = () => {
  const { instance } = useMsal();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const activeAccount = instance.getActiveAccount();
        const storedToken = localStorage.getItem("idToken");

        if (!activeAccount || !storedToken) {
          setIsAuthenticated(false);
        } else {
          try {
            const response = await instance.acquireTokenSilent({
              scopes: ["openid", "profile", "email"],
              account: activeAccount,
            });
            localStorage.setItem("idToken", response.idToken);
            setIsAuthenticated(true);
          } catch (error) {
            console.warn("Silent token refresh failed:", error);
            setIsAuthenticated(false);
          }
        }
      } catch (error) {
        console.error("Authentication check failed:", error);
        setIsAuthenticated(false);
      }
      setLoading(false);
    };

    checkAuth();
  }, [instance]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/" replace />;
};

export default ProtectedRoute;

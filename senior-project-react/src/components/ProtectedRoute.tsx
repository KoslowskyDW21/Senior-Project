import { Navigate, Outlet } from "react-router-dom";
import { useMsal } from "@azure/msal-react";
import { useEffect, useState } from "react";
import axios from "axios";
import config from "../config";
import Banned from "./Banned";

const ProtectedRoute = () => {
  const { instance } = useMsal();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isBanned, setBanned] = useState(false);

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

            await axios.get(`${config.serverUrl}/admin/ban`)
            .then((response) => {
              setBanned(response.data.banned)
            })
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
  if (isBanned) {
    return <Banned />;
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/" replace />;
};

export default ProtectedRoute;

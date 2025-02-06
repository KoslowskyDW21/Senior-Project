import { useState, useEffect } from "react";
import { msalConfig } from "../authConfig";
import { PublicClientApplication } from "@azure/msal-browser";

const msalInstance = new PublicClientApplication(msalConfig);

// Custom Hook for refreshing ID Token
const useIdTokenRefresher = () => {
  const [idToken, setIdToken] = useState<string | null>(null);

  // Function to check if the token has expired
  const isTokenExpired = (token: string) => {
    const expiry = JSON.parse(atob(token.split(".")[1])).exp * 1000; // Decode and check the expiry
    return Date.now() > expiry;
  };

  // Refresh the ID Token using the MSAL library
  const refreshIdToken = async () => {
    try {
      const response = await msalInstance.acquireTokenSilent({
        scopes: ["openid", "profile", "email"], // Add other scopes as necessary
        account: msalInstance.getActiveAccount() || undefined,
      });
      setIdToken(response.idToken || null);
      return response.idToken;
    } catch (error) {
      console.warn("Token renewal failed using silent request:", error);
      // If silent request fails, try acquiring the token via popup
      const response = await msalInstance.acquireTokenPopup({
        scopes: ["openid", "profile", "email"],
      });
      setIdToken(response.idToken);
      return response.idToken;
    }
  };

  // Check if the token is expired on component mount
  useEffect(() => {
    const storedToken = localStorage.getItem("idToken");
    if (storedToken && isTokenExpired(storedToken)) {
      refreshIdToken();
    } else {
      setIdToken(storedToken);
    }
  }, []);

  return {
    idToken,
    refreshIdToken,
  };
};

export default useIdTokenRefresher;

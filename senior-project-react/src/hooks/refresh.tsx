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
        scopes: ["openid", "profile", "email"],
        account: msalInstance.getActiveAccount() || undefined,
      });
      setIdToken(response.idToken || null);
      return response.idToken;
    } catch (error: any) {
      if (error.name === "InteractionRequiredAuthError") {
        console.warn("Silent token request failed, requesting popup...");
        const response = await msalInstance.acquireTokenPopup({
          scopes: ["openid", "profile", "email"],
        });
        setIdToken(response.idToken);
        return response.idToken;
      }
      console.error("Token refresh failed:", error);
      return null;
    }
  };

  // Check if the token is expired on component mount
  useEffect(() => {
    const storedToken = localStorage.getItem("idToken");
    if (storedToken && isTokenExpired(storedToken)) {
      refreshIdToken().then((newToken) => {
        if (newToken) {
          localStorage.setItem("idToken", newToken);
        }
      });
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

import { useMsal } from "@azure/msal-react";
import { useEffect } from "react";

const useIdTokenRefresher = () => {
  const { instance } = useMsal();

  useEffect(() => {
    const refreshInterval = setInterval(async () => {
      const activeAccount = instance.getActiveAccount();
      if (activeAccount) {
        try {
          const tokenResponse = await instance.acquireTokenSilent({
            scopes: ["openid", "profile", "email"],
            account: activeAccount,
            forceRefresh: true, // Ensure it gets a fresh token
          });
          console.log("ID Token refreshed:", tokenResponse.idToken);
        } catch (error) {
          console.error("ID Token refresh failed:", error);
        }
      }
    }, 50 * 60 * 1000); // Refresh every 50 minutes

    return () => clearInterval(refreshInterval);
  }, [instance]);
};

export default useIdTokenRefresher;

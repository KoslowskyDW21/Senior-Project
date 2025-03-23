import { useEffect } from "react";
import axios from "axios";
import { Box, Button, Container } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useMsal } from "@azure/msal-react";
import config from "../config.js";

const Login = () => {
  const navigate = useNavigate();
  const { instance } = useMsal();

  // Retrieve the ID token from the active session after redirect
  const getIdToken = async () => {
    try {
      const activeAccount = instance.getActiveAccount();

      // Use undefined if no active account is found
      const response = await instance.acquireTokenSilent({
        scopes: ["openid", "profile", "email"],
        account: activeAccount || undefined, // Ensure account is either AccountInfo or undefined
        forceRefresh: true,
      });

      const idToken = response.idToken;

      // Check if idToken is undefined
      if (!idToken) {
        throw new Error("ID Token acquisition failed");
      }

      return idToken; // Return token only if it is not undefined
    } catch (error) {
      console.warn(
        "Silent token acquisition failed, trying redirect flow instead:",
        error
      );
      // If silent token acquisition fails, attempt redirect flow instead
      await instance.acquireTokenRedirect({
        scopes: ["openid", "profile", "email"],
      });
    }
  };

  const handleSSOLogin = async () => {
    try {
      let activeAccount = instance.getActiveAccount();

      if (!activeAccount) {
        const allAccounts = instance.getAllAccounts();

        if (allAccounts.length > 0) {
          instance.setActiveAccount(allAccounts[0]);
          activeAccount = instance.getActiveAccount();
        } else {
          // No existing account, initiate login redirect
          instance.loginRedirect({
            scopes: ["openid", "profile", "email"],
          });
          return; // Stop further execution until the redirect is complete
        }
      }

      const idToken = await getIdToken();

      // Send ID Token to backend
      const response = await axios.post(
        `${config.serverUrl}/login/sso/`,
        { token: idToken },
        { withCredentials: true }
      );

      console.log("Backend Response:", response.data);
      axios.defaults.headers.common["Authorization"] = `Bearer ${idToken}`;

      if (response.data.message === "Login successful") {
        if (idToken) {
          localStorage.setItem("idToken", idToken);
          navigate("/recipes");
        }
      } else if (response.data.message === "User not registered") {
        navigate("/registration-one");
      }
    } catch (error) {
      console.error("SSO Login Failed", error);
    }
  };

  useEffect(() => {
    instance
      .handleRedirectPromise()
      .then((response) => {
        if (response) {
          const idToken = response.idToken;
          localStorage.setItem("idToken", idToken);
          handleSSOLogin();
        }
      })
      .catch((error) => {
        console.error("Error in redirect handling", error);
      });
  }, [instance, navigate]);

  return (
    <Container>
      <Box
        sx={{
          width: 300,
          height: 300,
          backgroundColor: "lightgray",
          borderRadius: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <img
          src={`${config.serverUrl}/static/uploads/2cc38bfefa3a4e26b89ac081ff6cf7df_cook.jpg`}
          alt="Image"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </Box>
      <br />
      <Button
        onClick={handleSSOLogin}
        variant="contained"
        color="primary"
        fullWidth
        sx={{ mt: 4 }}
      >
        Login
      </Button>
    </Container>
  );
};

export default Login;

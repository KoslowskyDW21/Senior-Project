import { useState, useEffect } from "react"; //react
import axios from "axios";
import { Box, Button, Container } from "@mui/material"; //matui components
import { useNavigate } from "react-router-dom"; // React Router for nav
import { useMsal } from "@azure/msal-react";
import * as msal from "@azure/msal-browser";

interface LoginResponse {
  message: string;
}

const Login = () => {
  useEffect(() => {
    const token = localStorage.getItem("idToken");
    console.log("Stored Token:", token);
  }, []);

  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const { instance } = useMsal();

  // Retrieve the ID token from the active session
  const getIdToken = async () => {
    try {
      return (
        await instance.acquireTokenSilent({
          scopes: ["openid", "profile", "email"],
          account: instance.getActiveAccount() || undefined,
          forceRefresh: true,
        })
      ).idToken;
    } catch (error) {
      console.warn(
        "Silent token acquisition failed, falling back to popup:",
        error
      );
      return (
        await instance.acquireTokenPopup({
          scopes: ["openid", "profile", "email"],
        })
      ).idToken;
    }
  };

  const handleSSOLogin = async () => {
    try {
      // Check if there is already an active account
      let activeAccount = instance.getActiveAccount();

      if (!activeAccount) {
        const allAccounts = instance.getAllAccounts();

        if (allAccounts.length > 0) {
          instance.setActiveAccount(allAccounts[0]); // Set active account only once
          activeAccount = instance.getActiveAccount();
        } else {
          // No existing account, proceed with login
          const loginResponse = await instance.loginPopup();
          instance.setActiveAccount(instance.getAllAccounts()[0]); // Set new account
          activeAccount = instance.getActiveAccount();
        }
      }

      const idToken = await getIdToken();

      // Send ID Token to backend
      const response = await axios.post<LoginResponse>(
        "http://127.0.0.1:5000/api/login/sso/",
        { token: idToken },
        { withCredentials: true }
      );

      console.log("Backend Response:", response.data);
      axios.defaults.headers.common["Authorization"] = `Bearer ${idToken}`;

      if (response.data.message === "Login successful") {
        console.log("ID Token:", idToken);
        localStorage.setItem("idToken", idToken);
        console.log("MSAL Account Info:", instance.getAccount);
        console.log("All MSAL Accounts:", instance.getAllAccounts());
        navigate("/recipes");
        console.log("Stored Token:", localStorage.getItem("idToken"));
      } else if (response.data.message === "User not registered") {
        navigate("/registration-one");
      }
    } catch (error) {
      console.error("SSO Login Failed", error);
    }
  };
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
          src="http://127.0.0.1:5000/static\uploads\2cc38bfefa3a4e26b89ac081ff6cf7df_cook.jpg"
          alt="Image"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </Box>
      <br></br>
      <Button
        onClick={() => handleSSOLogin()}
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

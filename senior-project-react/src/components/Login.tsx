import { useState } from "react"; //react
import axios from "axios";
import { Button, Container } from "@mui/material"; //matui components
import { useNavigate } from "react-router-dom"; // React Router for nav
import { useMsal } from "@azure/msal-react";
import * as msal from "@azure/msal-browser";

interface LoginResponse {
  message: string;
}

const Login = () => {
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const { instance } = useMsal();

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

      // Retrieve the ID token from the active session
      const getIdToken = async () => {
        try {
          return (
            await instance.acquireTokenSilent({
              scopes: ["openid", "profile", "email"],
              account: instance.getActiveAccount() || undefined,
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
      const idToken = await getIdToken();

      console.log("ID Token:", idToken);

      // Send ID Token to backend
      const response = await axios.post<LoginResponse>(
        "http://127.0.0.1:5000/api/login/sso/",
        { token: idToken },
        { withCredentials: true }
      );

      console.log("Backend Response:", response.data);

      if (response.data.message === "Login successful") {
        console.log("MSAL Account Info:", instance.getAccount);
        console.log("All MSAL Accounts:", instance.getAllAccounts());
        navigate("/recipes");
      } else if (response.data.message === "User not registered") {
        navigate("/registration-one");
      }
    } catch (error) {
      console.error("SSO Login Failed", error);
    }
  };
  return (
    <Container>
      <h2>Let Them Cook</h2>
      <br></br>
      <Button
        onClick={() => handleSSOLogin()}
        variant="contained"
        color="primary"
        fullWidth
        sx={{ mt: 4 }}
      >
        Login with SSO
      </Button>
    </Container>
  );
};

export default Login;

import { useState, useEffect } from "react"; //react
import { useRegistration } from "./RegistrationContext";
import axios, { AxiosError } from "axios";
import { Button, TextField, Container, Box } from "@mui/material"; //matui components
import { useNavigate } from "react-router-dom"; // React Router for nav
import { useMsal } from "@azure/msal-react";
import config from "../config.js";

const RegisterOne = () => {
  const { data, setData } = useRegistration();
  const { instance } = useMsal();
  const navigate = useNavigate();

  //To handle errors from invalid entries
  const [errors, setErrors] = useState({
    username: "",
    email: "",
  });

  let activeAccount = instance.getActiveAccount();

  const getInitData = async () => {
    try {
      const idToken = (
        await instance.acquireTokenSilent({
          scopes: ["openid", "profile", "email"],
          account: activeAccount || undefined,
        })
      ).idToken;
      const response = await axios.post<any>(
        `${config.serverUrl}/login/get_initial_data`,
        { token: idToken },
        { withCredentials: true }
      );
      console.log("Initial data", response.data);
      setData({
        ...data,
        fname: response.data.fname,
        lname: response.data.lname,
        email: response.data.email,
      });
    } catch (error) {
      console.error("Getting User Failed", error);
    }
  };

  //Form validation
  const validateForm = async () => {
    const newErrors = {
      username: "",
      email: "",
    };

    if (!data.username.trim()) {
      newErrors.username = "Username is required";
    }

    // validating email and username aren't used
    try {
      console.log("Validating user");
      const response = await axios.post(
        `${config.serverUrl}/login/validate_user`,
        {
          username: data.username,
          email: data.email,
        }
      );
      if (!response.data.valid) {
        if (response.data.message.includes("Username")) {
          newErrors.username = response.data.message;
          console.log("invalid username");
        }
        if (response.data.message.includes("Email")) {
          newErrors.email = response.data.message;
          console.log("Invalid email");
        }
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const apiError = error as AxiosError<{ message: string }>;
        const errorMessage =
          apiError.response?.data.message || "Validation failed";
        if (errorMessage.includes("Username")) {
          newErrors.username = errorMessage;
        }
        if (errorMessage.includes("Email")) {
          newErrors.email = errorMessage;
        }
      }
    }
    setErrors(newErrors);
    return Object.values(newErrors).every((error) => !error);
  };

  const handleNext = async () => {
    const isValid = await validateForm();
    if (isValid) {
      console.log("First registering with", data.fname, data.lname, data.email);
      navigate("/registration-two");
    }
  };

  useEffect(() => {
    getInitData();
  }, []);

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
      <h2>Create Account</h2>
      <TextField
        label="Username*"
        fullWidth
        value={data.username}
        onChange={(e) => setData({ ...data, username: e.target.value })}
        margin="normal"
        error={!!errors.username}
        helperText={errors.username}
      />

      <Button variant="contained" onClick={handleNext} sx={{ mt: 3 }}>
        Next
      </Button>
    </Container>
  );
};

export default RegisterOne;

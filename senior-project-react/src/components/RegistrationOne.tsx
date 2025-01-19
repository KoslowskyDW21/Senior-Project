import { useState } from "react"; //react
import { useRegistration } from "./RegistrationContext";
import axios, { AxiosError } from "axios";
import { Button, TextField, Container } from "@mui/material"; //matui components
import { useNavigate } from "react-router-dom"; // React Router for nav

interface RegisterResponse {
  message: string;
}

//NOTE: This will change a bit once we integrate SSO
const RegisterOne = () => {
  const { data, setData } = useRegistration();
  const navigate = useNavigate();

  const handleNext = async () => {
    console.log(
      "First registering with",
      data.firstName,
      data.lastName,
      data.email
    );
    navigate("/registration-two");
  };

  return (
    <Container>
      <h1>Let Them Cook</h1>
      <h2>Create Account</h2>
      <TextField
        label="First Name"
        fullWidth
        value={data.firstName}
        //...data copies existing data into a new object, ensuring all fields retain their values except one being updated
        onChange={(e) => setData({ ...data, firstName: e.target.value })}
        margin="normal"
      />
      <TextField
        label="Last Name"
        fullWidth
        value={data.lastName}
        onChange={(e) => setData({ ...data, lastName: e.target.value })}
        margin="normal"
      />
      <TextField
        label="Username"
        fullWidth
        value={data.username}
        onChange={(e) => setData({ ...data, username: e.target.value })}
        margin="normal"
      />
      <TextField
        label="Email"
        fullWidth
        value={data.email}
        onChange={(e) => setData({ ...data, email: e.target.value })}
        margin="normal"
      />
      <TextField
        label="Password"
        fullWidth
        type="password"
        value={data.password}
        onChange={(e) => setData({ ...data, password: e.target.value })}
        margin="normal"
      />
      <Button variant="contained" onClick={handleNext}>
        Next
      </Button>
    </Container>
  );
};

export default RegisterOne;

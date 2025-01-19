import { useState } from "react"; //react
import axios, { AxiosError } from "axios";
import { Button, TextField, Container } from "@mui/material"; //matui components
import { useNavigate } from "react-router-dom"; // React Router for nav

interface LoginResponse {
  message: string;
}

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate(); //for navigation

  const handleLogin = async () => {
    //TODO: handle the request to the DB
    console.log("Logging in with", email);

    const loginData = {
      email,
      password,
    };

    try {
      const response = await axios.post(
        "http://127.0.0.1:5000/api/login/",
        loginData
      );

      const data: LoginResponse = response.data;
      setMessage(data.message);
      if (data.message === "Login successful") {
        //TODO: Change this to Recipes or something, this is just to test navigation / routing
        navigate("/recipes");
      }
    } catch (error) {
      // Type the error as AxiosError to get response structure
      const axiosError = error as AxiosError;

      // Check if response and response.data exist and are of type LoginResponse
      if (axiosError.response && axiosError.response.data) {
        const errorData = axiosError.response.data as LoginResponse; // Type assertion
        setMessage(errorData.message); // Error message from server
      } else {
        setMessage("An unknown error occurred");
      }
    }
  };

  return (
    <Container>
      <h2>Let Them Cook</h2>
      <TextField
        label="Email"
        variant="outlined"
        fullWidth
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        margin="normal"
      />
      <TextField
        label="Password"
        variant="outlined"
        fullWidth
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        type="password"
        margin="normal"
      />
      <Button
        onClick={handleLogin}
        variant="contained"
        color="primary"
        fullWidth
      >
        Login
      </Button>
      {message && <p>{message}</p>}
    </Container>
  );
};

export default Login;

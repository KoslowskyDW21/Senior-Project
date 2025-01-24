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

  //To handle errors from invalid entries
  const [errors, setErrors] = useState({
    fname: "",
    lname: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  //Form validation
  const validateForm = async () => {
    const newErrors = {
      fname: "",
      lname: "",
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    };

    if (!data.fname.trim()) {
      newErrors.fname = "First name is required";
    }
    if (!data.lname.trim()) {
      newErrors.lname = "Last name is required";
    }

    if (!data.username.trim()) {
      newErrors.username = "Username is required";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!data.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(data.email)) {
      newErrors.email = "Must be a valid email address";
    }

    if (!data.password.trim()) {
      newErrors.password = "Password is required";
    } else if (data.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (!data.confirmPassword.trim()) {
      newErrors.confirmPassword = "Password is required";
    } else if (data.password !== data.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    // validating email and username aren't used
    try {
      console.log("Validating user");
      const response = await axios.post(
        "http://127.0.0.1:5000/api/validate_user/",
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

  return (
    <Container>
      <h1>Let Them Cook</h1>
      <h2>Create Account</h2>
      <TextField
        label="First Name*"
        fullWidth
        value={data.fname}
        //...data copies existing data into a new object, ensuring all fields retain their values except one being updated
        onChange={(e) => setData({ ...data, fname: e.target.value })}
        margin="normal"
        error={!!errors.fname}
        helperText={errors.fname}
      />
      <TextField
        label="Last Name*"
        fullWidth
        value={data.lname}
        onChange={(e) => setData({ ...data, lname: e.target.value })}
        margin="normal"
        error={!!errors.lname}
        helperText={errors.lname}
      />
      <TextField
        label="Username*"
        fullWidth
        value={data.username}
        onChange={(e) => setData({ ...data, username: e.target.value })}
        margin="normal"
        error={!!errors.username}
        helperText={errors.username}
      />
      <TextField
        label="Email*"
        fullWidth
        value={data.email}
        onChange={(e) => setData({ ...data, email: e.target.value })}
        margin="normal"
        error={!!errors.email}
        helperText={errors.email}
      />
      <TextField
        label="Password*"
        fullWidth
        type="password"
        value={data.password}
        onChange={(e) => setData({ ...data, password: e.target.value })}
        margin="normal"
        error={!!errors.password}
        helperText={errors.password}
      />
      <TextField
        label="Confirm Password*"
        fullWidth
        type="password"
        value={data.confirmPassword}
        onChange={(e) => setData({ ...data, confirmPassword: e.target.value })}
        margin="normal"
        error={!!errors.confirmPassword}
        helperText={errors.confirmPassword}
      />
      <Button variant="contained" onClick={handleNext}>
        Next
      </Button>
    </Container>
  );
};

export default RegisterOne;

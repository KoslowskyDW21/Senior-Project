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
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  //Form validation
  const validateForm = () => {
    const newErrors: typeof errors = {
      firstName: "",
      lastName: "",
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    };

    //ensuring data entry
    if (!data.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }
    if (!data.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }
    if (!data.username.trim()) {
      newErrors.username = "Username is required";
    }

    //email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!data.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(data.email)) {
      newErrors.email = "Must be a valid email address";
    }

    //password validation
    if (!data.password.trim()) {
      newErrors.password = "Password is required";
    } else if (data.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    //confirm password validation
    if (!data.confirmPassword.trim()) {
      newErrors.confirmPassword = "Password is required";
    } else if (data.password !== data.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);

    //loops through all errors and checks if any have been set
    return Object.values(newErrors).every((error) => !error);
  };

  const handleNext = async () => {
    if (validateForm()) {
      console.log(
        "First registering with",
        data.firstName,
        data.lastName,
        data.email
      );
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
        value={data.firstName}
        //...data copies existing data into a new object, ensuring all fields retain their values except one being updated
        onChange={(e) => setData({ ...data, firstName: e.target.value })}
        margin="normal"
        error={!!errors.firstName}
        helperText={errors.firstName}
      />
      <TextField
        label="Last Name*"
        fullWidth
        value={data.lastName}
        onChange={(e) => setData({ ...data, lastName: e.target.value })}
        margin="normal"
        error={!!errors.lastName}
        helperText={errors.lastName}
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
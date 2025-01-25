import { useState } from "react"; //react
import { useRegistration } from "./RegistrationContext";
import axios, { AxiosError } from "axios";
import {
  Checkbox,
  Container,
  FormGroup,
  FormControlLabel,
} from "@mui/material"; //matui components
import { useNavigate } from "react-router-dom"; // React Router for nav

const RegisterTwo = () => {
  const { data, setData } = useRegistration();
  const navigate = useNavigate();

  const handleChange = (restriction: keyof typeof data.dietaryRestrictions) => {
    setData({
      ...data,
      dietaryRestrictions: {
        ...data.dietaryRestrictions,
        [restriction]: !data.dietaryRestrictions[restriction],
      },
    });
  };

  const handleNext = async () => {
    navigate("/registration-three");
  };

  return (
    <Container>
      <h1>Let Them Cook</h1>
      <h2>Dietary Restrictions</h2>
      <FormGroup>
        {Object.entries(data.dietaryRestrictions).map(([key, value]) => (
          <FormControlLabel
            key={key}
            control={
              <Checkbox
                checked={value}
                onChange={() =>
                  handleChange(key as keyof typeof data.dietaryRestrictions)
                }
              />
            }
            label={key}
          />
        ))}
      </FormGroup>
      <button onClick={handleNext}>Continue</button>
    </Container>
  );
};

export default RegisterTwo;

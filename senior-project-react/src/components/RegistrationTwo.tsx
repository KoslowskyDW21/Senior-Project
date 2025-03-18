import { useRegistration } from "./RegistrationContext";
import {
  Button,
  Box,
  Checkbox,
  Container,
  FormGroup,
  FormControlLabel,
} from "@mui/material"; //matui components
import { useNavigate } from "react-router-dom"; // React Router for nav
import config from "../config.js";

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

  const getCheckedRestrictions = () => {
    return Object.keys(data.dietaryRestrictions).filter(
      (key) =>
        data.dietaryRestrictions[key as keyof typeof data.dietaryRestrictions]
    );
  };

  const handleNext = async () => {
    console.log(getCheckedRestrictions());
    navigate("/registration-three");
  };

  return (
    <Container>
      <Box
        sx={{
          width: 150,
          height: 150,
          backgroundColor: "lightgray",
          borderRadius: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          mx: "auto", // Centers the Box horizontally
        }}
      >
        <img
          src={`${config.serverUrl}/static/uploads/2cc38bfefa3a4e26b89ac081ff6cf7df_cook.jpg`}
          alt="Image"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </Box>
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
      <Button variant="contained" onClick={handleNext} sx={{ mt: 3 }}>
        Continue
      </Button>
    </Container>
  );
};

export default RegisterTwo;

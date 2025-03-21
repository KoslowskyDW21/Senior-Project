import { useRegistration } from "./RegistrationContext";
import {
  Box,
  Button,
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

  const handleChange = (cuisine: keyof typeof data.cuisines) => {
    setData({
      ...data,
      cuisines: {
        ...data.cuisines,
        [cuisine]: !data.cuisines[cuisine],
      },
    });
  };

  const getCheckedCuisines = () => {
    return Object.keys(data.cuisines).filter(
      (key) => data.cuisines[key as keyof typeof data.cuisines]
    );
  };

  const handleNext = async () => {
    console.log(getCheckedCuisines());
    navigate("/registration-four");
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
      <h2>Cuisines</h2>
      <FormGroup>
        {Object.entries(data.cuisines).map(([key, value]) => (
          <FormControlLabel
            key={key}
            control={
              <Checkbox
                checked={value}
                onChange={() => handleChange(key as keyof typeof data.cuisines)}
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

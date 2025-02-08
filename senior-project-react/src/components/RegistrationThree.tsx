import { useRegistration } from "./RegistrationContext";
import {
  Button,
  Checkbox,
  Container,
  FormGroup,
  FormControlLabel,
} from "@mui/material"; //matui components
import { useNavigate } from "react-router-dom"; // React Router for nav

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
      <h1>Let Them Cook</h1>
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
      <Button variant="contained" onClick={handleNext}>
        Continue
      </Button>
    </Container>
  );
};

export default RegisterTwo;

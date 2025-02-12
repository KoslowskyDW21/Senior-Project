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
      <Button variant="contained" onClick={handleNext}>
        Continue
      </Button>
    </Container>
  );
};

export default RegisterTwo;

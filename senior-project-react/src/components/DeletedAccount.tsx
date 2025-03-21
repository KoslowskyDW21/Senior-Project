import { Button, Container } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function DeletedAccount() {
  const navigate = useNavigate();
  const handleNext = async () => {
    console.log("Navigating to create account");
    navigate("/");
  };

  return (
    <Container>
      <h2>We're sorry to see you go :(</h2>
      <Button
        onClick={handleNext}
        variant="contained"
        color="primary"
        fullWidth
        sx={{ mt: 4 }}
      >
        Create Account
      </Button>
    </Container>
  );
}

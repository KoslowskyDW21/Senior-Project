import axios, { AxiosError } from "axios";
import { useState } from "react"; //react
import { useRegistration, Floor, Side } from "./RegistrationContext";
import { useNavigate } from "react-router-dom"; // React Router for nav
import {
  Button,
  Container,
  MenuItem,
  Select,
  InputLabel,
  SelectChangeEvent,
} from "@mui/material";

interface RegistrationResponse {
  message: string;
}

const PageTwo = () => {
  const { data, setData } = useRegistration();
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleFloorChange = (event: SelectChangeEvent<Floor>) => {
    setData({ ...data, floor: event.target.value as Floor });
  };

  const handleSideChange = (event: SelectChangeEvent<Side>) => {
    setData({ ...data, side: event.target.value as Side });
  };

  const handleNext = async () => {
    console.log("Now registering with", data.floor, data.side);

    try {
      const response = await axios.post(
        "http://127.0.0.1:5000/api/register/",
        data
      );

      const responseData: RegistrationResponse = response.data;
      setMessage(responseData.message);
      if (responseData.message === "Registration successful") {
        //TODO: Change this to Recipes or something, this is just to test navigation / routing
        navigate("/recipes");
      }
    } catch (error) {
      // Type the error as AxiosError to get response structure
      const axiosError = error as AxiosError;

      // Check if response and response.data exist and are of type LoginResponse
      if (axiosError.response && axiosError.response.data) {
        const errorData = axiosError.response.data as RegistrationResponse; // Type assertion
        setMessage(errorData.message); // Error message from server
      } else {
        setMessage("An unknown error occurred");
      }
    }
  };

  return (
    <Container>
      <h2>Hall Details</h2>
      <InputLabel id="floor-label">Floor</InputLabel>
      <Select
        labelId="floor-label"
        value={data.floor}
        onChange={handleFloorChange}
        fullWidth
        style={{ marginBottom: "16px" }}
      >
        {Object.values(Floor)
          .filter((value) => typeof value === "number")
          .map((floor) => (
            <MenuItem key={floor} value={floor}>
              Floor {floor}
            </MenuItem>
          ))}
      </Select>

      <InputLabel id="side-label">Side</InputLabel>
      <Select
        labelId="side-label"
        value={data.side}
        onChange={handleSideChange}
        fullWidth
        style={{ marginBottom: "16px" }}
      >
        {Object.values(Side).map((side) => (
          <MenuItem key={side} value={side}>
            {side}
          </MenuItem>
        ))}
      </Select>

      <Button
        onClick={handleNext}
        variant="contained"
        color="primary"
        fullWidth
      >
        Next
      </Button>
    </Container>
  );
};

export default PageTwo;

import axios, { AxiosError } from "axios";
import FolderIcon from "@mui/icons-material/Folder";
import { useState, ChangeEvent } from "react"; //react
import { useRegistration, Floor, Side } from "./RegistrationContext";
import { useNavigate } from "react-router-dom"; // React Router for nav
import {
  Avatar,
  Button,
  Container,
  MenuItem,
  Select,
  InputLabel,
  SelectChangeEvent,
} from "@mui/material";
import config from "../config.js";

interface RegistrationResponse {
  message: string;
}

interface LoginResponse {
  message: string;
}

const RegisterThree = () => {
  const { data, setData } = useRegistration();
  const [message, setMessage] = useState("");
  const [profilePicUrl, setProfilePicUrl] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleFloorChange = (event: SelectChangeEvent<Floor>) => {
    setData({ ...data, colonial_floor: event.target.value as Floor });
  };

  const handleSideChange = (event: SelectChangeEvent<Side>) => {
    setData({ ...data, colonial_side: event.target.value as Side });
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const fileUrl = URL.createObjectURL(file);
      setData({
        ...data,
        profile_picture: file,
        profile_picture_text: file.name,
      });
      setProfilePicUrl(fileUrl);
    }
  };

  const handleNext = async () => {
    console.log(
      "Now registering with",
      data.colonial_floor,
      data.colonial_side
    );

    const formData = new FormData();

    formData.append("username", data.username);
    formData.append("email", data.email);
    formData.append("fname", data.fname);
    formData.append("lname", data.lname);
    formData.append("colonial_floor", data.colonial_floor);
    formData.append("colonial_side", data.colonial_side);

    const dietaryRestrictionsArray = Object.entries(data.dietaryRestrictions)
      .filter(([key, value]) => value)
      .map(([key]) => key);

    if (dietaryRestrictionsArray.length > 0) {
      formData.append(
        "dietaryRestrictions",
        dietaryRestrictionsArray.join(",")
      );
    }

    const cuisinesArray = Object.entries(data.cuisines)
      .filter(([key, value]) => value)
      .map(([key]) => key);

    if (cuisinesArray.length > 0) {
      formData.append("cuisines", cuisinesArray.join(","));
    }

    console.log(dietaryRestrictionsArray);
    console.log(cuisinesArray);
    console.log(formData);

    if (data.profile_picture) {
      formData.append("profile_picture", data.profile_picture);
    }

    try {
      const response = await axios.post(
        `${config.serverUrl}/api/register/`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      const responseData: RegistrationResponse = response.data;
      setMessage(responseData.message);
      if (responseData.message === "Registration successful") {
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
        value={data.colonial_floor}
        onChange={handleFloorChange}
        fullWidth
        style={{ marginBottom: "16px" }}
      >
        {Object.values(Floor)
          .filter((floor) => floor !== "ADMIN")
          .map((floor) => (
            <MenuItem key={floor} value={floor}>
              {floor}
            </MenuItem>
          ))}
      </Select>

      <InputLabel id="side-label">Side</InputLabel>
      <Select
        labelId="side-label"
        value={data.colonial_side}
        onChange={handleSideChange}
        fullWidth
        style={{ marginBottom: "16px" }}
      >
        {Object.values(Side)
          .filter((side) => side !== "ADMIN")
          .map((side) => (
            <MenuItem key={side} value={side}>
              {side}
            </MenuItem>
          ))}
      </Select>

      <h2>Upload a Profile Picture</h2>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          marginBottom: "16px",
          cursor: "pointer",
          width: "150px",
          height: "150px",
          borderRadius: "50%",
          border: "2px solid #ccc",
        }}
        onClick={() =>
          document.getElementById("profile-picture-input")?.click()
        }
      >
        {profilePicUrl ? (
          <Avatar src={profilePicUrl} sx={{ width: 120, height: 120 }} />
        ) : (
          <FolderIcon sx={{ fontSize: 80 }} />
        )}
      </div>

      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={{ display: "none" }}
        id="profile-picture-input"
      />

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

export default RegisterThree;

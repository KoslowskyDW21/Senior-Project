import React, { useState } from "react";
import axios, { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import { Button, TextField, Container, Box } from "@mui/material";

interface CreateChallengeResponse {
  message: string;
}

const CreateChallenge: React.FC = () => {
  const [name, setName] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [difficulty, setDifficulty] = useState("1");
  const [theme, setTheme] = useState("");
  const [location, setLocation] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleCreateChallenge = async () => {
    const formData = new FormData();
    formData.append("name", name);
    if (image) {
      formData.append("image", image);
    }
    formData.append("difficulty", difficulty);
    formData.append("theme", theme);
    formData.append("location", location);
    formData.append("start_time", startTime);
    formData.append("end_time", endTime);

    try {
      const response = await axios.post(
        "http://127.0.0.1:5000/challenges/create",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      const data: CreateChallengeResponse = response.data;
      setMessage(data.message);
      if (data.message === "Challenge created successfully!") {
        navigate("/challenges");
      }
    } catch (error) {
      const axiosError = error as AxiosError;
      if (axiosError.response && axiosError.response.data) {
        const errorData = axiosError.response.data as CreateChallengeResponse;
        setMessage(errorData.message);
      } else {
        setMessage("An unknown error occurred");
      }
    }
  };

  return (
    <Container>
      <h2>Create a New Challenge</h2>
      <TextField
        label="Name"
        variant="outlined"
        fullWidth
        value={name}
        onChange={(e) => setName(e.target.value)}
        margin="normal"
      />
      <TextField
        label="Theme"
        variant="outlined"
        fullWidth
        value={theme}
        onChange={(e) => setTheme(e.target.value)}
        margin="normal"
      />
      <TextField
        label="Location"
        variant="outlined"
        fullWidth
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        margin="normal"
      />
      <TextField
        label="Start Time"
        variant="outlined"
        fullWidth
        type="datetime-local"
        value={startTime}
        onChange={(e) => setStartTime(e.target.value)}
        margin="normal"
      />
      <TextField
        label="End Time"
        variant="outlined"
        fullWidth
        type="datetime-local"
        value={endTime}
        onChange={(e) => setEndTime(e.target.value)}
        margin="normal"
      />
      <TextField
        label="Difficulty"
        variant="outlined"
        fullWidth
        value={difficulty}
        onChange={(e) => setDifficulty(e.target.value)}
        margin="normal"
      />
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setImage(e.target.files ? e.target.files[0] : null)}
        style={{ display: "block", margin: "20px 0" }}
      />
      <Button
        onClick={handleCreateChallenge}
        variant="contained"
        color="primary"
        fullWidth
      >
        Create Challenge
      </Button>
      {message && <p>{message}</p>}
    </Container>
  );
};

export default CreateChallenge;
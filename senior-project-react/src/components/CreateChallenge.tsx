import React, { useState } from "react";
import axios, { AxiosError } from "axios";
import {
  Button,
  TextField,
  Container,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
} from "@mui/material";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import config from "../config.js";

interface CreateChallengeResponse {
  message: string;
  challenge_id: number;
}

const CreateChallenge: React.FC = () => {
  const [name, setName] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [difficulty, setDifficulty] = useState("1");
  const [theme, setTheme] = useState("");
  const [location, setLocation] = useState("");
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [duration, setDuration] = useState<number | null>(null); // Duration in hours
  const [message, setMessage] = useState("");
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);

  const handleCreateChallenge = async () => {
    const formData = new FormData();
    formData.append("name", name);
    if (image) {
      formData.append("image", image);
    }
    formData.append("difficulty", difficulty);
    formData.append("theme", theme);
    formData.append("location", location);
    formData.append("start_time", startTime ? startTime.toISOString() : "");
    formData.append("duration", duration ? duration.toString() : "");

    try {
      const response = await axios.post(
        `${config.serverUrl}/challenges/create`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      const data: CreateChallengeResponse = response.data;
      setMessage(data.message);
      if (data.message === "Challenge created successfully!") {
        const challengeId = response.data.challenge_id;
        await axios.post(`${config.serverUrl}/challenges/${challengeId}/join`);
        window.history.back();
      }
    } catch (error) {
      const axiosError = error as AxiosError;
      if (axiosError.response && axiosError.response.data) {
        setMessage(axiosError.response.data.message);
      } else {
        setMessage("An unknown error occurred");
      }
      setErrorDialogOpen(true);
    }
  };

  const handleCloseErrorDialog = () => {
    setErrorDialogOpen(false);
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
      <Box mt={2}>
        <Typography>Start Time</Typography>
        <DatePicker
          selected={startTime}
          onChange={(date: Date) => setStartTime(date)}
          showTimeSelect
          dateFormat="Pp"
          className="form-control"
        />
      </Box>
      <Box mt={2}>
        <TextField
          label="Duration (hours)"
          variant="outlined"
          fullWidth
          type="number"
          value={duration !== null ? duration : ""}
          onChange={(e) => setDuration(parseInt(e.target.value))}
          margin="normal"
        />
      </Box>
      <TextField
        label="Difficulty"
        variant="outlined"
        fullWidth
        value={difficulty}
        onChange={(e) => setDifficulty(e.target.value)}
        margin="normal"
      />
      <Box textAlign="left" mt={2}>
        <Typography>Select an image:</Typography>
      </Box>
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

      <Dialog open={errorDialogOpen} onClose={handleCloseErrorDialog}>
        <DialogTitle>Error</DialogTitle>
        <DialogContent>
          <Typography>{message}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseErrorDialog} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CreateChallenge;

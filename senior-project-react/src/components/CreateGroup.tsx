import React, { useState } from "react";
import axios, { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import {
  Button,
  TextField,
  Container,
  Box,
  Typography,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import config from "../config.js";
import Header from "./Header.js";

interface CreateGroupResponse {
  message: string;
  group_id: number;
}

const CreateGroup: React.FC = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleCreateGroup = async () => {
    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("is_public", isPublic.toString());
    if (image) {
      formData.append("image", image);
    }

    try {
      const response = await axios.post(
        `${config.serverUrl}/groups/create/`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      const data: CreateGroupResponse = response.data;
      setMessage(data.message);
      if (data.message === "Group created successfully!") {
        navigate(`/groups/${data.group_id}`);
      }
    } catch (error) {
      const axiosError = error as AxiosError;
      if (axiosError.response && axiosError.response.data) {
        setMessage(axiosError.response.data.message);
      } else {
        setMessage("An unknown error occurred");
      }
    }
  };

  return (
    <Container>

      <Header title="Create Group"/>

      <Box mt={4} mb={2} textAlign="center">
        <Typography variant="h4" gutterBottom>
          Create a New Group
        </Typography>
      </Box>
      <TextField
        label="Name"
        variant="outlined"
        fullWidth
        value={name}
        onChange={(e) => setName(e.target.value)}
        margin="normal"
      />
      <TextField
        label="Description"
        variant="outlined"
        fullWidth
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        margin="normal"
      />
      <FormControlLabel
        control={
          <Checkbox
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
            color="primary"
          />
        }
        label="Public"
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
        onClick={handleCreateGroup}
        variant="contained"
        color="primary"
        fullWidth
      >
        Create Group
      </Button>
      {message && <Typography color="error">{message}</Typography>}
    </Container>
  );
};

export default CreateGroup;

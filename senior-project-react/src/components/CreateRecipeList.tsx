import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Container,
  TextField,
  IconButton,
  Box,
  Typography,
} from "@mui/material";
import axios, { AxiosError } from "axios";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import config from "../config.js";

interface CreateRecipeListResponse {
  message: string;
  recipe_list_id: number;
}

const CreateRecipeList: React.FC = () => {
  const [name, setName] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleCreateRecipeList = async () => {
    const formData = new FormData();
    formData.append("name", name);
    if (image) {
      formData.append("image", image);
    }
    try {
      const response = await axios.post(
        `${config.serverUrl}/recipe_lists/createlist`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      const data: CreateRecipeListResponse = response.data;
      setMessage(data.message);
    } catch (error) {
      const axiosError = error as AxiosError;
      if (axiosError.response && axiosError.response.data) {
        const errorData = axiosError.response.data as CreateRecipeListResponse;
        setMessage(errorData.message);
      } else {
        setMessage("An unknown error ocurred");
      }
    }
    navigate(`/recipe-lists`);
  };

  const handleGoToRecipeLists = async () => {
    navigate(`/recipe-lists`);
  };

  return (
    <Container>
      <IconButton
        onClick={() => navigate(-1)}
        style={{ position: "absolute", top: 30, left: 30 }}
      >
        <ArrowBackIcon sx={{ fontSize: 30, fontWeight: "bold" }} />
      </IconButton>
      <h2>Create a New Recipe List</h2>
      <TextField
        label="Name"
        variant="outlined"
        fullWidth
        value={name}
        onChange={(e) => setName(e.target.value)}
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
        onClick={handleCreateRecipeList}
        variant="contained"
        color="primary"
        fullWidth
      >
        Create Recipe List
      </Button>
      <br />
      <br />
      <Button onClick={handleGoToRecipeLists} variant="outlined">
        Cancel
      </Button>
      {message && <p>{message}</p>}
    </Container>
  );
};

export default CreateRecipeList;

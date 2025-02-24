import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Button,
  TextField,
  Rating,
  IconButton,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import axios from "axios";
import { PhotoCamera } from "@mui/icons-material";
import config from "../config.js";

interface Recipe {
  id: string;
  recipe_name: string;
  difficulty: string;
  xp_amount: string;
  rating: string;
  image: string;
}

const CompletedRecipe: React.FC = () => {
  const [recipe_name, setRecipe_name] = React.useState<String>();
  const [notes, setNotes] = useState<string>("");
  const [rating, setRating] = useState<number | null>(null);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState<string | null>(null);
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const handleGoToRecipes = async () => {
    navigate(`/recipes`);
  };

  const handleGoToReview = async () => {
    // Create FormData to send the data including the difficulty, rating, notes, and image
    const formData = new FormData();
    formData.append("rating", rating?.toString() || "");
    formData.append("notes", notes);
    formData.append("difficulty", difficulty || ""); // Add difficulty to FormData
    if (image) {
      formData.append("image", image);
    }

    try {
      const response = await axios.post(
        `${config.serverUrl}/recipes/review/${id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log("Data successfully submitted:", response.data);
    } catch (error) {
      console.error("Error submitting review:", error);
    }
  };

  const handleDifficultyChange = (
    event: React.MouseEvent<HTMLElement>,
    newDifficulty: string | null
  ) => {
    setDifficulty(newDifficulty); // Update difficulty state
  };

  const handleNotesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNotes(event.target.value);
  };

  const handleRatingChange = (
    event: React.ChangeEvent<{}>,
    newValue: number | null
  ) => {
    setRating(newValue);
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null;
    if (file) {
      setImage(file);
      const objectUrl = URL.createObjectURL(file);
      setImagePreview(objectUrl);
    }
  };

  const getResponse = async () => {
    try {
      const response = await axios.post(
        `${config.serverUrl}/recipes/completed/${id}`
      );
      const data: Recipe = response.data;
      setRecipe_name(data.recipe_name);
    } catch (error) {
      console.error("Error fetching recipe: ", error);
    }
  };

  React.useEffect(() => {
    getResponse();
  }, []);

  return (
    <>
      <h1>Recipe completed: {recipe_name}</h1>

      <p>Your Review</p>
      <div>
        {imagePreview ? (
          <img
            src={imagePreview}
            alt="Recipe"
            style={{
              width: "200px",
              height: "200px",
              objectFit: "cover",
              borderRadius: "8px",
            }}
          />
        ) : (
          <IconButton component="label" color="primary">
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={handleImageChange}
            />
            <PhotoCamera />
          </IconButton>
        )}
      </div>

      <div>
        <Rating
          name="recipe-rating"
          value={rating}
          onChange={handleRatingChange}
          precision={0.5}
        />
      </div>

      <TextField
        label="Add Notes"
        multiline
        rows={4}
        value={notes}
        onChange={handleNotesChange}
        variant="outlined"
        fullWidth
      />

      <div>
        <Typography gutterBottom>Difficulty</Typography>
        <ToggleButtonGroup
          value={difficulty}
          exclusive
          onChange={handleDifficultyChange}
          aria-labelledby="difficulty-rating"
        >
          <ToggleButton value="1">1</ToggleButton>
          <ToggleButton value="2">2</ToggleButton>
          <ToggleButton value="3">3</ToggleButton>
          <ToggleButton value="4">4</ToggleButton>
          <ToggleButton value="5">5</ToggleButton>
        </ToggleButtonGroup>
      </div>
      <Button onClick={handleGoToReview} variant="contained" color="primary">
        Submit Review
      </Button>

      <Button onClick={handleGoToRecipes} variant="contained" color="primary">
        Recipes
      </Button>
    </>
  );
};

export default CompletedRecipe;

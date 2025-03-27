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
  Alert,
} from "@mui/material";
import axios from "axios";
import { PhotoCamera, NoPhotography } from "@mui/icons-material";
import config from "../config.js";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

interface Recipe {
  id: string;
  recipe_name: string;
  difficulty: string;
  xp_amount: string;
  rating: string;
  image: string;
}

const CompletedRecipe: React.FC = () => {
  const [recipe_name, setRecipe_name] = React.useState<string>();
  const [notes, setNotes] = useState<string>("");
  const [rating, setRating] = useState<number | null>(null);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState<string | null>(null);
  const [reviewSubmitted, setReviewSubmitted] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null); // For error messages
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const handleGoToReview = async () => {
    if (!rating && !notes && !image && !difficulty) {
      setErrorMessage("At least one field must be filled out to submit the review.");
      return; 
    }

    // Clear any previous error message if validation passes
    setErrorMessage(null);

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
      setReviewSubmitted(true); // Set the review as submitted
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
      <IconButton
        onClick={() => navigate(-1)}
        style={{ position: "fixed", top: 30, left: 30 }}
      >
        <ArrowBackIcon sx={{ fontSize: 30, fontWeight: "bold" }} />
      </IconButton>

      {/* Show this content only if review is not submitted */}
      {!reviewSubmitted ? (
        <>
          <h1>Recipe completed: {recipe_name}</h1>
          <p>Your Review</p>

          {/* Error message for validation */}
          {errorMessage && (
            <Alert severity="error" style={{ marginBottom: "20px" }}>
              {errorMessage}
            </Alert>
          )}

          {/* <div>
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
          </div> */}

          <div>
            {imagePreview && (
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
            )}
            <IconButton component="label" color="primary">
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={handleImageChange}
              />
              <PhotoCamera />
            </IconButton>
          </div>

          <div>
          <Typography gutterBottom>Rating</Typography>
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
        </>
      ) : (
        <div>
          <h1>
            Review Submitted Successfully!
          </h1>
        </div>
      )}
    </>
  );
};

export default CompletedRecipe;

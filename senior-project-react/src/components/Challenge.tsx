import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardActionArea,
  CardHeader,
  CardMedia,
  Typography,
} from "@mui/material";
import Difficulty from "./Difficulty";
import config from "../config.js";

interface ChallengeProps {
  id: number;
  name: string;
  image?: string;
  difficulty: "1" | "2" | "3" | "4" | "5";
}

const Challenge: React.FC<ChallengeProps> = ({
  id,
  name,
  image,
  difficulty,
}) => {
  const navigate = useNavigate();
  const handleGoToChallenge = async () => {
    navigate(`/challenges/${id}/`);
  };

  return (
    <Card
    variant="outlined"
    sx={{
    display: "flex",
    flexDirection: "column",
    height: "100%",
    flexShrink: 1,
    maxWidth: 400, // Set a max width to the card to prevent it from stretching too wide
  }}
>
      <CardActionArea onClick={handleGoToChallenge}>
        <CardHeader
          title={
            <Typography
              variant="h5"
              sx={{ fontSize: "clamp(1rem, 1.5vw, 2rem)", 
                textAlign: "center" ,
                whiteSpace: "nowrap",        // Prevent wrapping
                overflow: "hidden",          // Hide overflowing text
                textOverflow: "ellipsis",    // Add ellipsis (...) for overflowing text
                width: "100%", 
                maxWidth: "100%",            // Prevent the title from stretching beyond the card
               }}
            >
              {name}
            </Typography>
          }
          subheader={<Difficulty difficulty={difficulty} />}
          sx={{
            justifyContent: "center",
            alignItems: "center",
            flexShrink: 1,
            width: "auto",
          }}
        />
        {image && (
          <CardMedia
            component="img"
            image={`${config.serverUrl}/${image}`}
            sx={{
              height: 200, // Ensure all images have the same height
              objectFit: "contain", // Ensure the image covers the area without distorting
              width: "100%", // Stretch the image to fill the card width
            }}
          />
        )}
      </CardActionArea>
    </Card>
  );
};

export default Challenge;

import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardActionArea,
  CardHeader,
  CardMedia,
  CardContent,
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
        maxHeight: 400, // Set a fixed height for all cards
      }}
    >
      <CardActionArea onClick={handleGoToChallenge}>
        <CardHeader
          title={
            <Typography
              variant="h5"
              sx={{ fontSize: "clamp(1rem, 1.5vw, 2rem)", textAlign: "center" }}
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
              height: "auto",
              objectFit: "contain",
              width: "100%",
              maxHeight: 200,
            }}
          />
        )}
      </CardActionArea>
    </Card>
  );
};

export default Challenge;
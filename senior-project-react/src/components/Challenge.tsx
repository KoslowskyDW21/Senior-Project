import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardActionArea,
  CardHeader,
  CardMedia,
  CardContent,
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
    navigate(`/challenges/${id}`);
  };

  return (
    <Card
      variant="outlined"
      sx={{ display: "flex", flexDirection: "column", height: "100%" }}
    >
      <CardActionArea onClick={handleGoToChallenge}>
        <CardHeader
          title={name}
          sx={{
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
            flexShrink: 0,
            width: "90%",
            fontSize: "clamp(1rem, 4vw, 2rem)",
          }}
        />
        {image && (
          <CardMedia
            component="img"
            image={`${config.serverUrl}/${image}`}
            sx={{
              height: 200,
              objectFit: "cover",
              width: "100%",
            }}
          />
        )}
        <CardContent>
          <Difficulty difficulty={difficulty} />
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default Challenge;
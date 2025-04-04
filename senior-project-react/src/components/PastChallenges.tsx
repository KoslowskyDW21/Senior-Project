import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Box,
  Grid2,
  Button,
  IconButton,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Challenge from "./Challenge";
import config from "../config.js";

interface ChallengeData {
  id: number;
  name: string;
  creator: number;
  image?: string;
  difficulty: "1" | "2" | "3" | "4" | "5";
  theme: string;
  location: string;
  start_time: Date;
  end_time: Date;
  is_complete: boolean;
  num_reports: number;
}

const PastChallenges: React.FC = () => {
  const [pastChallenges, setPastChallenges] = useState<ChallengeData[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPastChallenges = async () => {
      try {
        const response = await axios.get(
          `${config.serverUrl}/challenges/past_user_participated_challenges/`
        );
        setPastChallenges(response.data);
      } catch (error) {
        console.error("Error fetching past competitions (challenges):", error);
      }
    };

    fetchPastChallenges();
  }, []);

  return (
    <Container>
      <IconButton
        onClick={() => navigate(-1)}
        style={{ position: "absolute", top: 30, left: 30 }}
      >
        <ArrowBackIcon sx={{ fontSize: 30, fontWeight: "bold" }} />
      </IconButton>
      <Box mt={4} mb={2} textAlign="center">
        <Typography variant="h4">Past Competitions</Typography>
      </Box>
      <Grid2 container spacing={2}>
        {pastChallenges.map((challenge) => (
          <Grid2 key={challenge.id}>
            <Challenge {...challenge} />
          </Grid2>
        ))}
      </Grid2>
      <Box mt={4} textAlign="center">
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate(-1)}
        >
          Back to Competition Details
        </Button>
      </Box>
    </Container>
  );
};

export default PastChallenges;

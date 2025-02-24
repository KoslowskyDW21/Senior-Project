import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Typography, Box, Button } from "@mui/material";
import config from "../config.js";

const ChallengeInviteResponse: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [challenge, setChallenge] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchChallenge = async () => {
      try {
        const response = await axios.get(
          `${config.serverUrl}/challenges/${id}`
        );
        setChallenge(response.data);
      } catch (error) {
        console.error("Error fetching challenge details:", error);
      }
    };

    fetchChallenge();
  }, [id]);

  const handleResponse = async (response: string) => {
    try {
      await axios.post(`${config.serverUrl}/challenges/${id}/invite_response`, {
        response,
      });
      navigate(`/challenges/${id}`);
    } catch (error) {
      console.error(`Error sending ${response} response:`, error);
    }
  };

  if (!challenge) {
    return (
      <Container>
        <Typography variant="h5" textAlign="center" mt={4}>
          Loading...
        </Typography>
      </Container>
    );
  }

  return (
    <Container>
      <Box mt={4} mb={2} textAlign="center">
        <Typography variant="h4" gutterBottom>
          Challenge Invitation
        </Typography>
        <Typography variant="h6" gutterBottom>
          You have been invited to join the challenge {challenge.name}.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleResponse("accept")}
          sx={{ mr: 2 }}
        >
          Accept
        </Button>
        <Button
          variant="contained"
          color="secondary"
          onClick={() => handleResponse("deny")}
        >
          Deny
        </Button>
      </Box>
    </Container>
  );
};

export default ChallengeInviteResponse;

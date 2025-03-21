import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Container,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  Button,
} from "@mui/material";
import config from "../config.js";

interface Participant {
  user_id: number;
  username: string;
  points: number;
}

const ChallengeResults: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchVoteResults = async () => {
      try {
        const response = await axios.get(
          `${config.serverUrl}/challenges/${id}/vote_results`
        );
        setParticipants(response.data);
      } catch (error) {
        console.error("Error fetching vote results:", error);
      }
    };

    fetchVoteResults();
  }, [id]);

  return (
    <Container>
      <Box mt={4}>
        <Typography variant="h4" gutterBottom>
          Challenge Vote Results
        </Typography>
        <List>
          {participants.map((participant, index) => (
            <ListItem key={participant.user_id}>
              <ListItemText
                primary={`${index + 1}. ${participant.username}`}
                secondary={`Points: ${participant.points}`}
              />
            </ListItem>
          ))}
        </List>
        <Box mt={2}>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => navigate(-1)}
          >
            Back to Challenge Details
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default ChallengeResults;

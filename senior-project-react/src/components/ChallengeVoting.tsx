import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Container,
  Typography,
  Box,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";

interface Participant {
  user_id: number;
  username: string;
}

const ChallengeVoting: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [selectedParticipant, setSelectedParticipant] = useState<number | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchParticipants = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:5000/challenges/${id}/participants`);
        setParticipants(response.data);
      } catch (error) {
        console.error("Error fetching participants:", error);
      }
    };

    const fetchCurrentUser = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:5000/challenges/current_user_id");
        setCurrentUserId(response.data);
      } catch (error) {
        console.error("Error fetching current user:", error);
      }
    };

    fetchParticipants();
    fetchCurrentUser();
  }, [id]);

  const handleVote = async () => {
    if (selectedParticipant && currentUserId !== selectedParticipant) {
      try {
        await axios.post(`http://127.0.0.1:5000/challenges/${id}/vote`, {
          voter_id: currentUserId,
          votee_id: selectedParticipant,
        });
        alert("Vote submitted successfully!");
      } catch (error) {
        console.error("Error submitting vote:", error);
      }
    } else {
      alert("You cannot vote for yourself or no participant selected.");
    }
  };

  return (
    <Container>
      <Box mt={4}>
        <Typography variant="h4" gutterBottom>
          Vote for Challenge Winner
        </Typography>
        <FormControl fullWidth>
          <InputLabel id="participant-select-label">Select Participant</InputLabel>
          <Select
            labelId="participant-select-label"
            value={selectedParticipant}
            onChange={(e) => setSelectedParticipant(e.target.value as number)}
          >
            {participants
              .filter((participant) => participant.user_id !== currentUserId)
              .map((participant) => (
                <MenuItem key={participant.user_id} value={participant.user_id}>
                  {participant.username}
                </MenuItem>
              ))}
          </Select>
        </FormControl>
        <Box mt={2}>
          <Button variant="contained" color="primary" onClick={handleVote}>
            Submit Vote
          </Button>
        </Box>
        <Box mt={2}>
          <Button variant="contained" color="secondary" onClick={() => navigate(-1)}>
            Back to Challenge Details
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default ChallengeVoting;
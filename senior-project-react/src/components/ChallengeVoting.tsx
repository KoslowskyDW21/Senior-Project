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
  const [firstChoice, setFirstChoice] = useState<number | null>(null);
  const [secondChoice, setSecondChoice] = useState<number | null>(null);
  const [thirdChoice, setThirdChoice] = useState<number | null>(null);
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
    if (
      firstChoice &&
      currentUserId !== firstChoice &&
      (secondChoice === null || (secondChoice !== firstChoice && currentUserId !== secondChoice)) &&
      (thirdChoice === null || (thirdChoice !== firstChoice && thirdChoice !== secondChoice && currentUserId !== thirdChoice))
    ) {
      try {
        await axios.post(`http://127.0.0.1:5000/challenges/${id}/vote`, {
          voter_id: currentUserId,
          first_choice: firstChoice,
          second_choice: secondChoice,
          third_choice: thirdChoice,
        });
        alert("Vote submitted successfully!");
      } catch (error) {
        console.error("Error submitting vote:", error);
      }
    } else {
      alert("You must select a vote for the first place winner");
    }
  };

  return (
    <Container>
      <Box mt={4}>
        <Typography variant="h4" gutterBottom>
          Vote for Challenge Winner
        </Typography>
        <FormControl fullWidth>
          <InputLabel id="first-choice-label">First Choice</InputLabel>
          <Select
            labelId="first-choice-label"
            value={firstChoice}
            onChange={(e) => setFirstChoice(e.target.value as number)}
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
        {participants.length > 2 && (
          <FormControl fullWidth>
            <InputLabel id="second-choice-label">Second Choice</InputLabel>
            <Select
              labelId="second-choice-label"
              value={secondChoice}
              onChange={(e) => setSecondChoice(e.target.value as number)}
            >
              {participants
                .filter(
                  (participant) =>
                    participant.user_id !== currentUserId && participant.user_id !== firstChoice
                )
                .map((participant) => (
                  <MenuItem key={participant.user_id} value={participant.user_id}>
                    {participant.username}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
        )}
        {participants.length > 3 && (
          <FormControl fullWidth>
            <InputLabel id="third-choice-label">Third Choice</InputLabel>
            <Select
              labelId="third-choice-label"
              value={thirdChoice}
              onChange={(e) => setThirdChoice(e.target.value as number)}
            >
              {participants
                .filter(
                  (participant) =>
                    participant.user_id !== currentUserId &&
                    participant.user_id !== firstChoice &&
                    participant.user_id !== secondChoice
                )
                .map((participant) => (
                  <MenuItem key={participant.user_id} value={participant.user_id}>
                    {participant.username}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
        )}
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
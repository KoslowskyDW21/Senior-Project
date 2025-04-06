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
  Card,
  CardContent,
  CardActions,
  CircularProgress,
  IconButton
} from "@mui/material";
import config from "../config.js";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

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
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchParticipants = async () => {
      try {
        const response = await axios.get(
          `${config.serverUrl}/challenges/${id}/participants/`
        );
        setParticipants(response.data);
      } catch (error) {
        console.error("Error fetching participants:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchCurrentUser = async () => {
      try {
        const response = await axios.get(
          `${config.serverUrl}/challenges/current_user_id/`
        );
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
      (secondChoice === null ||
        (secondChoice !== firstChoice && currentUserId !== secondChoice)) &&
      (thirdChoice === null ||
        (thirdChoice !== firstChoice &&
          thirdChoice !== secondChoice &&
          currentUserId !== thirdChoice))
    ) {
      try {
        await axios.post(`${config.serverUrl}/challenges/${id}/vote/`, {
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

  if (loading) {
    return (
      <Container>
        <Box mt={4} textAlign="center">
          <CircularProgress />
          <Typography variant="h6" mt={2}>
            Loading participants...
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container>
      <Box mt={4} display="flex" justifyContent="center">
        <IconButton
          onClick={() => navigate(`/challenges/${id}`)}
          style={{ position: "fixed", top: "clamp(70px, 10vw, 120px)",
            left: "clamp(0px, 1vw, 100px)",
            zIndex: 1000, }}
        >
          <ArrowBackIcon sx={{ fontSize: 30, fontWeight: "bold" }} />
        </IconButton>
        <Card sx={{ maxWidth: 600, width: "100%", boxShadow: 3 }}>
          <CardContent>
            <Typography variant="h4" gutterBottom textAlign="center">
              Vote for Competition Winner
            </Typography>
            <Typography variant="body1" textAlign="center" color="textSecondary" mb={2}>
              Select your top choices for the competition winner. You cannot vote for yourself.
            </Typography>
            <FormControl fullWidth sx={{ mb: 2 }}>
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
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel id="second-choice-label">Second Choice</InputLabel>
                <Select
                  labelId="second-choice-label"
                  value={secondChoice}
                  onChange={(e) => setSecondChoice(e.target.value as number)}
                >
                  {participants
                    .filter(
                      (participant) =>
                        participant.user_id !== currentUserId &&
                        participant.user_id !== firstChoice
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
              <FormControl fullWidth sx={{ mb: 2 }}>
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
          </CardContent>
          <CardActions sx={{ justifyContent: "center", mb: 2 }}>
            <Button variant="contained" color="primary" onClick={handleVote} sx={{ mr: 2 }}>
              Submit Vote
            </Button>
            <Button variant="contained" color="secondary" onClick={() => navigate(-1)}>
              Back to Competition Details
            </Button>
          </CardActions>
        </Card>
      </Box>
    </Container>
  );
};

export default ChallengeVoting;
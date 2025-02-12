import React from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Container,
  Button,
  IconButton,
} from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

interface Challenge {
  id: number;
  name: string;
  creator: number;
  image?: string;
  difficulty: "1" | "2" | "3" | "4" | "5";
  theme: string;
  location: string;
  start_time: string;
  end_time: string;
  is_complete: boolean;
  num_reports: number;
}

interface Participant {
  user_id: number;
  username: string;
}

const ChallengeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [challenge, setChallenge] = React.useState<Challenge | null>(null);
  const [participants, setParticipants] = React.useState<Participant[]>([]);
  const [currentUserId, setCurrentUserId] = React.useState<number | null>(null);

  const navigate = useNavigate();

  React.useEffect(() => {
    const fetchChallenge = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:5000/challenges/${id}`);
        setChallenge(response.data);
      } catch (error) {
        console.error("Error fetching challenge details:", error);
      }
    };

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

    fetchChallenge();
    fetchParticipants();
    fetchCurrentUser();
  }, [id]);

  const handleJoinChallenge = async () => {
    try {
      await axios.post(`http://127.0.0.1:5000/challenges/${id}/join`);
      const response = await axios.get(`http://127.0.0.1:5000/challenges/${id}/participants`);
      setParticipants(response.data);
    } catch (error) {
      console.error("Error joining challenge:", error);
    }
  };

  const handleLeaveChallenge = async () => {
    try {
      await axios.post(`http://127.0.0.1:5000/challenges/${id}/leave`);
      const response = await axios.get(`http://127.0.0.1:5000/challenges/${id}/participants`);
      setParticipants(response.data);
    } catch (error) {
      console.error("Error leaving challenge:", error);
    }
  };

  const handleDeleteChallenge = async () => {
    try {
      await axios.delete(`http://127.0.0.1:5000/challenges/${id}/delete`);
      window.history.back()
    } catch (error) {
      console.error("Error deleting challenge:", error);
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

  const isParticipant = participants.some((p) => p.user_id === currentUserId);
  const isCreator = challenge.creator === currentUserId;

  return (
    <Container>
      <IconButton
        onClick={() => navigate(-1)}
        style={{ position: "absolute", top: 30, left: 30 }} 
      >
        <ArrowBackIcon sx={{ fontSize: 30, fontWeight: 'bold' }} />
      </IconButton>
      <Card sx={{ maxWidth: 800, margin: "20px auto", padding: 2 }}>
        {challenge.image && (
          <CardMedia
            component="img"
            height="400"
            image={`http://127.0.0.1:5000/${challenge.image}`}
            alt={challenge.name}
            sx={{ borderRadius: 2 }}
          />
        )}
        <CardContent>
          <Typography variant="h4" component="div" gutterBottom>
            {challenge.name}
          </Typography>
          <Box mb={2}>
            <Typography variant="body1">
              <strong>Creator:</strong> {challenge.creator}
            </Typography>
            <Typography variant="body1">
              <strong>Difficulty:</strong> {challenge.difficulty}
            </Typography>
            <Typography variant="body1">
              <strong>Theme:</strong> {challenge.theme}
            </Typography>
            <Typography variant="body1">
              <strong>Location:</strong> {challenge.location}
            </Typography>
            <Typography variant="body1">
              <strong>Start Time:</strong>{" "}
              {new Date(challenge.start_time).toLocaleString()}
            </Typography>
            <Typography variant="body1">
              <strong>End Time:</strong>{" "}
              {new Date(challenge.end_time).toLocaleString()}
            </Typography>
          </Box>
          <Box textAlign="center" mt={3}>
            {isCreator ? (
              <Button
                variant="contained"
                color="error"
                onClick={handleDeleteChallenge}
              >
                Delete Challenge
              </Button>
            ) : isParticipant ? (
              <Button
                variant="contained"
                color="secondary"
                onClick={handleLeaveChallenge}
              >
                Leave Challenge
              </Button>
            ) : (
              <Button
                variant="contained"
                color="primary"
                onClick={handleJoinChallenge}
              >
                Join Challenge
              </Button>
            )}
          </Box>
          <Box mt={4}>
            <Typography variant="h5" gutterBottom>
              Participants
            </Typography>
            <ul>
              {participants.map((participant) => (
                <li key={participant.user_id}>{participant.username}</li>
              ))}
            </ul>
          </Box>
          {isParticipant && (
            <Box textAlign="center" mt={3}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => navigate(`/challenges/${id}/vote`)}
              >
                Vote for Winner
              </Button>

              <Button
                variant="contained"
                color="primary"
                onClick={() => navigate(`/challenges/${id}/vote_results`)}
              >
                View Vote Results
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default ChallengeDetail;
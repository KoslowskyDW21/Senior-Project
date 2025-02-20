import React, { useState } from "react";
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

interface User {
  id: number;
  fname: string;
  lname: string;
  email_address: string;
  username: string;
  profile_picture: string;
  xp_points: number;
  user_level: number;
  is_admin: boolean;
  num_recipes_completed: number;
  colonial_floor: string;
  colonial_side: string;
  date_created: Date;
  last_logged_in: Date;
  num_reports: number;
}

const ChallengeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [challenge, setChallenge] = React.useState<Challenge | null>(null);
  const [participants, setParticipants] = React.useState<Participant[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const navigate = useNavigate();

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
      const response = await axios.get("http://127.0.0.1:5000/current_user");
      setCurrentUser(response.data);
    } catch (error) {
      console.error("Error fetching current user:", error);
    }
  };

  const handleJoinChallenge = async () => {
    if (new Date(challenge!.start_time) > new Date()) {
      try {
        await axios.post(`http://127.0.0.1:5000/challenges/${id}/join`);
        const response = await axios.get(`http://127.0.0.1:5000/challenges/${id}/participants`);
        setParticipants(response.data);
      } catch (error) {
        console.error("Error joining challenge:", error);
      }
    } else {
      alert("You cannot join the challenge after it has started.");
    }
  };

  const handleLeaveChallenge = async () => {
    if (new Date(challenge!.start_time) > new Date()) {
      try {
        await axios.post(`http://127.0.0.1:5000/challenges/${id}/leave`);
        const response = await axios.get(`http://127.0.0.1:5000/challenges/${id}/participants`);
        setParticipants(response.data);
      } catch (error) {
        console.error("Error leaving challenge:", error);
      }
    } else {
      alert("You cannot leave the challenge after it has started.");
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

  React.useEffect(() => {
    fetchChallenge();
    fetchParticipants();
    fetchCurrentUser();
  }, [id]);

  if (!challenge || !currentUser) {
    return (
      <Container>
        <Typography variant="h5" textAlign="center" mt={4}>
          Loading...
        </Typography>
      </Container>
    );
  }

  const isParticipant = participants.some((p) => p.user_id === currentUser.id);
  const isCreator = challenge.creator === currentUser.id;
  const now = new Date();
  const startTime = new Date(challenge.start_time);
  const endTime = new Date(challenge.end_time);
  const votingEndTime = new Date(endTime.getTime() + 24 * 60 * 60 * 1000);

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
              {startTime.toLocaleString()}
            </Typography>
            <Typography variant="body1">
              <strong>End Time:</strong>{" "}
              {endTime.toLocaleString()}
            </Typography>
          </Box>
          <Box textAlign="center" mt={3}>
            {(isCreator || currentUser.is_admin) && (
              <Button
                variant="contained"
                color="error"
                onClick={handleDeleteChallenge}
              >
                Delete Challenge
              </Button>
            )}
            {!isCreator && !isParticipant && now < startTime && (
              <Button
                variant="contained"
                color="primary"
                onClick={handleJoinChallenge}
              >
                Join Challenge
              </Button>
            )}
            {!isCreator && isParticipant && now < startTime && (
              <Button
                variant="contained"
                color="secondary"
                onClick={handleLeaveChallenge}
              >
                Leave Challenge
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
          {isParticipant && now >= startTime && now <= votingEndTime && (
            <Box textAlign="center" mt={3}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => navigate(`/challenges/${id}/vote`)}
              >
                Vote for Winner
              </Button>
            </Box>
          )}
          {now > votingEndTime && (
            <Box textAlign="center" mt={3}>
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
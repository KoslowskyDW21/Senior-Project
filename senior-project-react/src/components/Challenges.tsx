import React from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  Container,
} from "@mui/material";

interface UserId {
  id: number;
}

interface Challenge {
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

const Challenges: React.FC = () => {
  const [challenges, setChallenges] = React.useState<Challenge[]>([]);
  const [myChallenges, setMyChallenges] = React.useState<Challenge[]>([]);
  const [joinedChallenges, setJoinedChallenges] = React.useState<Challenge[]>([]);
  const [currentUserId, setCurrentUserId] = React.useState<number | null>(null);
  const [participants, setParticipants] = React.useState<{ [key: number]: boolean }>({});
  const navigate = useNavigate();

  const getResponse = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:5000/challenges/");
      const data: Challenge[] = response.data;
      setChallenges(data);

      const userResponse: UserId = await axios.get("http://127.0.0.1:5000/challenges/current_user_id");
      const currentUserId = userResponse.data;
      setCurrentUserId(currentUserId);

      const userChallenges = data.filter((challenge) => challenge.creator === currentUserId);
      setMyChallenges(userChallenges);

      const otherChallenges = data.filter((challenge) => challenge.creator !== currentUserId);
      setChallenges(otherChallenges);

      // Fetch participant status for each challenge
      const participantStatus: { [key: number]: boolean } = {};
      const joinedChallengesList: Challenge[] = [];
      for (const challenge of data) {
        const participantResponse = await axios.get(`http://127.0.0.1:5000/challenges/${challenge.id}/is_participant`);
        participantStatus[challenge.id] = participantResponse.data.is_participant;
        if (participantResponse.data.is_participant && challenge.creator !== currentUserId) {
          joinedChallengesList.push(challenge);
        }
      }
      setParticipants(participantStatus);
      setJoinedChallenges(joinedChallengesList);
    } catch (error) {
      console.error("Error fetching challenges:", error);
    }
  };

  const handleJoinChallenge = async (challengeId: number) => {
    try {
      await axios.post(`http://127.0.0.1:5000/challenges/${challengeId}/join`);
      setParticipants((prev) => ({ ...prev, [challengeId]: true }));
    } catch (error) {
      console.error("Error joining challenge:", error);
    }
  };

  const handleLeaveChallenge = async (challengeId: number) => {
    try {
      await axios.post(`http://127.0.0.1:5000/challenges/${challengeId}/leave`);
      setParticipants((prev) => ({ ...prev, [challengeId]: false }));
    } catch (error) {
      console.error("Error leaving challenge:", error);
    }
  };

  React.useEffect(() => {
    getResponse();
  }, []);

  return (
    <Container>
      <Box mt={4} mb={2} textAlign="center">
        <Typography variant="h4" gutterBottom>
          Challenges
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate(`/challenges/create`)}
        >
          Create a Challenge
        </Button>
      </Box>

      {myChallenges.length > 0 && (
        <Box mt={4}>
          <Typography variant="h5" gutterBottom>
            My Challenges
          </Typography>
          <Grid container spacing={2}>
            {myChallenges.map((challenge) => (
              <Grid item xs={12} sm={6} md={4} key={challenge.id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" component="div" gutterBottom>
                      {challenge.name}
                    </Typography>
                    <Button
                      variant="outlined"
                      onClick={() => navigate(`/challenges/${challenge.id}`)}
                    >
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {joinedChallenges.length > 0 && (
        <Box mt={4}>
          <Typography variant="h5" gutterBottom>
            Joined Challenges
          </Typography>
          <Grid container spacing={2}>
            {joinedChallenges.map((challenge) => (
              <Grid item xs={12} sm={6} md={4} key={challenge.id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" component="div" gutterBottom>
                      {challenge.name}
                    </Typography>
                    <Button
                      variant="outlined"
                      onClick={() => navigate(`/challenges/${challenge.id}`)}
                    >
                      View Details
                    </Button>
                    <Button
                      variant="contained"
                      color="secondary"
                      onClick={() => handleLeaveChallenge(challenge.id)}
                    >
                      Leave Challenge
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      <Box mt={4}>
        <Typography variant="h5" gutterBottom>
          All Challenges
        </Typography>
        <Grid container spacing={2}>
          {challenges.map((challenge) => (
            <Grid item xs={12} sm={6} md={4} key={challenge.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" component="div" gutterBottom>
                    {challenge.name}
                  </Typography>
                  <Button
                    variant="outlined"
                    onClick={() => navigate(`/challenges/${challenge.id}`)}
                  >
                    View Details
                  </Button>
                  {participants[challenge.id] ? (
                    <Button
                      variant="contained"
                      color="secondary"
                      onClick={() => handleLeaveChallenge(challenge.id)}
                    >
                      Leave Challenge
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleJoinChallenge(challenge.id)}
                    >
                      Join Challenge
                    </Button>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
};

export default Challenges;
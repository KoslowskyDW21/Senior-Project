import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Grid,
  Box,
  Container,
  TextField,
  MenuItem,
  Menu,
  IconButton,
  Avatar,
  ButtonBase,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import NotificationsIcon from "@mui/icons-material/Notifications";
import Header from "./Header";

interface UserId {
  id: number;
}

interface User {
  profile_picture: string;
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
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [myChallenges, setMyChallenges] = useState<Challenge[]>([]);
  const [joinedChallenges, setJoinedChallenges] = useState<Challenge[]>([]);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [participants, setParticipants] = useState<{ [key: number]: boolean }>(
    {}
  );
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showMoreMyChallenges, setShowMoreMyChallenges] =
    useState<boolean>(false);
  const [showMoreJoinedChallenges, setShowMoreJoinedChallenges] =
    useState<boolean>(false);
  const navigate = useNavigate();
  const [profile_picture, setProfile_picture] = useState<string>();

  const getResponse = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:5000/challenges/");
      const data: Challenge[] = response.data;
      setChallenges(data);

      const userResponse: UserId = await axios.get(
        "http://127.0.0.1:5000/challenges/current_user_id"
      );
      const currentUserId = userResponse.data;
      setCurrentUserId(currentUserId);

      const userChallenges = data.filter(
        (challenge) => challenge.creator === currentUserId
      );
      setMyChallenges(userChallenges);

      const otherChallenges = data.filter(
        (challenge) => challenge.creator !== currentUserId
      );
      setChallenges(otherChallenges);

      // Fetch participant status for each challenge
      const participantStatus: { [key: number]: boolean } = {};
      const joinedChallengesList: Challenge[] = [];
      for (const challenge of data) {
        const participantResponse = await axios.get(
          `http://127.0.0.1:5000/challenges/${challenge.id}/is_participant`
        );
        participantStatus[challenge.id] =
          participantResponse.data.is_participant;
        if (
          participantResponse.data.is_participant &&
          challenge.creator !== currentUserId
        ) {
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
      navigate(`/challenges/${challengeId}`);
    } catch (error) {
      console.error("Error joining challenge:", error);
    }
  };

  const handleLeaveChallenge = async (challengeId: number) => {
    try {
      await axios.post(`http://127.0.0.1:5000/challenges/${challengeId}/leave`);
      setParticipants((prev) => ({ ...prev, [challengeId]: false }));
      setJoinedChallenges((prev) =>
        prev.filter((challenge) => challenge.id !== challengeId)
      );
    } catch (error) {
      console.error("Error leaving challenge:", error);
    }
  };

  const getCurrentUser = async () => {
    try {
      const response = await axios.post(
        `http://127.0.0.1:5000/profile/get_profile_pic/`
      );
      const data: User = response.data;
      setProfile_picture(data.profile_picture);
      console.log(profile_picture);
    } catch (error) {
      console.error("Error fetching user: ", error);
    }
  };

  const handleGoToGroups = async () => {
    navigate(`/groups`);
  };

  const filterChallenges = () => {
    const urlParams = new URLSearchParams(location.search);
    const searchQuery = urlParams.get("search")?.toLowerCase() || "";
    if (searchQuery) {
      setSearchQuery(searchQuery)
    } else {
      setSearchQuery("")
    }
  };

  const filteredMyChallenges = myChallenges.filter((challenge) =>
    challenge.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredJoinedChallenges = joinedChallenges.filter((challenge) =>
    challenge.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredAllChallenges = challenges.filter((challenge) =>
    challenge.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleGoToRecipes = async () => {
    navigate("/recipes");
  };


  useEffect(() => {
    getResponse();
    getCurrentUser();
  }, []);

  React.useEffect(() => {
      filterChallenges()
    }, [location.search, challenges]); 

  return (
    <div>
      <Header title="Challenges" />
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-start",
          alignItems: "center",
          fontSize: "24px",
          fontWeight: "bold",
          textAlign: "center",
          mt: 4,
        }}
      ></Box>
      <main role="main" style={{ paddingTop: '90px' }}>
      <Container>
        <div
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "space-around",
            padding: "10px",
            backgroundColor: "#fff",
            boxShadow: "0px -2px 5px rgba(0, 0, 0, 0.1)",
            zIndex: 1000,
          }}
        >
          <Button
            onClick={handleGoToRecipes}
            variant="contained"
            color="primary"
            sx={{ flex: 1 }}
          >
            Recipes
          </Button>
          <Button variant="outlined" color="primary" sx={{ flex: 1 }}>
            Challenges
          </Button>
          <Button
            onClick={handleGoToGroups}
            variant="contained"
            color="primary"
            sx={{ flex: 1 }}
          >
            Community
          </Button>
        </div>
        <Box mt={4} mb={2} textAlign="center">
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate(`/challenges/create`)}
          >
            Create a Challenge
          </Button>
        </Box>

        {filteredMyChallenges.length > 0 && (
          <Box mt={4}>
            <Typography variant="h5" gutterBottom>
              My Challenges
            </Typography>
            <Box
              sx={{
                maxHeight: showMoreMyChallenges ? "none" : 300,
                overflowY: "auto",
              }}
            >
              <Grid container spacing={2}>
                {filteredMyChallenges.map((challenge) => (
                  <Grid item xs={12} sm={6} md={4} key={challenge.id}>
                    <Card
                      onClick={() => navigate(`/challenges/${challenge.id}`)}
                      sx={{ cursor: "pointer" }}
                    >
                      {challenge.image && (
                        <CardMedia
                          component="img"
                          height="140"
                          image={`http://127.0.0.1:5000/${challenge.image}`}
                          alt={challenge.name}
                        />
                      )}
                      <CardContent>
                        <Typography variant="h6" component="div" gutterBottom>
                          {challenge.name}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
            {filteredMyChallenges.length > 3 && (
              <Box textAlign="center" mt={2}>
                <Button
                  variant="contained"
                  onClick={() => setShowMoreMyChallenges(!showMoreMyChallenges)}
                >
                  {showMoreMyChallenges ? "Show Less" : "Show More"}
                </Button>
              </Box>
            )}
          </Box>
        )}

        {filteredJoinedChallenges.length > 0 && (
          <Box mt={4}>
            <Typography variant="h5" gutterBottom>
              Joined Challenges
            </Typography>
            <Box
              sx={{
                maxHeight: showMoreJoinedChallenges ? "none" : 300,
                overflowY: "auto",
              }}
            >
              <Grid container spacing={2}>
                {filteredJoinedChallenges.map((challenge) => (
                  <Grid item xs={12} sm={6} md={4} key={challenge.id}>
                    <Card
                      onClick={() => navigate(`/challenges/${challenge.id}`)}
                      sx={{ cursor: "pointer" }}
                    >
                      {challenge.image && (
                        <CardMedia
                          component="img"
                          height="140"
                          image={`http://127.0.0.1:5000/${challenge.image}`}
                          alt={challenge.name}
                        />
                      )}
                      <CardContent>
                        <Typography variant="h6" component="div" gutterBottom>
                          {challenge.name}
                        </Typography>
                        <Button
                          variant="contained"
                          color="secondary"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLeaveChallenge(challenge.id);
                          }}
                        >
                          Leave Challenge
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
            {filteredJoinedChallenges.length > 3 && (
              <Box textAlign="center" mt={2}>
                <Button
                  variant="contained"
                  onClick={() =>
                    setShowMoreJoinedChallenges(!showMoreJoinedChallenges)
                  }
                >
                  {showMoreJoinedChallenges ? "Show Less" : "Show More"}
                </Button>
              </Box>
            )}
          </Box>
        )}

        <Box mt={4}>
          <Typography variant="h5" gutterBottom>
            All Challenges
          </Typography>
          <Grid container spacing={2}>
            {filteredAllChallenges.map((challenge) => (
              <Grid item xs={12} sm={6} md={4} key={challenge.id}>
                <Card
                  onClick={() => navigate(`/challenges/${challenge.id}`)}
                  sx={{ cursor: "pointer" }}
                >
                  {challenge.image && (
                    <CardMedia
                      component="img"
                      height="140"
                      image={`http://127.0.0.1:5000/${challenge.image}`}
                      alt={challenge.name}
                    />
                  )}
                  <CardContent>
                    <Typography variant="h6" component="div" gutterBottom>
                      {challenge.name}
                    </Typography>
                    {participants[challenge.id] ? (
                      <Button
                        variant="contained"
                        color="secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLeaveChallenge(challenge.id);
                        }}
                      >
                        Leave Challenge
                      </Button>
                    ) : (
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleJoinChallenge(challenge.id);
                        }}
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
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "space-around",
          padding: "10px",
          backgroundColor: "#fff",
          boxShadow: "0px -2px 5px rgba(0, 0, 0, 0.1)",
          zIndex: 1000,
        }}
      >
        <Button
          onClick={handleGoToRecipes}
          variant="contained"
          color="primary"
          sx={{ flex: 1 }}
        >
          Recipes
        </Button>
        <Button variant="outlined" color="primary" sx={{ flex: 1 }}>
          Challenges
        </Button>
        <Button
          onClick={handleGoToGroups}
          variant="contained"
          color="primary"
          sx={{ flex: 1 }}
        >
          Community
        </Button>
      </div>
      </main>
    </div>
  );
};

export default Challenges;

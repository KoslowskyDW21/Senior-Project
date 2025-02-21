import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Grid2,
  Box,
  Container,
  CardActionArea,
  CardHeader,
} from "@mui/material";
import Header from "./Header";
import Challenge from "./Challenge";

interface UserId {
  id: number;
}

interface User {
  profile_picture: string;
}

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

const Challenges: React.FC = () => {
  const [challenges, setChallenges] = useState<ChallengeData[]>([]);
  const [myChallenges, setMyChallenges] = useState<ChallengeData[]>([]);
  const [joinedChallenges, setJoinedChallenges] = useState<ChallengeData[]>([]);
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
  const [pastChallenges, setPastChallenges] = useState<ChallengeData[]>([]);

  const getResponse = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:5000/challenges/");
      const data: ChallengeData[] = response.data;
      const now = new Date();
      const validChallenges = data.filter(
        (challenge) => new Date(challenge.end_time).getTime() + 24 * 60 * 60 * 1000 > now.getTime()
      );
      setChallenges(validChallenges);

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
      const joinedChallengesList: ChallengeData[] = [];
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

  const fetchPastChallenges = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:5000/challenges/past_challenges");
      setPastChallenges(response.data);
    } catch (error) {
      console.error("Error fetching past challenges:", error);
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
      setSearchQuery(searchQuery);
    } else {
      setSearchQuery("");
    }
  };

  const filteredMyChallenges = myChallenges
    .filter((challenge) => !pastChallenges.some((past) => past.id === challenge.id))
    .filter((challenge) =>
      challenge.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const filteredJoinedChallenges = joinedChallenges
    .filter((challenge) => !pastChallenges.some((past) => past.id === challenge.id))
    .filter((challenge) =>
      challenge.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const filteredAllChallenges = challenges
    .filter((challenge) => !pastChallenges.some((past) => past.id === challenge.id))
    .filter((challenge) =>
      challenge.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const handleGoToRecipes = async () => {
    navigate("/recipes");
  };

  useEffect(() => {
    getResponse();
    getCurrentUser();
    fetchPastChallenges();
  }, []);

  React.useEffect(() => {
    filterChallenges();
  }, [location.search, challenges, pastChallenges]);

  return (
    <div>
      <Header
        title="Challenges"
        searchLabel="Search for challenges"
        searchVisible={true}
      />
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
      <main role="main" style={{ paddingTop: "90px" }}>
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
              onClick={() => navigate("/past-challenges")}
            >
              View Past Challenges
            </Button>
          </Box>

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
                <Grid2 container spacing={2}>
                  {filteredMyChallenges.map((challenge) => (
                    <Grid2 item xs={12} sm={6} md={4} key={challenge.id}>
                      <Challenge {...challenge} />
                    </Grid2>
                  ))}
                </Grid2>
              </Box>
              {filteredMyChallenges.length > 3 && (
                <Box textAlign="center" mt={2}>
                  <Button
                    variant="contained"
                    onClick={() =>
                      setShowMoreMyChallenges(!showMoreMyChallenges)
                    }
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
                <Grid2 container spacing={2}>
                  {filteredJoinedChallenges.map((challenge) => (
                    <Grid2 item xs={12} sm={6} md={4} key={challenge.id}>
                      <Challenge {...challenge} />
                    </Grid2>
                  ))}
                </Grid2>
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
            <Grid2 container spacing={2}>
              {filteredAllChallenges.map((challenge) => (
                <Grid2 item xs={12} sm={6} md={4} key={challenge.id}>
                  <Challenge {...challenge} />
                </Grid2>
              ))}
            </Grid2>
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
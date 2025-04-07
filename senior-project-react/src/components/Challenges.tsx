import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Typography,
  Box,
  Container,
  TextField,
  useMediaQuery,
  Grid2,
} from "@mui/material";
import Header from "./Header";
import Footer from "./Footer";
import Challenge from "./Challenge";
import config from "../config.js";
import CircularProgress from "@mui/material/CircularProgress";

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
  const [invitedChallenges, setInvitedChallenges] = useState<ChallengeData[]>(
    []
  );
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

  const isSmallScreen = useMediaQuery("(max-width:600px)");
  const isMediumScreen = useMediaQuery(
    "(min-width:600px) and (max-width:900px)"
  );
  const [loading, setLoading] = useState<boolean>(true);

  const getResponse = async () => {
    try {
      const response = await axios.get(`${config.serverUrl}/challenges/`);
      const data: ChallengeData[] = response.data;
      const now = new Date();
      const validChallenges = data.filter(
        (challenge) =>
          new Date(challenge.end_time).getTime() + 24 * 60 * 60 * 1000 >
          now.getTime()
      );
      setChallenges(validChallenges);

      const userResponse = await axios.get(
        `${config.serverUrl}/challenges/current_user_id/`
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

      // Fetch participant status for each competition (challenge)
      const participantStatus: { [key: number]: boolean } = {};
      const joinedChallengesList: ChallengeData[] = [];
      for (const challenge of data) {
        const participantResponse = await axios.get(
          `${config.serverUrl}/challenges/${challenge.id}/is_participant/`
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

      // Fetch challenges with invite notifications
      const notificationsResponse = await axios.get(
        `${config.serverUrl}/challenges/notifications/`
      );
      const inviteNotifications =
        notificationsResponse.data.notifications.filter(
          (notification: any) =>
            notification.notification_type === "challenge_reminder"
        );
      const invitedChallengeIds = inviteNotifications.map(
        (notification: any) => notification.challenge_id
      );
      const invitedChallengesList = data.filter((challenge) =>
        invitedChallengeIds.includes(challenge.id)
      );
      setInvitedChallenges(invitedChallengesList);
    } catch (error) {
      console.error("Error fetching competitions (challenges):", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPastChallenges = async () => {
    try {
      const response = await axios.get(
        `${config.serverUrl}/challenges/past_challenges/`
      );
      setPastChallenges(response.data);
    } catch (error) {
      console.error("Error fetching past competitions (challenges):", error);
    }
  };

  const getCurrentUser = async () => {
    try {
      const response = await axios.get(
        `${config.serverUrl}/profile/`
      );
      const data: User = response.data;
      setProfile_picture(data.profile_picture);
      console.log(profile_picture);
    } catch (error) {
      console.error("Error fetching user: ", error);
    }
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    setSearchQuery(query);

    if (query) {
      navigate({
        pathname: location.pathname,
        search: `?search=${query}`,
      });
    } else {
      navigate({
        pathname: location.pathname,
        search: "",
      });
    }
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
    .filter(
      (challenge) => !pastChallenges.some((past) => past.id === challenge.id)
    )
    .filter((challenge) =>
      challenge.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const filteredJoinedChallenges = joinedChallenges
    .filter(
      (challenge) => !pastChallenges.some((past) => past.id === challenge.id)
    )
    .filter((challenge) =>
      challenge.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const filteredInvitedChallenges = invitedChallenges.filter((challenge) =>
    challenge.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredAllChallenges = challenges
    .filter(
      (challenge) => !pastChallenges.some((past) => past.id === challenge.id)
    )
    .filter((challenge) =>
      challenge.name.toLowerCase().includes(searchQuery.toLowerCase())
    );


  useEffect(() => {
    getResponse();
    getCurrentUser();
    fetchPastChallenges();
  }, []);

  React.useEffect(() => {
    filterChallenges();
  }, [location.search, challenges, pastChallenges]);

  if (loading) {
    // Show loading spinner while loading is true
    return (
      <div>
      <Header title="Competitions" />
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <CircularProgress />
      </Box>
      </div>
    );
  }

  return (
    <div>
      <Header title="Competitions" />
      <Box
        mt={{ xs: 10, sm: 14, md: 14 }}
        textAlign="center"
        display="flex"
        justifyContent="center"
        sx={{ flexGrow: 1 }}
      >
        <TextField
          label="Search for competitions"
          variant="outlined"
          fullWidth
          value={searchQuery}
          onChange={handleSearchChange}
          sx={{
            width: "100%",
          }}
        />
      </Box>
      <main role="main" style={{ paddingBottom: "90px" }}>
        <Container>
          <Box mt={4} mb={2} textAlign="center">
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate("/past-challenges")}
            >
              View Past Competitions
            </Button>
          </Box>

          <Box mt={4} mb={2} textAlign="center">
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate(`/challenges/create`)}
            >
              Create a Competition
            </Button>
          </Box>

          {filteredMyChallenges.length > 0 && (
            <Box mt={4}>
              <Typography variant="h5" gutterBottom>
                My Competitions
              </Typography>
              <Box>
                <Grid2
                  container
                  spacing={2}
                  columns={isSmallScreen ? 1 : isMediumScreen ? 2 : 3}
                >
                  {filteredMyChallenges.map((challenge) => (
                    <Grid2 key={challenge.id}>
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

          {filteredInvitedChallenges.length > 0 && (
            <Box mt={4}>
              <Typography variant="h5" gutterBottom>
                Invited Competitions
              </Typography>
              <Box>
                <Grid2
                  container
                  spacing={2}
                  columns={isSmallScreen ? 1 : isMediumScreen ? 2 : 3}
                >
                  {filteredInvitedChallenges.map((challenge) => (
                    <Grid2 key={challenge.id}>
                      <Challenge {...challenge} />
                    </Grid2>
                  ))}
                </Grid2>
              </Box>
            </Box>
          )}

          {filteredJoinedChallenges.length > 0 && (
            <Box mt={4}>
              <Typography variant="h5" gutterBottom>
                Joined Competitions
              </Typography>
              <Box>
                <Grid2
                  container
                  spacing={2}
                  columns={isSmallScreen ? 1 : isMediumScreen ? 2 : 3}
                >
                  {filteredJoinedChallenges.map((challenge) => (
                    <Grid2 key={challenge.id}>
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
              All Competitions
            </Typography>
            <Grid2
              container
              spacing={2}
              columns={isSmallScreen ? 1 : isMediumScreen ? 2 : 3}
            >
              {filteredAllChallenges.map((challenge) => (
                <Grid2 key={challenge.id}>
                  <Challenge {...challenge} />
                </Grid2>
              ))}
            </Grid2>
          </Box>
        </Container>
        <Footer />
      </main>
    </div>
  );
};

export default Challenges;

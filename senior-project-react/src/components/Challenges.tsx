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

interface UserId {
  id: number;
}

interface User {
  profile_picture: string;
}

interface UserNotifications {
  notifications: [];
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
  const [admin, setAdmin] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<[]>([]);

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

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const [notificationAnchorEl, setNotificationAnchorEl] =
    useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleClickNotification = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationAnchorEl(event.currentTarget);
  };

  const handleReadNotification = (
    event: React.MouseEvent<HTMLElement>,
    id: any,
    notification_type: any
  ) => {
    console.log(id);
    setNotificationAnchorEl(event.currentTarget);
    readNotificationsApi(id);
    if (notification_type === "friend_request") {
      navigate("/groups");
    } else if (notification_type === "group_message") {
      navigate("/groups");
    } else if (notification_type === "challenge_reminder") {
      navigate("/challenges");
    }
  };

  const handleCloseNotification = () => {
    setNotificationAnchorEl(null);
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

  const getNotifications = async () => {
    try {
      const response = await axios.post(
        "http://127.0.0.1:5000/settings/get_notifications/",
        {},
        { withCredentials: true }
      );
      const data: UserNotifications = response.data;
      setNotifications(data.notifications);
    } catch (error) {
      console.log("Error fetching notifications: ", error);
    }
  };

  async function readNotificationsApi(id: any) {
    try {
      const data = {
        id: id,
      };
      console.log(data);
      await axios.post(
        "http://127.0.0.1:5000/settings/read_notification/",
        data,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      console.log("Notification read successfully!");
    } catch (error) {
      console.error("Error reading notification: ", error);
    }
  }

  async function isAdmin() {
    await axios
      .get("http://127.0.0.1:5000/admin/")
      .then((response) => {
        setAdmin(response.data.is_admin);
      })
      .catch((error) => {
        console.error("Unable to check if user is admin", error);
      });
  }

  const handleGoToGroups = async () => {
    navigate(`/groups`);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
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

  const handleGoToProfile = async () => {
    navigate(`/profile`);
  };

  const handleGoToAchievements = async () => {
    navigate(`/achievements`);
  };

  const handleGoToRecipeLists = async () => {
    navigate(`/recipe-lists/`);
  };
  const handleGoToSettings = async () => {
    navigate("/settings");
  };

  const handleGoToAdmin = async () => {
    navigate("/admin");
  };

  const handleGoToRecipes = async () => {
    navigate("/recipes");
  };

  const handleGoToShoppingList = async () => {
    navigate("/shopping-list");
  };

  useEffect(() => {
    getResponse();
    getCurrentUser();
    isAdmin();
    getNotifications();
  }, []);

  return (
    <div>
      <Box
        sx={{
          flexGrow: 1,
          fontSize: "12px",
          color: "#FFFFFF",
        }}
      >
        <h1>e</h1>
      </Box>
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          display: "flex",
          alignItems: "center",
          padding: "10px 20px",
          backgroundColor: "#fff",
          boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.1)",
          zIndex: 1000,
          height: "100px",
          justifyContent: "space-between",
        }}
      >
        <ButtonBase onClick={handleGoToRecipes}>
          <Box
            sx={{
              width: 70,
              height: 70,
              backgroundColor: "lightgray",
              borderRadius: 2,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              marginRight: "20px",
            }}
          >
            <img
              src="http://127.0.0.1:5000/static\uploads\2cc38bfefa3a4e26b89ac081ff6cf7df_cook.jpg"
              alt="Image"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </Box>
        </ButtonBase>

        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            flexGrow: 1,
            alignItems: "center",
            fontSize: "24px",
            fontWeight: "bold",
          }}
        >
          <h1>Challenges</h1>
        </Box>

        <Box
          mt={4}
          mb={2}
          textAlign="center"
          display="flex"
          justifyContent="center"
          sx={{ flexGrow: 1 }}
        >
          <TextField
            label="Search Challenges"
            variant="outlined"
            fullWidth
            value={searchQuery}
            onChange={handleSearchChange}
            sx={{
              zIndex: 1001,
              width: 500,
            }}
          />
        </Box>

        {/* Notification */}
        <IconButton
          onClick={handleClickNotification}
          style={{ position: "relative", top: 8, right: 6 }}
        >
          <Avatar sx={{ width: 70, height: 70, backgroundColor: "gray" }}>
            <NotificationsIcon sx={{ color: "white" }} />
            {notifications.length > 0 &&
              notifications.some((n) => n.isRead === 0) && (
                <Box
                  sx={{
                    position: "absolute",
                    top: 5,
                    right: 5,
                    width: 15,
                    height: 15,
                    backgroundColor: "red",
                    borderRadius: "50%",
                  }}
                />
              )}
          </Avatar>
        </IconButton>

        <Menu
          anchorEl={notificationAnchorEl}
          open={Boolean(notificationAnchorEl)}
          onClose={handleCloseNotification}
        >
          {notifications.length > 0 &&
          notifications.some((n) => n.isRead === 0) ? (
            notifications
              .filter((notification) => notification.isRead === 0)
              .map((notification, index) => (
                <MenuItem
                  key={index}
                  onClick={(event) =>
                    handleReadNotification(
                      event,
                      notification.id,
                      notification.notification_type
                    )
                  }
                >
                  {notification.notification_text}
                </MenuItem>
              ))
          ) : (
            <MenuItem>No new notifications</MenuItem>
          )}
        </Menu>
        <IconButton
          onClick={handleClick}
          style={{ position: "relative", top: 8, right: 8 }}
        >
          {profile_picture ? (
            <Avatar
              alt="Profile Picture"
              src={profile_picture}
              sx={{ width: 70, height: 70, border: "1px solid #000" }}
            />
          ) : (
            <Avatar sx={{ width: 70, height: 70, backgroundColor: "gray" }}>
              <PersonIcon sx={{ color: "white" }} />
            </Avatar>
          )}
        </IconButton>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
        >
          <MenuItem onClick={handleGoToProfile}>Profile</MenuItem>
          <MenuItem onClick={handleGoToSettings}>Settings</MenuItem>
          <MenuItem onClick={handleGoToRecipeLists}>Recipe Lists</MenuItem>
          <MenuItem onClick={handleGoToShoppingList}>Shopping List</MenuItem>
          <MenuItem onClick={handleGoToAchievements}>Achievements</MenuItem>
          {admin ? (
            <MenuItem onClick={handleGoToAdmin}>Admin Controls</MenuItem>
          ) : (
            <></>
          )}
        </Menu>
      </Box>
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
            Groups
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
    </div>
  );
};

export default Challenges;

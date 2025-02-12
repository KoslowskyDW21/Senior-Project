import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Grid,
  Box,
  Container,
  Button,
  MenuItem,
  Menu,
  IconButton,
  Avatar,
  ButtonBase,
  TextField,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import NotificationsIcon from "@mui/icons-material/Notifications";

interface UserGroup {
  id: number;
  name: string;
  description: string;
  is_public: boolean;
  num_reports: number;
  image?: string;
}

interface User {
  profile_picture: string;
}

interface UserNotifications {
  notifications: [];
}

const Groups: React.FC = () => {
  const [groups, setGroups] = useState<UserGroup[]>([]);
  const [myGroups, setMyGroups] = useState<UserGroup[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [profile_picture, setProfile_picture] = useState<string>();
  const [admin, setAdmin] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<[]>([]);

  const fetchGroups = async () => {
    try {
      const response = await axios.get(`http://127.0.0.1:5000/groups`);
      if (response.status === 200) {
        const newGroups = response.data;
        setGroups((prevGroups) => [...prevGroups, ...newGroups]);
        setHasMore(newGroups.length > 0);
      }
    } catch (error) {
      console.error("Error fetching groups:", error);
    }
  };

  const fetchMyGroups = async () => {
    try {
      const response = await axios.get(
        `http://127.0.0.1:5000/groups/my_groups`
      );
      if (response.status === 200) {
        setMyGroups(response.data);
      }
    } catch (error) {
      console.error("Error fetching my groups:", error);
    }
  };

  const loadMoreGroups = useCallback(() => {
    if (loading || !hasMore) return;
    setLoading(true);
    fetchGroups(page).then(() => {
      setPage((prevPage) => prevPage + 1);
      setLoading(false);
    });
  }, [loading, hasMore, page]);

  useEffect(() => {
    loadMoreGroups();
    fetchMyGroups();
    getCurrentUser();
    isAdmin();
    getNotifications();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 500
      ) {
        loadMoreGroups();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loadMoreGroups]);

  const handleGoToRecipes = async () => {
    navigate(`/recipes`);
  };

  const handleGoToProfile = async () => {
    navigate(`/profile`);
  };

  const handleGoToAchievements = async () => {
    navigate(`/achievements`);
  };

  const handleGoToRecipeLists = async () => {
    navigate(`/recipe-lists/`);
  };

  const handleGoToShoppingList = async () => {
    navigate("/shopping-list");
  };

  const handleGoToChallenges = async () => {
    navigate(`/challenges`);
  };

  const handleGoToSettings = async () => {
    navigate("/settings");
  };

  const handleGoToAdmin = async () => {
    navigate("/admin");
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
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

  const filteredGroups = groups.filter(
    (group) =>
      group.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !myGroups.some((myGroup) => myGroup.id === group.id)
  );

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
          <h1>Community</h1>
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
            label="Search Groups"
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
        <Box mt={4} mb={2} textAlign="center">
          <Typography variant="h4" gutterBottom>
            User Groups
          </Typography>
        </Box>

        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate(`/groups/create`)}
        >
          Create a Group
        </Button>

        {myGroups.length > 0 && (
          <Box mt={4}>
            <Typography variant="h5" gutterBottom>
              My Groups
            </Typography>
            <Grid container spacing={2}>
              {myGroups.map((group) => (
                <Grid item xs={12} sm={6} md={4} key={group.id}>
                  <Card
                    onClick={() => navigate(`/groups/${group.id}`)}
                    sx={{ cursor: "pointer" }}
                  >
                    {group.image && (
                      <CardMedia
                        component="img"
                        height="140"
                        image={`http://127.0.0.1:5000/${group.image}`}
                        alt={group.name}
                      />
                    )}
                    <CardContent>
                      <Typography variant="h6" component="div" gutterBottom>
                        {group.name}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {group.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        <Box mt={4}>
          <Typography variant="h5" gutterBottom>
            All Groups
          </Typography>
          <Grid container spacing={2}>
            {filteredGroups.map((group) => (
              <Grid item xs={12} sm={6} md={4} key={group.id}>
                <Card
                  onClick={() => navigate(`/groups/${group.id}`)}
                  sx={{ cursor: "pointer" }}
                >
                  {group.image && (
                    <CardMedia
                      component="img"
                      height="140"
                      image={`http://127.0.0.1:5000/${group.image}`}
                      alt={group.name}
                    />
                  )}
                  <CardContent>
                    <Typography variant="h6" component="div" gutterBottom>
                      {group.name}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {group.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
        {loading && (
          <Box textAlign="center" mt={4}>
            <Typography variant="body2" color="textSecondary">
              Loading...
            </Typography>
          </Box>
        )}
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
        <Button
          onClick={handleGoToChallenges}
          variant="contained"
          color="primary"
          sx={{ flex: 1 }}
        >
          Challenges
        </Button>
        <Button variant="outlined" color="primary" sx={{ flex: 1 }}>
          Community
        </Button>
      </div>
    </div>
  );
};

export default Groups;

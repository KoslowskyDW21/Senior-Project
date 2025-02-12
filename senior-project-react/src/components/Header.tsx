import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // React Router for nav
import {
  Button,
  ButtonBase,
  Card,
  CardHeader,
  CardMedia,
  CardActionArea,
  Menu,
  MenuItem,
  IconButton,
  Avatar,
  TextField,
  Box,
} from "@mui/material"; //matui components
import Grid from "@mui/material/Grid2";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { Star, StarBorder } from "@mui/icons-material";
import PersonIcon from "@mui/icons-material/Person";


interface HeaderProps {
    title: string;
}

interface User {
  profile_picture: string;
}

interface UserNotifications {
  notifications: [];
}


const Header: React.FC<HeaderProps> = ({ title }) => {
  const [admin, setAdmin] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [profile_picture, setProfile_picture] = useState<string>();
  const [notifications, setNotifications] = useState<[]>([]);

  const navigate = useNavigate();

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

  const [avatarAnchorEl, setAvatarAnchorEl] = useState<null | HTMLElement>(
    null
  );
  const [notificationAnchorEl, setNotificationAnchorEl] =
    useState<null | HTMLElement>(null);

  const handleClickAvatar = (event: React.MouseEvent<HTMLElement>) => {
    setAvatarAnchorEl(event.currentTarget);
  };

  const handleCloseAvatar = () => {
    setAvatarAnchorEl(null);
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


  React.useEffect(() => {
    getCurrentUser();
    getNotifications();
    isAdmin();
  }, []);

  return (
    <div>
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
          <h1>{title}</h1>
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
            label="Search"
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
        {/* Avatar Menu */}
        <IconButton
          onClick={handleClickAvatar}
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
          anchorEl={avatarAnchorEl}
          open={Boolean(avatarAnchorEl)}
          onClose={handleCloseAvatar}
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
      </Box>{" "}
      {/* End of menu bar Box */}
    </div>
  );
};

export default Header;

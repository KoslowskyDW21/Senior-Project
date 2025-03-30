import React, { useState } from "react";
import { useTheme } from "@mui/material/styles";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom"; // React Router for nav
import {
  ButtonBase,
  Menu,
  MenuItem,
  Divider,
  IconButton,
  Avatar,
  Box,
} from "@mui/material"; //matui components
import NotificationsIcon from "@mui/icons-material/Notifications";
import PersonIcon from "@mui/icons-material/Person";
import config from "../config.js";
import { useMsal } from "@azure/msal-react";

interface HeaderProps {
  title: string;
}

interface User {
  profile_picture: string;
}

interface UserNotifications {
  notifications: {
    id: number;
    notification_text: string;
    isRead: number;
    notification_type: string;
    group_id?: number; // Add this line
  }[];
}

const Header: React.FC<HeaderProps> = ({ title }) => {
  const [admin, setAdmin] = useState<boolean>(false);
  const [profile_picture, setProfile_picture] = useState<string>();
  const [notifications, setNotifications] = useState<[]>([]);

  const navigate = useNavigate();
  const location = useLocation();

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
    getNotifications();
    setNotificationAnchorEl(event.currentTarget);
  };

  const handleReadNotification = (
    event: React.MouseEvent<HTMLElement>,
    id: number,
    notification_type: string,
    group_id?: number,
    challenge_id?: number
  ) => {
    console.log(id);
    readNotificationsApi(id);
    handleCloseNotification();

    if (
      notification_type === "friend_request" &&
      location.pathname !== "/friends"
    ) {
      navigate("/friends");
    } else if (
      notification_type === "group_message" &&
      group_id &&
      location.pathname !== "/groups"
    ) {
      navigate(`/groups/${group_id}`);
    } else if (
      notification_type === "challenge_reminder" &&
      location.pathname !== "/challenges"
    ) {
      navigate(`/challenges/${challenge_id}`);
    }
  };

  const clearNotifications = async () => {
    try {
      await axios.post(
        `${config.serverUrl}/settings/clear_notifications/`,
        {},
        { withCredentials: true }
      );
      console.log("Notifications cleared successfully!");
      handleCloseNotification();
      getNotifications();
    } catch (error) {
      console.error("Error reading notification: ", error);
    }
  };

  const handleCloseNotification = () => {
    setNotificationAnchorEl(null);
  };

  const getCurrentUser = async () => {
    try {
      const response = await axios.post(
        `${config.serverUrl}/profile/get_profile_pic/`
      );
      const data: User = response.data;
      setProfile_picture(`${config.serverUrl}/${data.profile_picture}`);
      console.log(profile_picture);
    } catch (error) {
      console.error("Error fetching user: ", error);
    }
  };

  const getNotifications = async () => {
    //TODO: Change to periodically update instead of just on refresh
    try {
      const response = await axios.post(
        `${config.serverUrl}/settings/get_notifications/`,
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
        `${config.serverUrl}/settings/read_notification/`,
        data,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      console.log("Notification read successfully!");
      getNotifications();
    } catch (error) {
      console.error("Error reading notification: ", error);
    }
  }

  async function isAdmin() {
    await axios
      .get(`${config.serverUrl}/admin/`)
      .then((response) => {
        setAdmin(response.data.is_admin);
      })
      .catch((error) => {
        console.error("Unable to check if user is admin", error);
      });
  }

  const { instance } = useMsal();

  const handleLogout = async () => {
    try {
      // Get access token
      const response = await instance.acquireTokenSilent({
        scopes: ["User.Read"],
      });

      const token = response.idToken;

      await axios.post(
        `${config.serverUrl}/login/logout`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      instance.logoutRedirect().then(() => {
        navigate("/");
      });
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  React.useEffect(() => {
    getCurrentUser();
    getNotifications();
    isAdmin();
    console.log("useEffect pathname", location.pathname);
  }, []);

  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";

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
          backgroundColor: theme.palette.background.default,
          boxShadow: isDarkMode
            ? "0px 2px 5px rgba(255, 255, 255, 0.1)"
            : "0px 2px 5px rgba(0, 0, 0, 0.1)",
          zIndex: 1000,
          height: "clamp(50px, 6vw, 80px)",
          justifyContent: "center",
        }}
      >
        <ButtonBase onClick={handleGoToRecipes}>
          <Box
            sx={{
              width: "clamp(40px, 6vw, 70px)", // Width will scale between 50px and 70px
              height: "clamp(40px, 6vw, 70px)", // Same for height
              backgroundColor: "lightgray",
              borderRadius: 2,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              marginRight: "20px",
            }}
          >
            <img
              src={`${config.serverUrl}/static/uploads/2cc38bfefa3a4e26b89ac081ff6cf7df_cook.jpg`}
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
            fontSize: "clamp(8px, 1vw, 20px)", // Scales based on screen width, between 16px and 24px
            fontWeight: "bold",
          }}
        >
          <h1>{title}</h1>
        </Box>
        <Box>
          {/* Notification Icon */}
          <IconButton
            onClick={handleClickNotification}
            style={{ position: "relative", top: 8, right: 6 }}
          >
            <Avatar
              sx={{
                width: "clamp(20px, 4vw, 40px)", // Avatar width scales between 40px and 70px based on screen width
                height: "clamp(20px, 4vw, 40px)", // Avatar height scales between 40px and 70px based on screen width
                backgroundColor: "gray",
              }}
            >
              <NotificationsIcon
                sx={{
                  color: "white",
                  width: "clamp(4px, 3vw, 20px)", // Notification indicator size scales between 10px and 15px
                  height: "clamp(4px, 3vw, 20px)",
                }}
              />
              {notifications.length > 0 &&
                notifications.some((n) => n.isRead === 0) && (
                  <Box
                    sx={{
                      position: "absolute",
                      top: 4,
                      right: 4,
                      width: "clamp(4px, 1vw, 15px)", // Notification indicator size scales between 10px and 15px
                      height: "clamp(4px, 1vw, 15px)", // Notification indicator size scales between 10px and 15px
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
            sx={{
              "& .MuiPaper-root": {
                width: "clamp(130px, 20vw, 200px)",
                maxHeight: "clamp(80px, 40vh, 380px)",
              },
            }}
          >
            {notifications.length > 0 &&
            notifications.some((n) => n.isRead === 0) ? (
              <>
                <MenuItem
                  onClick={clearNotifications}
                  sx={{
                    color: "red",
                    fontSize: "clamp(13px, 1vw, 20px)",
                  }}
                >
                  Clear Notifications
                </MenuItem>
                <Divider />
                {notifications
                  .filter((notification) => notification.isRead === 0)
                  .map((notification, index) => (
                    <MenuItem
                      key={index}
                      sx={{
                        fontSize: "clamp(13px, 1vw, 20px)",
                      }}
                      onClick={(event) =>
                        handleReadNotification(
                          event,
                          notification.id,
                          notification.notification_type,
                          notification.group_id,
                          notification.challenge_id
                        )
                      }
                    >
                      {notification.notification_text}
                    </MenuItem>
                  ))}
              </>
            ) : (
              <MenuItem>No new notifications</MenuItem>
            )}
          </Menu>
          {/* Avatar Icon */}
          <IconButton
            onClick={handleClickAvatar}
            style={{ position: "relative", top: 8, right: 8 }}
          >
            {profile_picture ? (
              <Avatar
                alt="Profile Picture"
                src={profile_picture}
                sx={{
                  width: "clamp(20px, 4vw, 40px)", // Avatar width scales between 40px and 70px based on screen width
                  height: "clamp(20px, 4vw, 40px)", // Avatar height scales between 40px and 70px based on screen width
                  border: "1px solid #000",
                }}
              />
            ) : (
              <Avatar
                sx={{
                  width: "clamp(40px, 8vw, 70px)", // Avatar width scales between 40px and 70px based on screen width
                  height: "clamp(40px, 8vw, 70px)", // Avatar height scales between 40px and 70px based on screen width
                  backgroundColor: "gray",
                }}
              >
                <PersonIcon sx={{ color: "white" }} />
              </Avatar>
            )}
          </IconButton>

          <Menu
            anchorEl={avatarAnchorEl}
            open={Boolean(avatarAnchorEl)}
            onClose={handleCloseAvatar}
          >
            <MenuItem
              onClick={handleGoToProfile}
              sx={{
                fontSize: "clamp(14px, 1vw, 20px)",
              }}
            >
              Profile
            </MenuItem>
            <MenuItem
              onClick={handleGoToSettings}
              sx={{
                fontSize: "clamp(14px, 1vw, 20px)",
              }}
            >
              Settings
            </MenuItem>
            {/* <MenuItem onClick={handleGoToRecipeLists}>Recipe Lists</MenuItem> */}
            {/* <MenuItem onClick={handleGoToShoppingList}>Shopping List</MenuItem> */}
            <MenuItem
              onClick={handleGoToAchievements}
              sx={{
                fontSize: "clamp(14px, 1vw, 20px)",
              }}
            >
              Achievements
            </MenuItem>
            <MenuItem
              onClick={handleLogout}
              sx={{ color: "red", fontSize: "clamp(14px, 1vw, 20px)" }}
            >
              Log Out
            </MenuItem>
            {admin ? (
              <MenuItem onClick={handleGoToAdmin}>Admin Controls</MenuItem>
            ) : (
              <></>
            )}
          </Menu>
        </Box>{" "}
      </Box>
      {/* End of menu bar Box */}
    </div>
  );
};

export default Header;

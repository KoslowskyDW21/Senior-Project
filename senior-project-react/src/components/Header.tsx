import React, { useEffect, useState } from "react";
import axios, { all } from "axios";
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
  FormControl,
  InputLabel,
  Select,
  Checkbox,
  ListItemText,
  FormHelperText
} from "@mui/material"; //matui components
import Grid from "@mui/material/Grid2";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { Star, StarBorder } from "@mui/icons-material";
import PersonIcon from "@mui/icons-material/Person";

interface HeaderProps {
  title: string;
  searchLabel?: string;
  searchVisible?: boolean;
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

interface DietaryRestrictions {
  dietaryRestrictions: [];
  userDietaryRestrictions: [];
}

const Header: React.FC<HeaderProps> = ({
  title,
  searchLabel,
  searchVisible,
}) => {
  const [admin, setAdmin] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [profile_picture, setProfile_picture] = useState<string>();
  const [notifications, setNotifications] = useState<[]>([]);
  const [isSearchVisible, setIsSearchVisible] = useState<boolean>(
    searchVisible ?? false
  );

  const [dietaryRestrictions, setDietaryRestrictions] = useState<[]>([]);
  const [userDietaryRestrictions, setUserDietaryRestrictions] = useState<[]>([]);
  const [selectedDietaryRestrictions, setSelectedDietaryRestrictions] = useState<string[]>([]);
    
  

  const navigate = useNavigate();

  

  React.useEffect(() => {
      const preselectedDietaryRestrictions = dietaryRestrictions
        .filter((dietaryRestriction) =>
          userDietaryRestrictions.some(
            (userDietaryRestriction) =>
              userDietaryRestriction.restriction_id === //use the actual ID attribute from the SQL table
              dietaryRestriction.id
          )
        )
        .map((dietaryRestriction) => dietaryRestriction.name);
  
      setSelectedDietaryRestrictions(preselectedDietaryRestrictions);
      console.log(preselectedDietaryRestrictions);
    }, [dietaryRestrictions, userDietaryRestrictions]);

  const getDietaryRestrictions = async () => {
    try {
      const response = await axios.post(
        "http://127.0.0.1:5000/settings/dietary_restrictions/",
        {},
        { withCredentials: true }
      );
      console.log("response: ", response);
      const data: DietaryRestrictions = response.data;
      console.log("data: " + data);
      setDietaryRestrictions(data.dietaryRestrictions);
      setUserDietaryRestrictions(data.userDietaryRestrictions);
    } catch (error) {
      console.error("Could not fetch dietary restrictions:", error);
    }
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    setSearchQuery(query); 

    navigate({
      pathname: location.pathname,
      search: `?search=${query}}`,
    });
  };
  
  const handleAllergenChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const newAllergens = event.target.value as string[];
    setSelectedDietaryRestrictions(newAllergens); 
  
    /*navigate({
      pathname: location.pathname,
      search: `?search=${searchQuery}&allergens=${newAllergens.join(",")}`,
    });*/
  };
  
  

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const allergensParam = queryParams.get("allergens");
    
    if (allergensParam) {
      setSelectedDietaryRestrictions(allergensParam.split(","));
    }
  }, [location.search]);

  React.useEffect(() => {
    navigate({
      pathname: location.pathname,
      search: `?search=${searchQuery}`,
    });
  }, [searchQuery, selectedDietaryRestrictions, navigate, location.pathname]);
  

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
    id: number,
    notification_type: string,
    group_id?: number // Add this parameter
  ) => {
    console.log(id);
    setNotificationAnchorEl(event.currentTarget);
    readNotificationsApi(id);
    if (notification_type === "friend_request") {
      navigate("/groups");
    } else if (notification_type === "group_message" && group_id) {
      navigate(`/groups/${group_id}/invite_response`); // Update this line
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
    getDietaryRestrictions();
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

        {isSearchVisible && searchLabel && (
          <Box
            mt={4}
            mb={2}
            textAlign="center"
            display="flex"
            justifyContent="center"
            sx={{ flexGrow: 1 }}
          >
            <TextField
              label={searchLabel}
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
          )}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {title === "Recipes" && (
          <FormControl variant="filled" sx={{ m: 1, width: 250 }} size="small">
                  <InputLabel id="dietary_restriction-select-label">
                    Dietary Restrictions
                  </InputLabel>
                  <Select
                    labelId="dietary_restriction-select-label"
                    multiple
                    value={selectedDietaryRestrictions}
                    onChange={handleAllergenChange}
                    renderValue={(selected) => selected.join(", ")}
                    displayEmpty
                  >
                    <MenuItem value="" disabled>
                      <em>Choose a dietary restriction</em>
                    </MenuItem>
                    {dietaryRestrictions.map((restriction) => (
                      <MenuItem key={restriction.id} value={restriction.name}>
                        <Checkbox
                          checked={selectedDietaryRestrictions.includes(restriction.name)}
                        />
                        <ListItemText primary={restriction.name} />
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>Select Dietary Restrictions</FormHelperText>
                </FormControl>
        )}
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
                      notification.notification_type,
                      notification.group_id // Pass the group_id here
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
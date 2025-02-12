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

interface Recipe {
  id: number;
  recipe_name: string;
  difficulty: "1" | "2" | "3" | "4" | "5";
  xp_amount: number;
  rating: number;
  image: string;
}

interface User {
  profile_picture: string;
}

interface UserNotifications {
  notifications: [];
}

function Difficulty({ difficulty }) {
  const diamondStyle = {
    width: 24,
    height: 24,
    backgroundColor: "black",
    transform: "rotate(45deg)",
    marginRight: 2,
  };

  const renderDiamonds = (num) => {
    const diamonds = [];
    for (let i = 0; i < 5; i++) {
      diamonds.push(
        <Box
          key={i}
          sx={{
            ...diamondStyle,
            opacity: i < num ? 1 : 0.1,
          }}
        />
      );
    }
    return diamonds;
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
        padding: "2px",
      }}
    >
      {difficulty === "1" && renderDiamonds(1)}
      {difficulty === "2" && renderDiamonds(2)}
      {difficulty === "3" && renderDiamonds(3)}
      {difficulty === "4" && renderDiamonds(4)}
      {difficulty === "5" && renderDiamonds(5)}
    </Box>
  );
}

// @ts-expect-error
function Recipe({ id, name, difficulty, image }) {
  const navigate = useNavigate(); //for navigation
  id = id.toString(); // hacky insurance against mistakes

  const handleGoToRecipe = async () => {
    console.log(`Navigating to recipe page of recipe with id=${id}`);
    navigate(`/recipes/${id}`);
  };

  return (
    <Card variant="outlined">
      <CardActionArea onClick={handleGoToRecipe}>
        <CardHeader title={name} subheader={Difficulty({ difficulty })} />
        <CardMedia component="img" image={image} />
      </CardActionArea>
    </Card>
  );
}

function createRecipe(recipe: Recipe) {
  console.log(recipe.id);
  console.log(recipe.recipe_name);
  console.log(recipe.difficulty);
  console.log(recipe.image);

  return (
    <Recipe
      id={recipe.id}
      name={recipe.recipe_name}
      difficulty={recipe.difficulty}
      image={recipe.image}
    />
  );
  // return <Recipe id="1" name="Apple Frangipan Tart" difficulty="1" image="" />;
}

const Recipes: React.FC = () => {
  const [admin, setAdmin] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [profile_picture, setProfile_picture] = useState<string>();
  const [notifications, setNotifications] = useState<[]>([]);

  const navigate = useNavigate();

  const handleGoToProfile = async () => {
    navigate(`/profile`);
  };

  const handleGoToChallenges = async () => {
    console.log("setNotifications: " + notifications);
    navigate(`/challenges`);
  };

  const handleGoToAchievements = async () => {
    navigate(`/achievements`);
  };

  const handleGoToRecipeLists = async () => {
    navigate(`/recipe-lists/`);
  };

  const handleGoToGroups = async () => {
    navigate(`/groups`);
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

  async function loadRecipes() {
    try {
      const response = await axios.post("http://127.0.0.1:5000/recipes/");
      const data = response.data;
      setRecipes(data);
    } catch (error) {
      console.error("Unable to fetch recipes", error);
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

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const filteredRecipes = recipes.filter((recipe) =>
    recipe.recipe_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  React.useEffect(() => {
    getCurrentUser();
    getNotifications();
    loadRecipes();
    isAdmin();
  }, []);

  //for debugging:
  // React.useEffect(() => {
  //   console.log("Current notifications state:", notifications);
  // }, [notifications]);

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
          <h1>Recipes</h1>
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
            label="Search Recipes"
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
      <main role="main">
        <Grid container spacing={3}>
          {filteredRecipes.map((recipe) => (
            <Grid size={4} key={recipe.id}>
              <Box
                sx={{
                  border: "2px solid rgb(172, 169, 169)",
                  borderRadius: 2,
                  boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.1)",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    borderColor: "#1976d2",
                    boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
                  },
                }}
              >
                <Recipe
                  id={recipe.id}
                  name={recipe.recipe_name}
                  difficulty={recipe.difficulty}
                  image={recipe.image}
                />
              </Box>
            </Grid>
          ))}
        </Grid>
      </main>
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
        <Button variant="outlined" color="primary" sx={{ flex: 1 }}>
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
        <Button
          onClick={handleGoToGroups}
          variant="contained"
          color="primary"
          sx={{ flex: 1 }}
        >
          Community
        </Button>
      </div>
    </div>
  );
};

export default Recipes;

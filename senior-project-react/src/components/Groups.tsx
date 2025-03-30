import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardMedia,
  Typography,
  Box,
  Container,
  Button,
  IconButton,
  Avatar,
  TextField,
  CardActionArea,
  CardHeader,
  useMediaQuery,
  Grid2,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import config from "../config.js";

import Header from "./Header";
import Footer from "./Footer";

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

interface Friendship {
  friends: [];
}

const Group: React.FC<UserGroup> = ({ id, name, description, image }) => {
  const navigate = useNavigate();
  const handleGoToGroup = async () => {
    navigate(`/groups/${id}`);
  };

  return (
    <Card
      variant="outlined"
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        transition: "all 0.3s ease",
        "&:hover": {
          borderColor: "#1976d2",
          boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
        },
      }}
    >
      <CardActionArea onClick={handleGoToGroup}>
        <CardHeader
          title={
            <Typography
              variant="h5"
              sx={{ fontSize: "clamp(1rem, 1.5vw, 2rem)", textAlign: "center" }}
            >
              {name}
            </Typography>
          }
          subheader={
            <Typography
              variant="body2"
              sx={{
                fontSize: "clamp(0.8rem, 1.2vw, 1.5rem)",
                textAlign: "center",
              }}
            >
              {description}
            </Typography>
          }
          sx={{
            justifyContent: "center",
            alignItems: "center",
            flexShrink: 0,
            width: "90%",
          }}
        />
        {image && (
          <CardMedia
            component="img"
            image={`${config.serverUrl}/${image}`}
            sx={{
              height: "auto",
              objectFit: "contain",
              width: "100%",
              maxHeight: { xs: 150, sm: 200 }, // Adjust max height for different screen sizes
            }}
          />
        )}
      </CardActionArea>
    </Card>
  );
};

const Groups: React.FC = () => {
  const [groups, setGroups] = useState<UserGroup[]>([]);
  const [myGroups, setMyGroups] = useState<UserGroup[]>([]);
  const [invitedGroups, setInvitedGroups] = useState<UserGroup[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [profile_picture, setProfile_picture] = useState<string>();
  const [friends, setFriends] = useState<[]>([]);
  const [searchLabel, setSearchLabel] = useState<string>("");

  const isSmallScreen = useMediaQuery("(max-width:600px)");
  const isMediumScreen = useMediaQuery(
    "(min-width:600px) and (max-width:900px)"
  );

  const fetchGroups = async () => {
    try {
      const response = await axios.get(`${config.serverUrl}/groups`);
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
      const response = await axios.get(`${config.serverUrl}/groups/my_groups`);
      if (response.status === 200) {
        setMyGroups(response.data);
      }
    } catch (error) {
      console.error("Error fetching my groups:", error);
    }
  };

  const fetchInvitedGroups = async () => {
    try {
      const response = await axios.get(
        `${config.serverUrl}/groups/notifications`
      );
      const invitedGroupsList = response.data.invited_groups;
      setInvitedGroups(invitedGroupsList);
      console.log("Invited Groups:", invitedGroupsList);
    } catch (error) {
      console.error("Error fetching invited groups:", error);
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
    fetchInvitedGroups();
    getCurrentUser();
    getFriends();
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

  const handleGoToChallenges = async () => {
    navigate(`/challenges`);
  };

  const handleGoToOtherProfile = (id: number) => {
    navigate(`/otherProfile/${id}`);
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

  const getCurrentUser = async () => {
    try {
      const response = await axios.post(
        `${config.serverUrl}/profile/get_profile_pic/`
      );
      const data: User = response.data;
      setProfile_picture(data.profile_picture);
      console.log(profile_picture);
    } catch (error) {
      console.error("Error fetching user: ", error);
    }
  };

  const getFriends = async () => {
    try {
      const response = await axios.post(
        `${config.serverUrl}/friends/get_friends/`,
        {},
        { withCredentials: true }
      );
      const data: Friendship = response.data;
      console.log("data:");
      console.log(data);
      setFriends(data.friends);
      console.log("Friends", data.friends);
    } catch (error) {
      console.log("Error fetching friends: ", error);
    }
  };

  const filteredGroups = groups.filter(
    (group) =>
      group.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !myGroups.some((myGroup) => myGroup.id === group.id)
  );

  return (
    <div>
      <Header title="Community" />
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
          <Box mt={4} mb={2} textAlign="center">
            <Typography variant="h4" gutterBottom>
              Friends
            </Typography>
          </Box>
        </Container>

        <main role="main" style={{ paddingTop: "50px" }}>
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap", // Prevents overlapping on smaller screens
              justifyContent: "center",
              gap: 2, // Adds spacing between boxes
            }}
          >
            {friends.slice(0, 6).map((friend) => (
              <Box
                key={friend.id}
                sx={{
                  width: "100px",
                  minHeight: "100px",
                  border: "2px solid rgb(172, 169, 169)",
                  borderRadius: 2,
                  boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.1)",
                  transition: "all 0.3s ease",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  p: 1,
                  height: "100%",
                  "&:hover": {
                    borderColor: "#1976d2",
                    boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
                  },
                }}
                onClick={() => handleGoToOtherProfile(friend.id)}
              >
                {friend.profile_picture ? (
                  <Avatar
                    alt="Profile Picture"
                    src={`${config.serverUrl}/${friend.profile_picture}`}
                    sx={{ width: 70, height: 70, border: "1px solid #000" }}
                  />
                ) : (
                  <Avatar
                    sx={{ width: 70, height: 70, backgroundColor: "gray" }}
                  >
                    <PersonIcon sx={{ color: "white" }} />
                  </Avatar>
                )}
                <Typography variant="body2" mt={1}>
                  {friend.username}
                </Typography>
              </Box>
            ))}

            {/* Add Friend Button placed as the last item */}
            <Box
              sx={{
                width: "100px",
                minHeight: "100px",
                border: "2px solid rgb(172, 169, 169)",
                borderRadius: 2,
                boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.1)",
                transition: "all 0.3s ease",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                p: 1,
                height: "100%",
                "&:hover": {
                  borderColor: "#1976d2",
                  boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
                },
              }}
              onClick={() => navigate("/friends")}
            >
              <IconButton onClick={() => console.log("Add Friend clicked")}>
                <AddCircleIcon sx={{ fontSize: 60, color: "#1976d2" }} />
              </IconButton>
              <Typography variant="body1" sx={{ color: "#1976d2" }}>
                Add Friend
              </Typography>
            </Box>
          </Box>

          <Box mt={10} textAlign="center">
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate("/friends")}
            >
              View All Friends
            </Button>
          </Box>
        </main>

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
              <Grid2 container spacing={2} columns={12}>
                {myGroups.map((group) => (
                  <Grid2 item xs={12} sm={6} md={4} key={group.id}>
                    <Group {...group} />
                  </Grid2>
                ))}
              </Grid2>
            </Box>
          )}

          {invitedGroups.length > 0 && (
            <Box mt={4}>
              <Typography variant="h5" gutterBottom>
                Invited Groups
              </Typography>
              <Grid2 container spacing={2} columns={12}>
                {invitedGroups.map((group) => (
                  <Grid2 item xs={12} sm={6} md={4} key={group.id}>
                    <Group {...group} />
                  </Grid2>
                ))}
              </Grid2>
            </Box>
          )}

          <Box
            mt={{ xs: 10, sm: 14, md: 14 }}
            textAlign="center"
            display="flex"
            justifyContent="center"
            sx={{ flexGrow: 1 }}
          >
            <TextField
              label="Search for groups"
              variant="outlined"
              fullWidth
              value={searchQuery}
              onChange={handleSearchChange}
              sx={{
                width: "100%",
              }}
            />
          </Box>

          <Box mt={4}>
            <Typography variant="h5" gutterBottom>
              All Groups
            </Typography>
            <Grid2 container spacing={2} columns={12}>
              {filteredGroups.map((group) => (
                <Grid2 item xs={12} sm={6} md={4} key={group.id}>
                  <Group {...group} />
                </Grid2>
              ))}
            </Grid2>
          </Box>
          {loading && (
            <Box textAlign="center" mt={4}>
              <Typography variant="body2" color="textSecondary">
                Loading...
              </Typography>
            </Box>
          )}
        </Container>
        <Footer />
      </main>
    </div>
  );
};

export default Groups;

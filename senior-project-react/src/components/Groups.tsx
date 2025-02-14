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
import AddCircleIcon from "@mui/icons-material/AddCircle";

import Header from "./Header";

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

const Groups: React.FC = () => {
  const [groups, setGroups] = useState<UserGroup[]>([]);
  const [myGroups, setMyGroups] = useState<UserGroup[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [profile_picture, setProfile_picture] = useState<string>();
  const [friends, setFriends] = useState<[]>([]);
  const [searchLabel, setSearchLabel] = useState<string>("");

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
    setSearchQuery(event.target.value);
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

  const getFriends = async () => {
    try {
      const response = await axios.post(
        "http://127.0.0.1:5000/friends/get_friends/",
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
      <Header
        title="Community"
        searchLabel="Search for groups"
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
                    src={`http://127.0.0.1:5000/${friend.profile_picture}`}
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
            >
              <IconButton onClick={() => console.log("Add Friend clicked")}>
                <AddCircleIcon sx={{ fontSize: 60, color: "#1976d2" }} />
              </IconButton>
              <Typography variant="body1" sx={{ color: "#1976d2" }}>
                Add Friend
              </Typography>
            </Box>
          </Box>

          {friends.length > 6 && (
            <Box mt={10} textAlign="center">
              <Button
                variant="contained"
                color="primary"
                onClick={() => navigate("/friends")}
              >
                View All Friends
              </Button>
            </Box>
          )}
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
      </main>
    </div>
  );
};

export default Groups;

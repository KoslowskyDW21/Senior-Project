import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Typography,
  Box,
  Avatar,
  TextField,
  IconButton,
  useTheme,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import config from "../config.js";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import Header from "./Header";

interface Friendship {
  friends: [];
}

interface suggestedFriends {
  suggested_friends: [];
}

interface User {
  users: [];
}

interface FriendRequestTo {
  friend_requests_to: [];
}

interface FriendRequestFrom {
  friend_requests_from: [];
}

const Friends: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<[]>([]);
  const [friends, setFriends] = useState<[]>([]);
  const [suggestedFriends, setSuggestedFriends] = useState<[]>([]);
  const [friendRequestsTo, setFriendRequestsTo] = useState<[]>([]);
  const [friendRequestsFrom, setFriendRequestsFrom] = useState<[]>([]);
  const navigate = useNavigate();

  const handleSearchChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const query = event.target.value;
    setSearchQuery(query);

    if (query) {
      navigate({
        pathname: location.pathname,
        search: `?search=${query}`,
      });

      try {
        const response = await axios.post(
          `${config.serverUrl}/friends/search_for_friends/`,
          { search_query: query },
          {
            withCredentials: true,
            headers: { "Content-Type": "application/json" },
          }
        );
        const data: User = response.data;
        setSearchResults(data.users);
      } catch (error) {
        console.error("Error fetching search results:", error);
      }
    } else {
      navigate({
        pathname: location.pathname,
        search: "",
      });
      setSearchResults([]);
    }
  };

  //DEBUGGING
  useEffect(() => {
    console.log("searchResults updated useEffect:", searchResults);
    console.log(searchResults.length);
  }, [searchResults]);

  useEffect(() => {
    console.log("useEffect FriendRequestsFrom:", friendRequestsFrom);
  }, [friendRequestsFrom]);

  useEffect(() => {
    console.log("useEffect FriendRequestsTo:", friendRequestsTo);
  }, [friendRequestsTo]);

  useEffect(() => {
    console.log("useEffect suggestedFriends:", suggestedFriends);
  }, [suggestedFriends]);

  // end debugging

  const handleGoToOtherProfile = (id: number) => {
    navigate(`/otherProfile/${id}`);
  };

  const getFriends = async () => {
    try {
      const response = await axios.post(
        `${config.serverUrl}/friends/get_friends/`,
        {},
        { withCredentials: true }
      );
      const data: Friendship = response.data;
      setFriends(data.friends);
    } catch (error) {
      console.error("Error fetching friends: ", error);
    }
  };

  const getSuggestedFriends = async () => {
    try {
      const response = await axios.post(
        `${config.serverUrl}/friends/get_suggested_friends/`,
        {},
        { withCredentials: true }
      );
      const data: suggestedFriends = response.data;
      setSuggestedFriends(data.suggested_friends);
    } catch (error) {
      console.error("Error fetching friends: ", error);
    }
  };

  const getFriendRequestsTo = async () => {
    try {
      const response = await axios.post(
        `${config.serverUrl}/friends/get_requests_to/`,
        {},
        { withCredentials: true }
      );
      const data: FriendRequestTo = response.data;
      setFriendRequestsTo(data.friend_requests_to);
      console.log("Friend requet to", data.friend_requests_to);
    } catch (error) {
      console.error("Error fetching friend requests to: ", error);
    }
  };

  const getFriendRequestsFrom = async () => {
    try {
      const response = await axios.post(
        `${config.serverUrl}/friends/get_requests_from/`,
        {},
        { withCredentials: true }
      );
      const data: FriendRequestFrom = response.data;
      setFriendRequestsFrom(data.friend_requests_from);
    } catch (error) {
      console.error("Error fetching friend requests from: ", error);
    }
  };

  useEffect(() => {
    getFriends();
    getSuggestedFriends();
    getFriendRequestsTo();
    getFriendRequestsFrom();
  }, []);

  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";

  return (
    <div>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          paddingTop: "150px",
          backgroundColor: theme.palette.background.default,
        }}
      >
        <Header title="Friends" />
        <IconButton
          onClick={() => navigate("/groups")}
          style={{
            position: "fixed",
            top: "clamp(70px, 10vw, 120px)",
            left: "clamp(0px, 1vw, 100px)",
            zIndex: 1000,
          }}
        >
          <ArrowBackIcon sx={{ fontSize: 30, fontWeight: "bold" }} />
        </IconButton>

        <main role="main">
          <Box
            sx={{
              position: "relative",
              width: "50vw",
              margin: "auto",
            }}
          >
            <TextField
              label="Find new friends"
              variant="outlined"
              fullWidth
              value={searchQuery}
              onChange={handleSearchChange}
            />
            {searchResults.length > 0 && (
              <Box
                sx={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  width: "100%",
                  boxShadow: isDarkMode
                    ? "0px 2px 5px rgba(255, 255, 255, 0.1)"
                    : "0px 2px 5px rgba(0, 0, 0, 0.1)",
                  borderRadius: "4px",
                  maxHeight: "300px",
                  overflowY: "auto",
                  zIndex: 1001,
                }}
              >
                {searchResults.map((user) => (
                  <Box
                    key={user.id}
                    sx={{
                      padding: "10px",
                      display: "flex",
                      alignItems: "center",
                      cursor: "pointer",
                      "&:hover": {
                      },
                    }}
                    onClick={() => navigate(`/OtherProfile/${user.id}`)}
                  >
                    {user.profile_picture ? (
                      <Avatar
                        alt="Profile Picture"
                        src={`${config.serverUrl}/${user.profile_picture}`}
                        sx={{ width: 40, height: 40, marginRight: "10px" }}
                      />
                    ) : (
                      <Avatar
                        sx={{
                          width: 40,
                          height: 40,
                          marginRight: "10px",
                          backgroundColor: "gray",
                        }}
                      >
                        <PersonIcon sx={{ color: "white" }} />
                      </Avatar>
                    )}
                    <Typography>{user.username}</Typography>
                  </Box>
                ))}
              </Box>
            )}
          </Box>

          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "flex-start",
              gap: 2,
            }}
          >
            {friends.map((friend) => (
              <Box
                key={friend.id}
                mt={10}
                sx={{
                  width: "125px",
                  minHeight: "100px",
                  border: "2px solid rgb(172, 169, 169)",
                  borderRadius: 2,
                  boxShadow: isDarkMode
                    ? "0px 2px 5px rgba(255, 255, 255, 0.1)"
                    : "0px 2px 5px rgba(0, 0, 0, 0.1)",
                  transition: "all 0.3s ease",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  p: 1,
                  height: "100%",
                  "&:hover": {
                    borderColor: "#1976d2",
                    boxShadow: isDarkMode
                      ? "0px 2px 5px rgba(255, 255, 255, 0.1)"
                      : "0px 2px 5px rgba(0, 0, 0, 0.1)",
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
          </Box>
          <Box>
            <Typography variant="h4" mt={7} sx={{ fontWeight: "bold" }}>
              Friend Requests
            </Typography>
            <Typography
              variant="h5"
              mt={5}
              sx={{ textAlign: "left", fontWeight: "bold" }}
            >
              To you:
            </Typography>
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "flex-start",
                gap: 2,
              }}
            >
              {friendRequestsFrom.map((friend) => (
                <Box
                  key={friend.id}
                  mt={5}
                  sx={{
                    width: "125px",
                    minHeight: "100px",
                    border: "2px solid rgb(172, 169, 169)",
                    borderRadius: 2,
                    boxShadow: isDarkMode
                      ? "0px 2px 5px rgba(255, 255, 255, 0.1)"
                      : "0px 2px 5px rgba(0, 0, 0, 0.1)",
                    transition: "all 0.3s ease",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    p: 1,
                    height: "100%",
                    "&:hover": {
                      borderColor: "#1976d2",
                      boxShadow: isDarkMode
                        ? "0px 2px 5px rgba(255, 255, 255, 0.1)"
                        : "0px 2px 5px rgba(0, 0, 0, 0.1)",
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
            </Box>
            <Typography
              variant="h5"
              mt={5}
              sx={{ textAlign: "left", fontWeight: "bold" }}
            >
              From you:
            </Typography>
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "flex-start",
                gap: 2,
              }}
            >
              {friendRequestsTo.map((friend) => (
                <Box
                  key={friend.id}
                  mt={5}
                  sx={{
                    width: "125px",
                    minHeight: "100px",
                    border: "2px solid rgb(172, 169, 169)",
                    borderRadius: 2,
                    boxShadow: isDarkMode
                      ? "0px 2px 5px rgba(255, 255, 255, 0.1)"
                      : "0px 2px 5px rgba(0, 0, 0, 0.1)",
                    transition: "all 0.3s ease",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    p: 1,
                    height: "100%",
                    "&:hover": {
                      borderColor: "#1976d2",
                      boxShadow: isDarkMode
                        ? "0px 2px 5px rgba(255, 255, 255, 0.1)"
                        : "0px 2px 5px rgba(0, 0, 0, 0.1)",
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
            </Box>
          </Box>
          {suggestedFriends.length > 0 && (
            <Box>
              <Typography variant="h4" mt={7} sx={{ fontWeight: "bold"}}>
                Suggested Friends
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  justifyContent: "flex-start",
                  gap: 2,
                  mt: 1,
                  mb: 3,
                }}
              >
                {suggestedFriends.map((friend) => (
                  <Box
                    key={friend.id}
                    mt={5}
                    sx={{
                      width: "125px",
                      minHeight: "100px",
                      border: "2px solid rgb(172, 169, 169)",
                      borderRadius: 2,
                      boxShadow: isDarkMode
                        ? "0px 2px 5px rgba(255, 255, 255, 0.1)"
                        : "0px 2px 5px rgba(0, 0, 0, 0.1)",
                      transition: "all 0.3s ease",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      p: 1,
                      height: "100%",
                      "&:hover": {
                        borderColor: "#1976d2",
                        boxShadow: isDarkMode
                          ? "0px 2px 5px rgba(255, 255, 255, 0.1)"
                          : "0px 2px 5px rgba(0, 0, 0, 0.1)",
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
              </Box>
            </Box>
          )}
        </main>
      </Box>
    </div>
  );
};

export default Friends;

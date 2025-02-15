import React, { useState, useEffect } from "react";
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

import Header from "./Header";

interface Friendship {
  friends: [];
}

interface User {
  users: [];
}

const Friends: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<[]>([]);
  const [friends, setFriends] = useState<[]>([]);
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
          "http://127.0.0.1:5000/friends/search_for_friends/",
          { search_query: query },
          {
            withCredentials: true,
            headers: { "Content-Type": "application/json" },
          }
        );
        const data: User = response.data;
        console.log("user data:");
        console.log(data);
        setSearchResults(data.users);
        console.log("Search results:", data.users);
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

  useEffect(() => {
    console.log("searchResults updated useEffect:", searchResults);
    console.log(searchResults.length);
  }, [searchResults]);

  const handleGoToOtherProfile = (id: number) => {
    navigate(`/otherProfile/${id}`);
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

  useEffect(() => {
    getFriends();
  }, []);

  return (
    <div>
      <Header
        title="Friends"
        searchLabel="Find new friends"
        searchVisible={false}
      />

      <main role="main">
        <Box
          mt={20}
          mb={0}
          textAlign="center"
          display="flex"
          justifyContent="center"
          sx={{ flexGrow: 1 }}
        >
          <TextField
            label="Find new friends"
            variant="outlined"
            fullWidth
            value={searchQuery}
            onChange={handleSearchChange}
            sx={{ zIndex: 1 }}
          />
        </Box>

        {/* Search Results Container */}
        {searchResults.length > 0 && (
          <Box
            sx={{
              position: "relative",
              top: "0",
              margin: "0px",
              backgroundColor: "white",
              boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
              borderRadius: "4px",
              maxHeight: "300px",
              overflowY: "auto",
              zIndex: 10,
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
                  "&:hover": { backgroundColor: "#f5f5f5" },
                }}
                onClick={() => navigate(`/OtherProfile/${user.id}`)}
              >
                {user.profile_picture ? (
                  <Avatar
                    alt="Profile Picture"
                    src={`http://127.0.0.1:5000/${user.profile_picture}`}
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

        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: 2,
          }}
        >
          {friends.map((friend) => (
            <Box
              key={friend.id}
              mt={10}
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
                <Avatar sx={{ width: 70, height: 70, backgroundColor: "gray" }}>
                  <PersonIcon sx={{ color: "white" }} />
                </Avatar>
              )}
              <Typography variant="body2" mt={1}>
                {friend.username}
              </Typography>
            </Box>
          ))}
        </Box>
      </main>
    </div>
  );
};

export default Friends;

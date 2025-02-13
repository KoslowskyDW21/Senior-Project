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

interface Friendship {
  friends: [];
}

const Friends: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [friends, setFriends] = useState<[]>([]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
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
      <Header title="Friends" searchLabel="Find new friends" />
      <main role="main" style={{ paddingTop: "90px" }}>
        <Container>
          <Box mt={4} mb={2} textAlign="center">
            <Typography variant="h4" gutterBottom>
              Friends
            </Typography>
          </Box>
        </Container>

        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap", // Prevents overlapping on smaller screens
            justifyContent: "center",
            gap: 2, // Adds spacing between boxes
          }}
        >
          {friends.map((friend) => (
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

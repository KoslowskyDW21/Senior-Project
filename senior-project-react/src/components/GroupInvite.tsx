import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  Checkbox,
  Button,
  IconButton,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

interface Friend {
  id: number;
  username: string;
}

const GroupInvite: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [selectedFriends, setSelectedFriends] = useState<number[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const response = await axios.post("http://127.0.0.1:5000/friends/get_friends/");
        setFriends(response.data.friends);
      } catch (error) {
        console.error("Error fetching friends:", error);
      }
    };

    fetchFriends();
  }, []);

  const handleToggleFriend = (friendId: number) => {
    setSelectedFriends((prevSelected) =>
      prevSelected.includes(friendId)
        ? prevSelected.filter((id) => id !== friendId)
        : [...prevSelected, friendId]
    );
  };

  const handleInviteFriends = async () => {
    try {
      await axios.post(`http://127.0.0.1:5000/groups/${id}/invite`, { friend_ids: selectedFriends });
      navigate(`/groups/${id}`);
    } catch (error) {
      console.error("Error inviting friends:", error);
    }
  };

  return (
    <Container>
      <IconButton
        onClick={() => navigate(-1)}
        style={{ position: "absolute", top: 30, left: 30 }}
      >
        <ArrowBackIcon sx={{ fontSize: 30, fontWeight: "bold" }} />
      </IconButton>
      <Box mt={4} mb={2} textAlign="center">
        <Typography variant="h4" gutterBottom>
          Invite Friends
        </Typography>
      </Box>
      <List>
        {friends.map((friend) => (
          <ListItem key={friend.id} onClick={() => handleToggleFriend(friend.id)}>
            <Checkbox
              checked={selectedFriends.includes(friend.id)}
              tabIndex={-1}
              disableRipple
            />
            <ListItemText primary={friend.username} />
          </ListItem>
        ))}
      </List>
      <Button
        variant="contained"
        color="primary"
        onClick={handleInviteFriends}
      >
        Send Invites
      </Button>
    </Container>
  );
};

export default GroupInvite;
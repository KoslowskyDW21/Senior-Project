import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Container,
  IconButton,
  Button,
  TextField,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider
} from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from "react-router-dom";

interface UserGroup {
  id: number;
  name: string;
  creator: number;
  image: string;
  description: string;
  is_public: boolean;
}

interface Message {
  id: number;
  user_id: number;
  text: string;
  username: string;
}

const GroupDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [group, setGroup] = useState<UserGroup | null>(null);
  const [isMember, setIsMember] = useState<boolean>(false);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState<string>("");
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const fetchGroup = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:5000/groups/${id}`);
        if (response.status === 200) {
          setGroup(response.data);
        }
      } catch (error) {
        console.error("Error fetching group details:", error);
      }
    };

    const checkMembership = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:5000/groups/${id}/is_member`);
        setIsMember(response.data.is_member);
      } catch (error) {
        console.error("Error checking membership:", error);
      }
    };

    const fetchMembers = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:5000/groups/${id}/members`);
        setMembers(response.data);
      } catch (error) {
        console.error("Error fetching group members:", error);
      }
    };

    const fetchMessages = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:5000/groups/${id}/messages`);
        setMessages(response.data);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchGroup();
    checkMembership();
    fetchMembers();
    fetchMessages();
  }, [id]);

  const handleJoinGroup = async () => {
    try {
      await axios.post(`http://127.0.0.1:5000/groups/${id}/join`);
      setIsMember(true);
      fetchMembers();
    } catch (error) {
      console.error("Error joining group:", error);
    }
  };

  const handleLeaveGroup = async () => {
    try {
      await axios.post(`http://127.0.0.1:5000/groups/${id}/leave`);
      setIsMember(false);
      fetchMembers();
    } catch (error) {
      console.error("Error leaving group:", error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      await axios.post(`http://127.0.0.1:5000/groups/${id}/messages`, { text: newMessage });
      setNewMessage("");
      const response = await axios.get(`http://127.0.0.1:5000/groups/${id}/messages`);
      setMessages(response.data);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  if (!group) {
    return (
      <Container>
        <Typography variant="h5" textAlign="center" mt={4}>
          Loading...
        </Typography>
      </Container>
    );
  }

  return (
    <Container>
      <IconButton
        onClick={() => navigate(-1)}
        style={{ position: "absolute", top: 30, left: 30 }} 
      >
        <ArrowBackIcon sx={{ fontSize: 30, fontWeight: 'bold' }} />
      </IconButton>
      <Box mt={4} mb={2} textAlign="center">
        <Typography variant="h4" gutterBottom>
          {group.name}
        </Typography>
      </Box>
      <Card>
        {group.image && (
          <CardMedia
            component="img"
            height="400"
            image={`http://127.0.0.1:5000/${group.image}`}
            alt={group.name}
          />
        )}
        <CardContent>
          <Typography variant="h6" component="div" gutterBottom>
            Description
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {group.description}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {group.is_public ? "Public" : "Private"}
          </Typography>
          <Box textAlign="center" mt={4}>
            {isMember ? (
              <Button
                variant="contained"
                color="secondary"
                onClick={handleLeaveGroup}
              >
                Leave Group
              </Button>
            ) : (
              <Button
                variant="contained"
                color="primary"
                onClick={handleJoinGroup}
              >
                Join Group
              </Button>
            )}
          </Box>
          <Box mt={4}>
            <Typography variant="h5" gutterBottom>
              Members
            </Typography>
            <ul>
              {members.map((member) => (
                <li key={member.user_id}>{member.username}</li>
              ))}
            </ul>
          </Box>
        </CardContent>
      </Card>

      <Box mt={4} mb={2}>
        <Typography variant="h5" gutterBottom>
          Messages
        </Typography>
        <Paper style={{ maxHeight: 300, overflow: 'auto' }}>
          <List>
            {messages.map((message) => (
              <ListItem key={message.id} alignItems="flex-start">
                <ListItemText
                  primary={message.username}
                  secondary={message.text}
                />
                <Divider variant="inset" component="li" />
              </ListItem>
            ))}
            <div ref={messagesEndRef} />
          </List>
        </Paper>
        <Box mt={2} display="flex">
          <TextField
            label="Type a message"
            variant="outlined"
            fullWidth
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={sendMessage}
            style={{ marginLeft: '10px' }}
          >
            Send
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default GroupDetails;
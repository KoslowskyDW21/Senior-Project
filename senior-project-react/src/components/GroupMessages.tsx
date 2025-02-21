import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import {
  Container,
  Typography,
  Box,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  TextField,
  Button,
  IconButton,
} from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from "react-router-dom";

interface Message {
  id: number;
  user_id: number;
  text: string;
  username: string;
}

const GroupMessages: React.FC = () => {
  const { id } = useParams<{ id: string }>();
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
    const fetchMessages = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:5000/groups/${id}/messages`);
        setMessages(response.data);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();
  }, [id]);

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
          Group Messages
        </Typography>
      </Box>
      <Box mt={4} mb={2}>
      <Paper style={{ maxHeight: 300, overflow: 'auto' }}>
        <List>
          {messages.map((message) => (
            <React.Fragment key={message.id}>
              <ListItem alignItems="flex-start">
                <ListItemText
                  primary={message.username}
                  secondary={message.text}
                />
              </ListItem>
              <Divider variant="inset" component="li" />
            </React.Fragment>
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

export default GroupMessages;
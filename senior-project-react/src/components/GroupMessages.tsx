import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Theme, useTheme } from "@mui/material/styles";
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
  Modal,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
  MenuItem,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CloseIcon from "@mui/icons-material/Close";
import { useNavigate } from "react-router-dom";
import config from "../config.js";
import ConfirmationMessage from "./ConfirmationMessage.js";
import { ConfirmationProvider, useConfirmation } from "./ConfirmationHelper.js";

const reportModalStyle = (theme: Theme) => ({
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  bgcolor: theme.palette.background.default,
  boxShadow: 24,
  paddingTop: 3,
  paddingLeft: 7,
  paddingRight: 7,
  paddingBottom: 3,
  textAlign: "center",
});

interface Message {
  id: number;
  user_id: number;
  text: string;
  username: string;
  num_reports: number;
}

const GroupMessages: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState<string>("");
  const [messageId, setMessageId] = useState<number>(-1);
  const [open, setOpen] = useState<boolean>(false);
  const [reason, setReason] = useState<string>("N/A");
  const [confirmation, setConfirmation] = useState<string>("");
  const handleOpenModal = () => setOpen(true);
  const handleCloseModal = () => setOpen(false);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const navigate = useNavigate();
  const theme = useTheme();

  function ButtonWithConfirmation({ color, handler, text }: any) {
        const {open, toggleOpen} = useConfirmation();
      
        return (
          <Button
            variant="contained"
            color={color}
            onClick={() => {
              handler();
              toggleOpen();
            }}
          >
            {text}
          </Button>
        )
      }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await axios.get(
          `${config.serverUrl}/groups/${id}/messages/`
        );
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
      await axios.post(`${config.serverUrl}/groups/${id}/messages/`, {
        text: newMessage,
      });
      setNewMessage("");
      const response = await axios.get(
        `${config.serverUrl}/groups/${id}/messages/`
      );
      setMessages(response.data);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleReportMessage = async () => {
    let data;

    await axios
      .get(`${config.serverUrl}/groups/${messageId}/reportMessage/`)
      .then((response) => {
        data = response.data;
      })
      .catch((error) => {
        console.error("Could not get if already reported", error);
      });

    if (!data!.alreadyReported) {
      const newData = {
        user_id: data!.id,
        message_id: messageId,
        reason: reason,
      };

      await axios
        .post(
          `${config.serverUrl}/groups/${messageId}/reportMessage/`,
          newData,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        )
        .then((response) => {
          setConfirmation("Message successfully reported")
          console.log(response.data.messsage);
        })
        .catch((error) => {
          console.error("Could not report message", error);
        });
    } else {
      setConfirmation("Message already reported")
      console.log("Message already reported");
    }
  };

  return (
    <ConfirmationProvider>
      <Container>
        <IconButton
          onClick={() => navigate(-1)}
          style={{ position: "absolute", top: 30, left: 30 }}
        >
          <ArrowBackIcon sx={{ fontSize: 30, fontWeight: "bold" }} />
        </IconButton>
        <Box mt={4} mb={2} textAlign="center">
          <Typography variant="h4" gutterBottom>
            Group Messages
          </Typography>
        </Box>
        <Box mt={4} mb={2}>
          <Paper style={{ maxHeight: 300, overflow: "auto" }}>
            <List>
              {messages.map((message) => (
                <React.Fragment key={message.id}>
                  <ListItem alignItems="flex-start">
                    <ListItemText
                      primary={message.username}
                      secondary={message.text}
                    />
                    {message.num_reports !== -1 ? (
                      <Button
                        variant="contained"
                        color="error"
                        onClick={() => {
                          setMessageId(message.id);
                          handleOpenModal();
                        }}
                      >
                        Report
                      </Button>
                    ) : (
                      <></>
                    )}
                  </ListItem>
                  <Divider variant="inset" component="li" />
                </React.Fragment>
              ))}
              <div ref={messagesEndRef} />
            </List>
          </Paper>

          <Modal
            open={open}
            onClose={handleCloseModal}
            aria-labelledby="modal-title"
          >
            <Box sx={reportModalStyle(theme)}>
              <IconButton
                onClick={handleCloseModal}
                style={{ position: "absolute", top: 5, right: 5 }}
              >
                <CloseIcon sx={{ fontSize: 30, fontWeight: "bold" }} />
              </IconButton>

              <Typography id="modal-title" variant="h4" component="h2">
                Report Message
              </Typography>

              <FormControl
                variant="filled"
                sx={{ m: 1, width: 250 }}
                size="small"
              >
                <InputLabel id="reason-label">Reason</InputLabel>
                <Select
                  labelId="reason-label"
                  onChange={(event: SelectChangeEvent) => {
                    setReason(event.target.value);
                  }}
                >
                  <MenuItem value="Sexual Content">Sexual Content</MenuItem>
                  <MenuItem value="Violent Content">Violent Content</MenuItem>
                  <MenuItem value="Hateful Content">Hateful Content</MenuItem>
                  <MenuItem value="Harrassment or Bullying">Harrassment or Bullying</MenuItem>
                  <MenuItem value="Spam">Spam</MenuItem>
                  <MenuItem value="Irrelevant">Irrelevant</MenuItem>
                </Select>
              </FormControl>
              <br />
              <ButtonWithConfirmation
                color="error"
                handler={() => {
                  handleReportMessage();
                  handleCloseModal();
                }}
                text="Confirm Report"
              />
            </Box>
          </Modal>

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
              style={{ marginLeft: "10px" }}
            >
              Send
            </Button>
          </Box>
        </Box>

        <ConfirmationMessage message={confirmation} />
      </Container>
    </ConfirmationProvider>
  );
};

export default GroupMessages;

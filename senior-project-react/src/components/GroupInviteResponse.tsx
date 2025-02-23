import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Typography, Box, Button } from "@mui/material";
import config from "../config.js";

const GroupInviteResponse: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [group, setGroup] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGroup = async () => {
      try {
        const response = await axios.get(`${config.serverUrl}/groups/${id}`);
        setGroup(response.data);
      } catch (error) {
        console.error("Error fetching group details:", error);
      }
    };

    fetchGroup();
  }, [id]);

  const handleResponse = async (response: string) => {
    try {
      await axios.post(`${config.serverUrl}/groups/${id}/invite_response`, {
        response,
      });
      navigate(`/groups/${id}`);
    } catch (error) {
      console.error(`Error sending ${response} response:`, error);
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
      <Box mt={4} mb={2} textAlign="center">
        <Typography variant="h4" gutterBottom>
          Group Invitation
        </Typography>
        <Typography variant="h6" gutterBottom>
          You have been invited to join the group {group.name}.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleResponse("accept")}
          sx={{ mr: 2 }}
        >
          Accept
        </Button>
        <Button
          variant="contained"
          color="secondary"
          onClick={() => handleResponse("deny")}
        >
          Deny
        </Button>
      </Box>
    </Container>
  );
};

export default GroupInviteResponse;

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Container,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  Card,
  CardContent,
  IconButton,
  Divider,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import config from "../config.js";

interface Participant {
  user_id: number;
  username: string;
  points: number;
}

const ChallengeResults: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchVoteResults = async () => {
      try {
        const response = await axios.get(
          `${config.serverUrl}/challenges/${id}/vote_results/`
        );
        setParticipants(response.data);
      } catch (error) {
        console.error("Error fetching vote results:", error);
        navigate(-1);
      }
    };

    fetchVoteResults();
  }, [id]);

  return (
    <Container>
      <Box mt={4} display="flex" justifyContent="center">
        <IconButton
          onClick={() => navigate(`/challenges/${id}`)}
          style={{
            position: "fixed",
            top: "clamp(70px, 10vw, 120px)",
            left: "clamp(0px, 1vw, 100px)",
            zIndex: 1000,
          }}
        >
          <ArrowBackIcon sx={{ fontSize: 30, fontWeight: "bold" }} />
        </IconButton>
        <Card sx={{ maxWidth: 600, width: "100%", boxShadow: 3 }}>
          <CardContent>
            <Typography variant="h4" gutterBottom textAlign="center">
              Challenge Vote Results
            </Typography>
            <Typography
              variant="body1"
              textAlign="center"
              color="textSecondary"
              mb={2}
            >
              Here are the results of the challenge voting:
            </Typography>
            <List>
              {participants.map((participant, index) => (
                <React.Fragment key={participant.user_id}>
                  <ListItem>
                    <ListItemText
                      primary={
                        <Typography
                          variant="h6"
                          color={index === 0 ? "primary" : "textPrimary"}
                        >
                          {`${index + 1}. ${participant.username}`}
                        </Typography>
                      }
                      secondary={`Points: ${participant.points}`}
                    />
                  </ListItem>
                  {index < participants.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default ChallengeResults;
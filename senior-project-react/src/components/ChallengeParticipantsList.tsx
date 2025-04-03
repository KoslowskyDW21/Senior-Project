import React from "react";
import {
  List,
  ListItem,
  ListItemText,
  Avatar,
  Box,
  Button,
  Typography,
} from "@mui/material";
import axios from "axios";
import config from "../config.js";

interface User {
  id: number;
  fname: string;
  lname: string;
  email_address: string;
  username: string;
  profile_picture: string;
  xp_points: number;
  user_level: number;
  is_admin: boolean;
  num_recipes_completed: number;
  colonial_floor: string;
  colonial_side: string;
  date_created: Date;
  last_logged_in: Date;
  num_reports: number;
}

interface ChallengeParticipantsListProps {
  participants: User[];
  isCreator: boolean;
  challengeId: number;
  creatorId: number;
}

const ChallengeParticipantsList: React.FC<ChallengeParticipantsListProps> = ({
  participants,
  isCreator,
  challengeId,
  creatorId,
}) => {
  const getProfilePictureUrl = (profilePicture: string | null) => {
    return profilePicture ? `${config.serverUrl}/${profilePicture}` : "";
  };

  const handleKickUser = async (userId: number) => {
    try {
      console.log("User ID: ", userId)
      await axios.post(`${config.serverUrl}/challenges/${challengeId}/kick/${userId}/`);
      alert("User kicked successfully!");
    } catch (error) {
      console.error("Error kicking user:", error);
      alert("Failed to kick user.");
    }
    window.location.reload();
  };

  return (
    <Box
      sx={{
        maxHeight: 300,
        overflowY: "auto",
        border: "1px solid #ccc",
        borderRadius: 2,
        padding: 2,
      }}
    >
      <List>
        {participants.map((participant) => (
          <ListItem 
            key={`participant-${participant.username}`}
            sx={{ display: "flex", alignItems: "center" }}
          >
            <Avatar
              src={getProfilePictureUrl(participant.profile_picture)}
              alt={participant.username}
              sx={{ marginRight: 2 }}
            />
            <ListItemText
              primary={
                <Typography
                  sx={{
                    color: participant.id === creatorId ? "blue" : "black",
                  }}
                >
                  {participant.username}
                  {participant.id === creatorId && (
                    <Typography
                      component="span"
                      sx={{ color: "blue", marginLeft: 1 }}
                    >
                      (Creator)
                    </Typography>
                  )}
                </Typography>
              }
            />
            {isCreator && (participant.id !== creatorId) && (
              <Button
                variant="contained"
                color="secondary"
                onClick={() => handleKickUser(participant.id)}
              >
                Kick User
              </Button>
            )}
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default ChallengeParticipantsList;

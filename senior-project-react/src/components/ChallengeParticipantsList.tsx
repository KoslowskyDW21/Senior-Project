import React from "react";
import { List, ListItem, ListItemText, Avatar, Box, Button, Typography} from "@mui/material";
import axios from "axios";

interface User {
  id: number;
  username: string;
  profile_picture: string | null;
}

interface ChallengeParticipantsListProps {
  participants: User[];
  isCreator: boolean;
  challengeId: number;
  creatorId: number;
}

const ChallengeParticipantsList: React.FC<ChallengeParticipantsListProps> = ({ participants, isCreator, challengeId, creatorId }) => {
  const getProfilePictureUrl = (profilePicture: string | null) => {
    return profilePicture ? `http://127.0.0.1:5000/${profilePicture}` : "";
  };

  const handleKickUser = async (userId: number) => {
    try {
      await axios.post(`http://127.0.0.1:5000/challenges/${challengeId}/kick`, { user_id: userId });
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
          <ListItem key={participant.id} sx={{ display: "flex", alignItems: "center" }}>
            <Avatar
              src={getProfilePictureUrl(participant.profile_picture)}
              alt={participant.username}
              sx={{ marginRight: 2 }}
            />
            <ListItemText
              primary={
                <Typography
                  sx={{
                    color:
                      participant.id === creatorId
                        ? "blue"
                        : "black",
                  }}
                >
                  {participant.username}
                  {participant.id === creatorId && (
                    <Typography component="span" sx={{ color: "blue", marginLeft: 1 }}>
                      (Creator)
                    </Typography>
                  )}
                </Typography>
              }
            />
            {isCreator && participant.id !== creatorId && (
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
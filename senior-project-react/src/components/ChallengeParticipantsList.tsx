import React from "react";
import { List, ListItem, ListItemText, Avatar, Box } from "@mui/material";

interface User {
  id: number;
  username: string;
  profile_picture: string | null;
}

interface ChallengeParticipantsListProps {
  participants: User[];
}

const ChallengeParticipantsList: React.FC<ChallengeParticipantsListProps> = ({ participants }) => {
  const getProfilePictureUrl = (profilePicture: string | null) => {
    return profilePicture ? `http://127.0.0.1:5000/${profilePicture}` : "";
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
            <ListItemText primary={participant.username} />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default ChallengeParticipantsList;
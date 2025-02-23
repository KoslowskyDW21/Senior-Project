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

interface GroupMember {
  user_id: number;
  username: string;
  profile_picture: string | null;
}

interface GroupMembersListProps {
  members: GroupMember[];
  currentUserId: number;
  groupCreatorId: number;
  trustedMemberIds: number[];
  groupId: number;
  fetchMembers: () => void;
}

const GroupMembersList: React.FC<GroupMembersListProps> = ({
  members,
  currentUserId,
  groupCreatorId,
  trustedMemberIds,
  groupId,
  fetchMembers,
}) => {
  const handleSetTrusted = async (userId: number) => {
    try {
      await axios.post(`${config.serverUrl}/groups/${groupId}/set_trusted`, {
        user_id: userId,
      });
      fetchMembers();
    } catch (error) {
      console.error("Error setting trusted member:", error);
    }
  };

  const handleRevokeTrusted = async (userId: number) => {
    try {
      await axios.post(`${config.serverUrl}/groups/${groupId}/revoke_trusted`, {
        user_id: userId,
      });
      fetchMembers();
    } catch (error) {
      console.error("Error revoking trusted member:", error);
    }
  };

  const handleKickUser = async (userId: number) => {
    try {
      await axios.post(`${config.serverUrl}/groups/${groupId}/kick`, {
        user_id: userId,
      });
      alert("User kicked successfully!");
      fetchMembers();
    } catch (error) {
      console.error("Error kicking user:", error);
      alert("Failed to kick user.");
    }
  };

  const isTrustedOrCreator = (userId: number) => {
    return userId === groupCreatorId || trustedMemberIds.includes(userId);
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
        {members.map((member) => (
          <ListItem
            key={member.user_id}
            sx={{ display: "flex", alignItems: "center" }}
          >
            <Avatar
              src={member.profile_picture || ""}
              alt={member.username}
              sx={{ marginRight: 2 }}
            />
            <ListItemText
              primary={
                <Typography
                  sx={{
                    color:
                      member.user_id === groupCreatorId
                        ? "blue"
                        : trustedMemberIds.includes(member.user_id)
                        ? "green"
                        : "black",
                  }}
                >
                  {member.username}
                  {member.user_id === groupCreatorId && (
                    <Typography
                      component="span"
                      sx={{ color: "blue", marginLeft: 1 }}
                    >
                      (Creator)
                    </Typography>
                  )}
                  {trustedMemberIds.includes(member.user_id) &&
                    member.user_id !== groupCreatorId && (
                      <Typography
                        component="span"
                        sx={{ color: "green", marginLeft: 1 }}
                      >
                        (Trusted)
                      </Typography>
                    )}
                </Typography>
              }
            />
            {isTrustedOrCreator(currentUserId) &&
              member.user_id !== groupCreatorId && (
                <>
                  {trustedMemberIds.includes(member.user_id) ? (
                    <Button
                      variant="contained"
                      color="secondary"
                      onClick={() => handleRevokeTrusted(member.user_id)}
                    >
                      Revoke Trusted
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleSetTrusted(member.user_id)}
                    >
                      Set Trusted
                    </Button>
                  )}
                  {currentUserId === groupCreatorId ||
                  !trustedMemberIds.includes(member.user_id) ? (
                    <Button
                      variant="contained"
                      color="error"
                      onClick={() => handleKickUser(member.user_id)}
                      sx={{ marginLeft: 1 }}
                    >
                      Kick User
                    </Button>
                  ) : null}
                </>
              )}
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default GroupMembersList;

import React from "react";
import { List, ListItem, ListItemText, Avatar, Box } from "@mui/material";

interface GroupMember {
  user_id: number;
  username: string;
  profile_picture: string | null;
}

interface GroupMembersListProps {
  members: GroupMember[];
}

const GroupMembersList: React.FC<GroupMembersListProps> = ({ members }) => {
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
          <ListItem key={member.user_id}>
            <Avatar
              src={member.profile_picture || ""}
              alt={member.username}
              sx={{ marginRight: 2 }}
            />
            <ListItemText primary={member.username} />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default GroupMembersList;
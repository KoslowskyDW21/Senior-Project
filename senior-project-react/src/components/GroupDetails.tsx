import React, { useState, useEffect } from "react";
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
  Modal,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  Checkbox,
} from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloseIcon from "@mui/icons-material/Close";
import { useNavigate } from "react-router-dom";
import GroupMembersList from "./GroupMembersList"; // Import the new component

interface UserGroup {
  id: number;
  name: string;
  creator: number;
  image: string;
  description: string;
  is_public: boolean;
}

interface GroupMember {
  user_id: number;
  username: string;
  profile_picture: string | null;
  is_trusted: boolean;
}

interface Friend {
  id: number;
  username: string;
}

const reportModalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  bgcolor: "#ffffff",
  boxShadow: 24,
  paddingTop: 3,
  paddingLeft: 7,
  paddingRight: 7,
  paddingBottom: 3,
  textAlign: "center",
}

const GroupDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [group, setGroup] = useState<UserGroup | null>(null);
  const [isMember, setIsMember] = useState<boolean>(false);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [isTrusted, setIsTrusted] = useState<boolean>(false);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [selectedFriends, setSelectedFriends] = useState<number[]>([]);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);

  // States for report modal
  const [open, setOpen] = useState(false);
  const handleOpenModal = () => setOpen(true);
  const handleCloseModal = () => setOpen(false);

  const navigate = useNavigate();

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
      setIsTrusted(response.data.is_trusted);
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

  const fetchCurrentUser = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:5000/current_user");
      setCurrentUserId(response.data.id);
    } catch (error) {
      console.error("Error fetching current user:", error);
    }
  };

  const fetchFriends = async () => {
    try {
      const response = await axios.post("http://127.0.0.1:5000/friends/get_friends/");
      setFriends(response.data.friends);
    } catch (error) {
      console.error("Error fetching friends:", error);
    }
  };

  useEffect(() => {
    fetchGroup();
    checkMembership();
    fetchMembers();
    fetchCurrentUser();
    fetchFriends();
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

  const handleDeleteGroup = async () => {
    try {
      await axios.delete(`http://127.0.0.1:5000/groups/${id}/delete`);
      navigate("/groups");
    } catch (error) {
      console.error("Error deleting group:", error);
    }
  };

  const handleReportGroup = async () => {
    console.log("Attempting to report this group...");
    let data;

    await axios.get(`http://127.0.0.1:5000/groups/${id}/report`)
      .then((response) => {
        data = response.data;
      })
      .catch((error) => {
        console.error("Could not get if already reported", error);
      });
    
    if(!data!.alreadyReported) {
      const newData = {
        user_id: data!.id,
        group_id: id,
      }
  
      await axios.post(`http://127.0.0.1:5000/groups/${id}/report`, newData, {
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => {
          console.log("Group successfully reported.");
          console.log(response.data.message);
        })
        .catch((error) => {
          console.log("Could not report group", error);
        });
    }
    else {
      console.log("Group already reported");
    }
  }

  const handleSetTrusted = async (userId: number) => {
    try {
      await axios.post(`http://127.0.0.1:5000/groups/${id}/set_trusted`, { user_id: userId });
      fetchMembers();
    } catch (error) {
      console.error("Error setting trusted member:", error);
    }
  };

  const handleRevokeTrusted = async (userId: number) => {
    try {
      await axios.post(`http://127.0.0.1:5000/groups/${id}/revoke_trusted`, { user_id: userId });
      fetchMembers();
    } catch (error) {
      console.error("Error revoking trusted member:", error);
    }
  };

  const handleInviteFriends = async () => {
    try {
      await axios.post(`http://127.0.0.1:5000/groups/${id}/invite`, { friend_ids: selectedFriends });
      setInviteModalOpen(false);
    } catch (error) {
      console.error("Error inviting friends:", error);
    }
  };

  const handleToggleFriend = (friendId: number) => {
    setSelectedFriends((prevSelected) =>
      prevSelected.includes(friendId)
        ? prevSelected.filter((id) => id !== friendId)
        : [...prevSelected, friendId]
    );
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
            {group.creator === currentUserId ? (
              <Button
                variant="contained"
                color="error"
                onClick={handleDeleteGroup}
              >
                Delete Group
              </Button>
            ) : isMember ? (
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
            <Button
              variant="contained"
              color="error"
              onClick={handleOpenModal}
            >
              Report
            </Button>
            {(group.creator === currentUserId || isTrusted) && (
              <>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => setInviteModalOpen(true)}
                  sx={{ ml: 2 }}
                >
                  Invite Friends
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => navigate(`/groups/${id}/invite`)}
                  sx={{ ml: 2 }}
                >
                  Invite Friends (New Page)
                </Button>
              </>
            )}
          </Box>
          {isMember && (
            <>
              <Box textAlign="center" mt={3}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => navigate(`/groups/${id}/messages`)}
                >
                  View Messages
                </Button>
              </Box>

              <Box textAlign="center" mt={3}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => navigate(`/groups/${id}/invite`)}
              >
                Invite Friends
              </Button>
              </Box>
            </>
          )}
          <Box mt={4}>
            <Typography variant="h5" gutterBottom>
              Members
            </Typography>
            <GroupMembersList
              members={members}
              currentUserId={currentUserId!}
              groupCreatorId={group.creator}
              trustedMemberIds={members.filter(member => member.is_trusted).map(member => member.user_id)}
              groupId={group.id}
              fetchMembers={fetchMembers}
            />
          </Box>

          <Modal
            open={open}
            onClose={handleCloseModal}
            aria-labelledby="modal-title"
            aria-describedby="modal-description"
          >
            <Box sx={reportModalStyle}>
              <IconButton
                onClick={handleCloseModal}
                style={{ position: "absolute", top: 5, right: 5 }}
              >
                <CloseIcon sx={{ fontSize: 30, fontWeight: "bold" }} />
              </IconButton>

              <Typography id="modal-title" variant="h4" component="h2">
                Report Group
              </Typography>
              <Typography id="modal-description" variant="body1" component="p">
                {`Reporting group ${id}`}
              </Typography>

              <FormControl variant="filled" sx={{ m: 1, width: 250 }} size="small" >
                <InputLabel id="reason-label">Reason</InputLabel>
                <Select
                  labelId="reason-label"
                >
                  
                </Select>
              </FormControl>
              <br />
              <Button
                variant="contained"
                color="error"
                onClick={() => {
                  handleReportGroup();
                  handleCloseModal();
                }}
              >
                Confirm Report
              </Button>
            </Box>
          </Modal>

          <Modal
            open={inviteModalOpen}
            onClose={() => setInviteModalOpen(false)}
            aria-labelledby="invite-modal-title"
            aria-describedby="invite-modal-description"
          >
            <Box sx={reportModalStyle}>
              <IconButton
                onClick={() => setInviteModalOpen(false)}
                style={{ position: "absolute", top: 5, right: 5 }}
              >
                <CloseIcon sx={{ fontSize: 30, fontWeight: "bold" }} />
              </IconButton>

              <Typography id="invite-modal-title" variant="h4" component="h2">
                Invite Friends
              </Typography>
              <List>
                {friends.map((friend) => (
                  <ListItem key={friend.id} button onClick={() => handleToggleFriend(friend.id)}>
                    <Checkbox
                      checked={selectedFriends.includes(friend.id)}
                      tabIndex={-1}
                      disableRipple
                    />
                    <ListItemText primary={friend.username} />
                  </ListItem>
                ))}
              </List>
              <Button
                variant="contained"
                color="primary"
                onClick={handleInviteFriends}
              >
                Send Invites
              </Button>
            </Box>
          </Modal>

        </CardContent>
      </Card>
    </Container>
  );
};

export default GroupDetails;
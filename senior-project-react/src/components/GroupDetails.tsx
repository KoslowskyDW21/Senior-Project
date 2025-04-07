import React, { useState, useEffect } from "react";
import axios from "axios";
import { Theme, useTheme } from "@mui/material/styles";
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
  InputLabel,
  List,
  ListItem,
  ListItemText,
  Checkbox,
  Snackbar,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CloseIcon from "@mui/icons-material/Close";
import { useNavigate } from "react-router-dom";
import GroupMembersList from "./GroupMembersList";
import config from "../config.js";
import ConfirmationMessage from "./ConfirmationMessage.js";
import { ConfirmationProvider, useConfirmation } from "./ConfirmationHelper.js";

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

const GroupDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [group, setGroup] = useState<UserGroup | null>(null);
  const [isMember, setIsMember] = useState<boolean>(false);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isTrusted, setIsTrusted] = useState<boolean>(false);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [selectedFriends, setSelectedFriends] = useState<number[]>([]);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [isInvited, setIsInvited] = useState(false);
  const [inviteMessage, setInviteMessage] = useState("");
  const [message, setMessage] = useState<string>("");
  const [confirmation, setConfirmation] = useState<boolean>(false);
  const navigate = useNavigate();
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";

  // States for report modal
  const [open, setOpen] = useState(false);
  const handleOpenModal = () => setOpen(true);
  const handleCloseModal = () => setOpen(false);

  // States for delete confirmation modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const handleOpenDeleteModal = () => setDeleteModalOpen(true);
  const handleCloseDeleteModal = () => setDeleteModalOpen(false);

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

  const fetchGroup = async () => {
    try {
      const response = await axios.get(`${config.serverUrl}/groups/${id}/`);
      if (response.status === 200) {
        setGroup(response.data);
      }
    } catch (error) {
      console.error("Error fetching group details:", error);
    }
  };

  const checkMembership = async () => {
    try {
      const response = await axios.get(
        `${config.serverUrl}/groups/${id}/is_member/`
      );
      setIsMember(response.data.is_member);
      setIsTrusted(response.data.is_trusted);
    } catch (error) {
      console.error("Error checking membership:", error);
    }
  };

  const fetchMembers = async () => {
    try {
      const response = await axios.get(
        `${config.serverUrl}/groups/${id}/members/`
      );
      setMembers(response.data);
    } catch (error) {
      console.error("Error fetching group members:", error);
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const response = await axios.get(
        `${config.serverUrl}/login/current_user/`
      );
      setCurrentUser(response.data);
    } catch (error) {
      console.error("Error fetching current user:", error);
    }
  };

  const fetchFriends = async () => {
    try {
      const response = await axios.post(
        `${config.serverUrl}/friends/get_friends/`
      );
      const friendsData = response.data.friends;

      // Fetch group members and unread notifications
      const membersResponse = await axios.get(
        `${config.serverUrl}/groups/${id}/members/`
      );
      const notificationsResponse = await axios.post(
        `${config.serverUrl}/settings/get_notifications/`
      );

      const groupMembers = membersResponse.data.map(
        (member: GroupMember) => member.user_id
      );
      const unreadNotifications = notificationsResponse.data.notifications
        .filter(
          (notification: any) =>
            notification.isRead === 0 && notification.group_id === parseInt(id!)
        )
        .map((notification: any) => notification.user_id);

      // Filter out friends who are already in the group or have an unread notification
      const filteredFriends = friendsData.filter(
        (friend: Friend) =>
          !groupMembers.includes(friend.id) &&
          !unreadNotifications.includes(friend.id)
      );

      setFriends(filteredFriends);
    } catch (error) {
      console.error("Error fetching friends:", error);
    }
  };

  const handleJoinGroup = async () => {
    try {
      await axios.post(`${config.serverUrl}/groups/${id}/join/`);
      setIsMember(true);
      fetchMembers();
    } catch (error) {
      console.error("Error joining group:", error);
    }
  };

  const handleLeaveGroup = async () => {
    try {
      await axios.post(`${config.serverUrl}/groups/${id}/leave/`);
      setIsMember(false);
      fetchMembers();
    } catch (error) {
      console.error("Error leaving group:", error);
    }
  };

  const handleDeleteGroup = async () => {
    try {
      await axios.delete(`${config.serverUrl}/groups/${id}/delete/`);
      navigate("/groups");
    } catch (error) {
      console.error("Error deleting group:", error);
    }
  };

  const handleReportGroup = async () => {
    console.log("Attempting to report this group...");
    let data;

    await axios
      .get(`${config.serverUrl}/groups/${id}/reportGroup/`)
      .then((response) => {
        data = response.data;
      })
      .catch((error) => {
        console.error("Could not get if already reported", error);
      });

    if (!data!.alreadyReported) {
      const newData = {
        user_id: data!.id,
        group_id: id,
      };

      await axios
        .post(`${config.serverUrl}/groups/${id}/reportGroup/`, newData, {
          headers: {
            "Content-Type": "application/json",
          },
        })
        .then((response) => {
          setMessage("Group successfully reported");
          console.log("Group successfully reported.");
          console.log(response.data.message);
        })
        .catch((error) => {
          console.log("Could not report group", error);
        });
    } else {
      setMessage("Group already reported");
      console.log("Group already reported");
    }
  };

  const handleInviteFriends = async () => {
    try {
      await axios.post(`${config.serverUrl}/groups/${id}/invite/`, {
        friend_ids: selectedFriends,
      });
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

  const checkInviteStatus = async () => {
    try {
      const response = await axios.get(
        `${config.serverUrl}/groups/${id}/invite_status/`
      );
      if (response.data) {
        setIsInvited(response.data.isInvited);
        setInviteMessage(response.data.notificationText);
      }
    } catch (error) {
      console.error("Error checking invite status:", error);
    }
  };

  const handleAcceptInvite = async () => {
    try {
      await axios.post(`${config.serverUrl}/groups/${id}/invite_response/`, {
        response: "accept",
      });
      setIsInvited(false);
      fetchGroup();
      fetchMembers();
    } catch (error) {
      console.error("Error accepting invite:", error);
    }
  };

  const handleDenyInvite = async () => {
    try {
      await axios.post(`${config.serverUrl}/groups/${id}/invite_response/`, {
        response: "deny",
      });
      setIsInvited(false);
    } catch (error) {
      console.error("Error denying invite:", error);
    }
  };

  useEffect(() => {
    fetchGroup();
    checkMembership();
    fetchMembers();
    fetchCurrentUser();
    fetchFriends();
    checkInviteStatus();
  }, [id]);

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
    <ConfirmationProvider>
      <Container>
        <IconButton
          onClick={() => navigate("/groups")}
          style={{ position: "absolute", top: 30, left: 30 }}
        >
          <ArrowBackIcon sx={{ fontSize: 30, fontWeight: "bold" }} />
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
              image={`${config.serverUrl}/${group.image}`}
              alt={group.name}
            />
          )}
          <CardContent>
            <Typography variant="h6" component="div" gutterBottom>
              {group.description}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {group.is_public ? "Public" : "Private"}
            </Typography>
            <Box textAlign="center" mt={4}>
              {currentUser &&
                (group.creator === currentUser.id || currentUser.is_admin) && (
                  <Button
                    variant="contained"
                    color="error"
                    onClick={handleOpenDeleteModal}
                    sx={{ mb: 2 }}
                  >
                    Delete Group
                  </Button>
                )}
            </Box>
            <Box>
              {isInvited ? (
                <>
                  <Typography variant="body1" gutterBottom>
                    {inviteMessage}
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleAcceptInvite}
                    sx={{ mr: 2 }}
                  >
                    Accept
                  </Button>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={handleDenyInvite}
                  >
                    Deny
                  </Button>
                </>
              ) : (
                <>
                  {isMember &&
                    currentUser &&
                    group.creator !== currentUser.id && (
                      <Button
                        variant="contained"
                        color="secondary"
                        onClick={handleLeaveGroup}
                        sx={{ mb: 2 }}
                      >
                        Leave Group
                      </Button>
                    )}
                  {!isMember && (
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleJoinGroup}
                      sx={{ mb: 2 }}
                    >
                      Join Group
                    </Button>
                  )}
                </>
              )}
            </Box>

            <Box>
              <Button
                variant="contained"
                color="error"
                onClick={handleOpenModal}
                sx={{ mb: 2 }}
              >
                Report
              </Button>
            </Box>
            <Box>
              {currentUser && (group.creator === currentUser.id || isTrusted) && (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => setInviteModalOpen(true)}
                  sx={{ mb: 2 }}
                >
                  Invite Friends
                </Button>
              )}
            </Box>
            {(isMember || currentUser?.is_admin) && (
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
              </>
            )}
            <Box mt={4}>
              <Typography variant="h5" gutterBottom>
                Members
              </Typography>
              <GroupMembersList
                members={members}
                currentUserId={currentUser?.id!}
                groupCreatorId={group.creator}
                trustedMemberIds={members
                  .filter((member) => member.is_trusted)
                  .map((member) => member.user_id)}
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
              <Box sx={reportModalStyle(theme)}>
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

                <FormControl
                  variant="filled"
                  sx={{ m: 1, width: 250 }}
                  size="small"
                >
                  <InputLabel id="reason-label">Reason</InputLabel>
                  <Select labelId="reason-label"></Select>
                </FormControl>
                <br />
                {/* <Button
                  variant="contained"
                  color="error"
                  onClick={() => {
                    handleReportGroup();
                    handleCloseModal();
                    setConfirmation(true);
                  }}
                >
                  Confirm Report
                </Button> */}
                <ButtonWithConfirmation
                  color="error"
                  handler={() => {
                    handleReportGroup();
                    handleCloseModal();
                  }}
                  text="Confirm Report"
                />
              </Box>
            </Modal>

            <Modal
              open={inviteModalOpen}
              onClose={() => setInviteModalOpen(false)}
              aria-labelledby="invite-modal-title"
              aria-describedby="invite-modal-description"
            >
              <Box sx={reportModalStyle(theme)}>
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
                    <ListItem
                      key={friend.id}
                      button
                      onClick={() => handleToggleFriend(friend.id)}
                    >
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

            <Modal
              open={deleteModalOpen}
              onClose={handleCloseDeleteModal}
              aria-labelledby="delete-modal-title"
              aria-describedby="delete-modal-description"
            >
              <Box sx={reportModalStyle(theme)}>
                <IconButton
                  onClick={handleCloseDeleteModal}
                  style={{ position: "absolute", top: 5, right: 5 }}
                >
                  <CloseIcon sx={{ fontSize: 30, fontWeight: "bold" }} />
                </IconButton>

                <Typography id="delete-modal-title" variant="h4" component="h2">
                  Confirm Delete
                </Typography>
                <Typography
                  id="delete-modal-description"
                  variant="body1"
                  component="p"
                >
                  Are you sure you want to delete this group?
                </Typography>
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => {
                    handleDeleteGroup();
                    handleCloseDeleteModal();
                  }}
                >
                  Yes, Delete
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleCloseDeleteModal}
                  sx={{ ml: 2 }}
                >
                  Cancel
                </Button>
              </Box>
            </Modal>
          </CardContent>
        </Card>

        
        <ConfirmationMessage message={message} />
        
      </Container>
    </ConfirmationProvider>
  );
};

export default GroupDetails;

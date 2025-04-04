import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Theme, useTheme } from "@mui/material/styles";
import axios from "axios";
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Container,
  Button,
  IconButton,
  Modal,
  List,
  ListItem,
  ListItemText,
  Checkbox,
  FormControl,
  Select,
  InputLabel,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CloseIcon from "@mui/icons-material/Close";
import ChallengeParticipantsList from "./ChallengeParticipantsList";
import config from "../config.js";
import { set } from "date-fns";
import Header from "./Header.js";

interface Challenge {
  id: number;
  name: string;
  creator: number;
  image?: string;
  difficulty: "1" | "2" | "3" | "4" | "5";
  theme: string;
  location: string;
  start_time: string;
  end_time: string;
  is_complete: boolean;
  num_reports: number;
}

interface Participant {
  user_id: number;
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
  is_banned: boolean;
  is_super_admin: boolean;
  num_recipes_completed: number;
  colonial_floor: string;
  colonial_side: string;
  date_created: Date;
  last_logged_in: Date;
  num_reports: number;
}

interface Friend {
  id: number;
  username: string;
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

const ChallengeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [participants, setParticipants] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [selectedFriends, setSelectedFriends] = useState<number[]>([]);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [invited, setInvited] = useState(false);
  const [inviteMessage, setInviteMessage] = useState("");
  const theme = useTheme();
  const [participantIds, setParticipantIds] = useState<Participant[]>([]);

  // States for report modal
  const [open, setOpen] = useState(false);
  const handleOpenModal = () => setOpen(true);
  const handleCloseModal = () => setOpen(false);

  const navigate = useNavigate();

  const fetchChallenge = async () => {
    try {
      const response = await axios.get(`${config.serverUrl}/challenges/${id}/`);
      setChallenge(response.data);
    } catch (error) {
      console.error("Error fetching challenge details:", error);
    }
  };

  const fetchParticipants = async () => {
    try {
      const response = await axios.get(
        `${config.serverUrl}/challenges/${id}/participants/`
      );
      const participantIds: Participant[] = response.data;
      setParticipantIds(participantIds);

      const userResponses = await Promise.all(
        participantIds.map((participant) =>
          axios.get(`${config.serverUrl}/challenges/get_user/${participant.user_id}/`)
        )
      );

      const users: User[] = userResponses.map((res) => res.data);
      setParticipants(users);
    } catch (error) {
      console.error("Error fetching participants:", error);
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

  const checkInviteStatus = async () => {
    try {
      const response = await axios.get(
        `${config.serverUrl}/challenges/${id}/invite_status/`
      );
      if (response.data) {
        setInvited(response.data.isInvited);
        setInviteMessage(response.data.notificationText);
      }
      console.log("Invite status:", response.data);
    } catch (error) {
      console.error("Error checking invite status:", error);
    }
  };

  const handleAcceptInvite = async () => {
    try {
      await axios.post(`${config.serverUrl}/challenges/${id}/invite_response/`, {
        response: "accept",
      });
      fetchParticipants();
      setInvited(false);
    } catch (error) {
      console.error("Error accepting invite:", error);
    }
  };

  const handleDenyInvite = async () => {
    try {
      await axios.post(`${config.serverUrl}/challenges/${id}/invite_response/`, {
        response: "deny",
      });
      setInvited(false);
    } catch (error) {
      console.error("Error denying invite:", error);
    }
  };

  const fetchFriends = async () => {
    try {
      const response = await axios.post(
        `${config.serverUrl}/friends/get_friends/`
      );
      const allFriends = response.data.friends;

      // Fetch participants and unviewed invites
      const participantsResponse = await axios.get(
        `${config.serverUrl}/challenges/${id}/participants/`
      );
      const participants = participantsResponse.data.map(
        (participant: Participant) => participant.user_id
      );

      const invitesResponse = await axios.get(
        `${config.serverUrl}/challenges/${id}/unviewed_invites/`
      );
      const unviewedInvites = invitesResponse.data.map(
        (invite: { user_id: number }) => invite.user_id
      );

      // Filter friends to exclude participants and those with unviewed invites
      const filteredFriends = allFriends.filter(
        (friend: Friend) =>
          !participants.includes(friend.id) &&
          !unviewedInvites.includes(friend.id)
      );

      setFriends(filteredFriends);
    } catch (error) {
      console.error("Error fetching friends:", error);
    }
  };

  const handleJoinChallenge = async () => {
    if (new Date(challenge!.start_time) > new Date()) {
      try {
        await axios.post(`${config.serverUrl}/challenges/${id}/join/`);
        fetchParticipants();
      } catch (error) {
        console.error("Error joining challenge:", error);
      }
    } else {
      alert("You cannot join the challenge after it has started.");
    }
  };

  const handleLeaveChallenge = async () => {
    if (new Date(challenge!.start_time) > new Date()) {
      try {
        await axios.post(`${config.serverUrl}/challenges/${id}/leave/`);
        fetchParticipants();
      } catch (error) {
        console.error("Error leaving challenge:", error);
      }
    } else {
      alert("You cannot leave the challenge after it has started.");
    }
  };

  const handleDeleteChallenge = async () => {
    try {
      await axios.delete(`${config.serverUrl}/challenges/${id}/delete/`);
      window.history.back();
    } catch (error) {
      console.error("Error deleting challenge:", error);
    }
  };

  const handleInviteFriends = async () => {
    try {
      await axios.post(`${config.serverUrl}/challenges/${id}/invite/`, {
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

  useEffect(() => {
    fetchChallenge();
    fetchParticipants();
    fetchCurrentUser();
    fetchFriends();
    checkInviteStatus();
  }, [id]);

  if (!challenge || !currentUser) {
    return (
      <Container>
        <Typography variant="h5" textAlign="center" mt={4}>
          Loading...
        </Typography>
      </Container>
    );
  }

  const handleReportChallenge = async () => {
    let data;

    await axios
      .get(`${config.serverUrl}/challenges/${id}/reportChallenge/`)
      .then((response) => {
        data = response.data;
      })
      .catch((error) => {
        console.error("Could not get if already reported", error);
      });

    if (!data!.alreadyReported) {
      const newData = {
        user_id: data!.id,
        challenge_id: id,
      };

      await axios
        .post(`${config.serverUrl}/challenges/${id}/reportChallenge/`, newData, {
          headers: {
            "Content-Type": "application/json",
          },
        })
        .then((response) => {
          console.log("Challenge successfully reported.");
          console.log(response.data.message);
        })
        .catch((error) => {
          console.log("Could not report challenge", error);
        });
    } else {
      console.log("Challenge already reported");
    }
  };

  const isParticipant = participants.some((p) => p.id === currentUser.id);
  const isCreator = challenge.creator === currentUser.id;
  const now = new Date();
  const startTime = new Date(challenge.start_time);
  const endTime = new Date(challenge.end_time);
  const votingEndTime = new Date(endTime.getTime() + 24 * 60 * 60 * 1000);

  return (
    <Container>

      <Header title={challenge.name}/>

      <Box mt={12}/>
      <IconButton
        onClick={() => navigate(`/challenges`)}
        style={{ position: "fixed", top: "clamp(70px, 10vw, 120px)",
          left: "clamp(0px, 1vw, 100px)",
          zIndex: 1000, }}
      >
        <ArrowBackIcon sx={{ fontSize: 30, fontWeight: "bold" }} />
      </IconButton>
      <Card sx={{ maxWidth: 800, margin: "20px auto", padding: 2 }}>
        {challenge.image && (
          <CardMedia
            component="img"
            height="400"
            image={`${config.serverUrl}/${challenge.image}`}
            alt={challenge.name}
            sx={{ borderRadius: 2 }}
          />
        )}
        <CardContent>
          <Typography variant="h4" component="div" gutterBottom>
            {challenge.name}
          </Typography>
          <Box mb={2}>
            <Typography variant="body1">
              <strong>Difficulty:</strong> {challenge.difficulty}/5
            </Typography>
            <Typography variant="body1">
              <strong>Theme:</strong> {challenge.theme}
            </Typography>
            <Typography variant="body1">
              <strong>Location:</strong> {challenge.location}
            </Typography>
            <Typography variant="body1">
              <strong>Start Time:</strong> {startTime.toLocaleString()}
            </Typography>
            <Typography variant="body1">
              <strong>End Time:</strong> {endTime.toLocaleString()}
            </Typography>
          </Box>
          <Box textAlign="center" mt={3}>
            {invited === true ? (
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
                {(isCreator || currentUser.is_admin) && (
                  <Button
                    variant="contained"
                    color="error"
                    onClick={handleDeleteChallenge}
                    sx={{ mr: 2 }}
                  >
                    Delete Challenge
                  </Button>
                )}
                {isParticipant && now < startTime && (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => setInviteModalOpen(true)}
                    sx={{ mr: 2 }}
                  >
                    Invite Friend
                  </Button>
                )}
                {!isCreator && !isParticipant && now < startTime && (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleJoinChallenge}
                  >
                    Join Challenge
                  </Button>
                )}
                {!isCreator && isParticipant && now < startTime && (
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={handleLeaveChallenge}
                  >
                    Leave Challenge
                  </Button>
                )}
              </>
            )}
          </Box>
          <br />
          <Button
            variant="contained"
            color="error"
            onClick={handleOpenModal}
          >
            Report
          </Button>

          <Box mt={4}>
            <Typography variant="h5" gutterBottom>
              Participants
            </Typography>
            <ChallengeParticipantsList
              participants={participants}
              isCreator={isCreator}
              challengeId={challenge.id}
              creatorId={challenge.creator}
            />
          </Box>
          {isParticipant && now >= startTime && now <= votingEndTime && (
            <Box textAlign="center" mt={3}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => navigate(`/challenges/${id}/vote/`)}
              >
                Vote for Winner
              </Button>
            </Box>
          )}
          {now > votingEndTime && (
            <Box textAlign="center" mt={3}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => navigate(`/challenges/${id}/vote_results/`)}
              >
                View Vote Results
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>

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
            Report Challenge
          </Typography>
          <Typography id="modal-description" variant="body1" component="p">
            {`Reporting challenge ${challenge.name}`}
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
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              handleReportChallenge();
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
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "#ffffff",
            boxShadow: 24,
            padding: 4,
            borderRadius: 2,
          }}
        >
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
    </Container>
  );
};

export default ChallengeDetail;

import axios, { AxiosError } from "axios";
import FolderIcon from "@mui/icons-material/Folder";
import { Theme, useTheme } from "@mui/material/styles";
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, ChangeEvent, useRef } from "react";
import Header from "./Header.js";
import {
  Avatar,
  Box,
  Button,
  Menu,
  Modal,
  Typography,
  LinearProgress,
  Tooltip,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CloseIcon from "@mui/icons-material/Close";
import config from "../config.js";

interface ProfileResponse {
  lname: string;
  fname: string;
  username: string;
  profile_picture: string;
  achievements: Achievement[];
  user_level: number;
  xp_points: number;
  hasLeveled: boolean;
}

interface Friendship {
  friends: [];
}

interface User {
  users: [];
}

interface FriendRequestTo {
  friend_requests_to: [];
}

interface FriendRequestFrom {
  friend_requests_from: [];
}

interface Achievement {
  id: number;
  title: string;
  image?: string;
  isComplete: boolean;
  isVisible: boolean;
  description: string;
}

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "80vw",  // Set width relative to viewport width
  height: "60vh",  // Set height relative to viewport height
  maxWidth: "60vh",
  maxHeight: "75vh",  // Max height to limit the modal's height on large screens
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  overflow: "hidden", // Prevent overflow
};

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

const OtherProfile: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  let { id } = useParams<{ id: string }>();
  if (id == undefined) {
    id = "1";
  }

  const numericId = Number(id);

  const [lname, setLname] = useState<String>();
  const [fname, setFname] = useState<String>();
  const [username, setUsername] = useState<String>();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [profilePicUrl, setProfilePicUrl] = useState<string | null>(null);
  const [user_level, setLevel] = useState<number>(0);
  const [xp_points, setXp_points] = useState<number>(0);
  const [hasLeveled, setHasLeveled] = useState<boolean>(false);
  const [friends, setFriends] = useState<[]>([]);
  const [friendRequestsTo, setFriendRequestsTo] = useState<[]>([]);
  const [friendRequestsFrom, setFriendRequestsFrom] = useState<[]>([]);
  const [openReportModal, setOpenReportModal] = useState(false);
  const [openBlockModal, setOpenBlockModal] = useState(false);
  const [openRemoveFriendModal, setOpenRemoveFriendModal] = useState(false);
  const [profileNotFound, setProfileNotFound] = useState(false);
  const [isUserBlocked, setIsUserBlocked] = useState(false);
  const [isCurrentUserBlocked, setIsCurrentUserBlocked] = useState(false);
  const handleOpenReportModal = () => setOpenReportModal(true);
  const handleCloseReportModal = () => setOpenReportModal(false);
  const handleOpenRemoveFriendModal = () => setOpenRemoveFriendModal(true);
  const handleCloseRemoveFriendModal = () => setOpenRemoveFriendModal(false);
  const handleOpenBlockModal = () => setOpenBlockModal(true);
  const handleCloseBlockModal = () => setOpenBlockModal(false);

  const [ellipsisAnchorEl, setEllipsisAnchorEl] = useState<null | HTMLElement>(
    null
  );

  const handleClickEllipsis = (event: React.MouseEvent<HTMLElement>) => {
    setEllipsisAnchorEl(event.currentTarget);
  };

  const handleCloseEllipsis = () => {
    setEllipsisAnchorEl(null);
  };

  const [openAchievementModal, setOpenAchievementModal] = useState(false);
  const [selectedAchievement, setSelectedAchievement] =
    useState<Achievement | null>(null);

  const handleOpenAchievementModal = (achievement: Achievement) => {
    setSelectedAchievement(achievement);
    setOpenAchievementModal(true);
  };

  const handleCloseAchievementModal = () => {
    setOpenAchievementModal(false);
    setSelectedAchievement(null);
  };

  const calculateXPForLevel = (level: number): number => {
    return Math.floor(1000 * Math.pow(level - 1, 2));
  };
  const calculateNextLevelXP = (level: number): number => {
    return Math.floor(1000 * Math.pow(level, 2));
  };
  const calculateLevel = (xp: number): number => {
    return Math.floor(0.1 * Math.sqrt(0.1 * xp)) + 1;
  };

  const currentLevel = calculateLevel(xp_points);
  const xpForCurrentLevel = calculateXPForLevel(currentLevel);
  const xpForNextLevel = calculateNextLevelXP(currentLevel);
  const progressPercentage =
    ((xp_points - xpForCurrentLevel) / (xpForNextLevel - xpForCurrentLevel)) *
    100;

  const [hovered, setHovered] = useState(false);

  const getProfileResponse = async () => {
    try {
      const response = await axios.get(
        `${config.serverUrl}/profile/get_other_profile/${id}`,
        {}
      );
      console.log("response", response);
      const data: ProfileResponse = response.data;
      setLname(data.lname);
      setFname(data.fname);
      setUsername(data.username);
      setAchievements(data.achievements);
      setLevel(data.user_level);
      setXp_points(data.xp_points);
      setHasLeveled(data.hasLeveled);
      const profile_picture = response.data.profile_picture;
      if (profile_picture) {
        console.log(data.profile_picture);
        setProfilePicUrl(`${config.serverUrl}/${profile_picture}`);
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        setProfileNotFound(true);
      } else {
        console.error("Error getting profile:", error);
      }
    }
  };

  const getFriends = async () => {
    try {
      const response = await axios.post(
        `${config.serverUrl}/friends/get_friends/`,
        {},
        { withCredentials: true }
      );
      const data: Friendship = response.data;
      setFriends(data.friends);
    } catch (error) {
      console.error("Error fetching friends: ", error);
    }
  };

  const getFriendRequestsTo = async () => {
    try {
      const response = await axios.post(
        `${config.serverUrl}/friends/get_requests_to/`,
        {},
        { withCredentials: true }
      );
      const data: FriendRequestTo = response.data;
      setFriendRequestsTo(data.friend_requests_to);
      console.log("Friend requests to: ", data.friend_requests_to);
    } catch (error) {
      console.error("Error fetching friend requests to: ", error);
    }
  };

  const getFriendRequestsFrom = async () => {
    try {
      const response = await axios.post(
        `${config.serverUrl}/friends/get_requests_from/`,
        {},
        { withCredentials: true }
      );
      const data: FriendRequestFrom = response.data;
      setFriendRequestsFrom(data.friend_requests_from);
    } catch (error) {
      console.error("Error fetching friend requests from: ", error);
    }
  };

  const sendFriendRequest = async (friendId: number) => {
    try {
      const response = await axios.post(
        `${config.serverUrl}/friends/send_request/${friendId}`,
        { friend_id: friendId },
        { withCredentials: true }
      );
      console.log("Friend request sent:", response.data);
      getFriendRequestsTo();
    } catch (error) {
      console.error("Error sending friend request:", error);
    }
  };

  const revokeFriendRequest = async (friendId: number) => {
    try {
      const response = await axios.post(
        `${config.serverUrl}/friends/revoke_request/${friendId}`,
        { friend_id: friendId },
        { withCredentials: true }
      );
      console.log("Friend request revoked:", response.data);
      getFriendRequestsTo();
    } catch (error) {
      console.error("Error sending friend request:", error);
    }
  };

  const declineFriendRequest = async (friendId: number) => {
    try {
      const response = await axios.post(
        `${config.serverUrl}/friends/decline_request/${friendId}`,
        { friend_id: friendId },
        { withCredentials: true }
      );
      console.log("Friend request declined:", response.data);
      getFriendRequestsFrom();
    } catch (error) {
      console.error("Error declining friend request:", error);
    }
  };

  const acceptFriendRequest = async (friendId: number) => {
    try {
      const response = await axios.post(
        `${config.serverUrl}/friends/accept_request/${friendId}`,
        { friend_id: friendId },
        { withCredentials: true }
      );
      console.log("Friend request accepted:", response.data);
      getFriendRequestsFrom();
      getFriends();
    } catch (error) {
      console.error("Error accepting friend request:", error);
    }
  };

  const removeFriend = async (friendId: number) => {
    try {
      const response = await axios.post(
        `${config.serverUrl}/friends/remove_friend/${friendId}`,
        { friend_id: friendId },
        { withCredentials: true }
      );
      console.log("Friend removed:", response.data);
      handleCloseRemoveFriendModal();
      getFriends();
    } catch (error) {
      console.error("Error removingFriend:", error);
    }
  };

  const is_user_blocked = async (userId: number) => {
    try {
      const response = await axios.post(
        `${config.serverUrl}/profile/is_blocked/${userId}`,
        { userId: userId },
        { withCredentials: true }
      );
      console.log("Is user blocked?:", response.data.is_blocked);
      setIsUserBlocked(response.data.is_blocked);
    } catch (error) {
      console.error("Error checking if user is blocked:", error);
    }
  };

  const is_current_user_blocked = async (userId: number) => {
    try {
      const response = await axios.post(
        `${config.serverUrl}/profile/is_current_user_blocked/${userId}`,
        { userId: userId },
        { withCredentials: true }
      );
      console.log(
        "Is current user blocked?:",
        response.data.is_current_user_blocked
      );
      setIsCurrentUserBlocked(response.data.is_current_user_blocked);
    } catch (error) {
      console.error("Error checking if current user is blocked:", error);
    }
  };

  const blockUser = async (userId: number) => {
    try {
      const response = await axios.post(
        `${config.serverUrl}/profile/block_user/${userId}`,
        { userId: userId },
        { withCredentials: true }
      );
      console.log("User blocked:", response.data);
      removeFriend(userId);
      is_user_blocked(numericId);
      handleCloseBlockModal();
    } catch (error) {
      console.error("Error blocking user:", error);
    }
  };

  const unblockUser = async (userId: number) => {
    try {
      const response = await axios.post(
        `${config.serverUrl}/profile/unblock_user/${userId}`,
        { userId: userId },
        { withCredentials: true }
      );
      console.log("User unblocked:", response.data);
      is_user_blocked(numericId);
    } catch (error) {
      console.error("Error unblocking user:", error);
    }
  };

  useEffect(() => {
    getProfileResponse();
    getFriends();
    getFriendRequestsFrom();
    getFriendRequestsTo();
    is_user_blocked(numericId);
    is_current_user_blocked(numericId);
  }, []);

  const handleGoToAchievements = () => {
    navigate("/achievements");
  };

  const xpBarRef = useRef<HTMLDivElement | null>(null);

  const isFriendRequestReceived = friendRequestsFrom.some(
    (request: any) => request.requestFrom === numericId
  );

  const isFriendRequestGiven = friendRequestsTo.some(
    (request: any) => request.requestTo === numericId
  );

  const isFriend = friends.some((friend: any) => friend.id === numericId);

  const handleReportUser = async () => {
    const data = {
      report_id: numericId,
    };

    await axios
      .post(`${config.serverUrl}/profile/report`, data, {
        headers: {
          "Content-Type": "application/json",
        },
      })
      .then((response) => {
        console.log(response.data.message);
      })
      .catch((error) => {
        console.error("Could not report user", error);
      });
  };

  return (
    <>
      <Header title={`${username}`} />
      <IconButton
        onClick={() => navigate(-1)}
        style={{
          position: "fixed",
          top: "clamp(70px, 10vw, 120px)",
          left: "clamp(0px, 1vw, 100px)",
          zIndex: 1000,
        }}
      >
        <ArrowBackIcon sx={{ fontSize: 30, fontWeight: "bold" }} />
      </IconButton>

      {profileNotFound ? (
        <Typography variant="h4" textAlign="center" marginTop={5}>
          Profile not found
        </Typography>
      ) : (
        <>
          <Typography variant="h6" fontWeight="bold" marginRight={5}>
            {fname} {lname}
          </Typography>
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            gap={2} // Space between avatar and button container
            marginBottom={2}
          >
            {/* Profile Picture */}
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              width={150}
              height={150}
              borderRadius="50%"
              border="2px solid #ccc"
            >
              {profilePicUrl ? (
                <Avatar src={profilePicUrl} sx={{ width: 120, height: 120 }} />
              ) : (
                <FolderIcon sx={{ fontSize: 80 }} />
              )}
            </Box>

            {/* Button Container*/}
            <Box display="flex" flexDirection="row" gap={1}>
              {/* If they sent you a friend request, have option to accept or decline */}
              {/* If you sent them a friend request, button should say "requested" */}
              {/* If friends, button should say "remove friend" */}

              {isUserBlocked ? (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => unblockUser(numericId)}
                >
                  Unblock
                </Button>
              ) : isFriend ? (
                <Button
                  variant="contained"
                  color="warning"
                  onClick={() => handleOpenRemoveFriendModal()}
                >
                  Remove Friend
                </Button>
              ) : isFriendRequestReceived ? (
                <Box display="flex" flexDirection="column" gap={1}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => acceptFriendRequest(numericId)}
                  >
                    Accept Friend Request
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    onClick={() => declineFriendRequest(numericId)}
                  >
                    Decline Friend Request
                  </Button>
                </Box>
              ) : isFriendRequestGiven ? (
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => revokeFriendRequest(numericId)}
                >
                  Revoke Friend Request
                </Button>
              ) : (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => sendFriendRequest(numericId)}
                  disabled={isCurrentUserBlocked} // Disable if current user is blocked by this user
                >
                  Send Friend Request
                </Button>
              )}
              <Menu
                anchorEl={ellipsisAnchorEl}
                open={Boolean(ellipsisAnchorEl)}
                onClose={handleCloseEllipsis}
              >
                <MenuItem onClick={handleOpenReportModal} sx={{ color: "red" }}>
                  Report User
                </MenuItem>
                <MenuItem
                  onClick={() => handleOpenBlockModal()}
                  disabled={isUserBlocked} // Disable if already blocked
                  sx={{ color: "red" }}
                >
                  {isUserBlocked ? "Unblock User" : "Block User"}
                </MenuItem>
              </Menu>

              <Modal
                open={openBlockModal}
                onClose={handleCloseBlockModal}
                aria-labelledby="modal-title"
              >
                <Box sx={reportModalStyle(theme)}>
                  <IconButton
                    onClick={handleCloseBlockModal}
                    style={{ position: "absolute", top: 5, right: 5 }}
                  >
                    <CloseIcon sx={{ fontSize: 30, fontWeight: "bold" }} />
                  </IconButton>

                  <Typography id="modal-title" variant="h6" component="h2">
                    Are you sure you want to block {username}?
                  </Typography>

                  <br />
                  <Button
                    variant="contained"
                    color="error"
                    onClick={() => {
                      blockUser(numericId);
                    }}
                    sx={{
                      width: "100%",
                      textAlign: "center",
                    }}
                  >
                    Block {username}
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => {
                      handleCloseBlockModal();
                    }}
                    sx={{
                      width: "100%",
                      textAlign: "center",
                      marginTop: 2,
                    }}
                  >
                    Cancel
                  </Button>
                </Box>
              </Modal>
              <Modal
                open={openRemoveFriendModal}
                onClose={handleCloseRemoveFriendModal}
                aria-labelledby="modal-title"
              >
                <Box sx={reportModalStyle(theme)}>
                  <IconButton
                    onClick={handleCloseRemoveFriendModal}
                    style={{ position: "absolute", top: 5, right: 5 }}
                  >
                    <CloseIcon sx={{ fontSize: 30, fontWeight: "bold" }} />
                  </IconButton>

                  <Typography id="modal-title" variant="h6" component="h2">
                    Are you sure you want to unfriend {username}?
                  </Typography>

                  <br />
                  <Button
                    variant="contained"
                    color="error"
                    onClick={() => {
                      removeFriend(numericId);
                    }}
                    sx={{
                      width: "100%",
                      textAlign: "center",
                    }}
                  >
                    Unfriend {username}
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => {
                      handleCloseRemoveFriendModal();
                    }}
                    sx={{
                      width: "100%",
                      textAlign: "center",
                      marginTop: 2,
                    }}
                  >
                    Cancel
                  </Button>
                </Box>
              </Modal>

              <IconButton onClick={handleClickEllipsis}>
                <MoreVertIcon />
              </IconButton>
            </Box>
          </Box>
          <input
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            id="profile-picture-input"
          />

          <Box
            sx={{
              width: "100%",
              textAlign: "center",
              marginBottom: 2,
              marginTop: 5,
            }}
          >
            <Typography variant="h6" gutterBottom>
              Level {user_level}
            </Typography>
            <Tooltip
              title={`XP: ${xp_points} / ${xpForNextLevel}`}
              open={hovered}
              placement="top"
              onOpen={() => setHovered(true)}
              onClose={() => setHovered(false)}
            >
              <Box sx={{ width: "100%", position: "relative" }} ref={xpBarRef}>
                <LinearProgress
                  variant="determinate"
                  value={progressPercentage}
                  sx={{
                    height: 20,
                    borderRadius: 5,
                    backgroundColor: "#e0e0e0",
                  }}
                  color="success"
                />
              </Box>
            </Tooltip>
          </Box>
          <p>Recent Achievements:</p>
          <div
            style={{
              display: "flex",
              gap: "16px",
              alignItems: "flex-start",
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: `repeat(${Math.min(
                  3,
                  achievements.length
                )}, 1fr)`,
                gap: "16px",
                flexGrow: 1,
                width: "auto", // Ensure the grid only takes up as much space as needed
              }}
            >
              {achievements.slice(-3).map((achievement: Achievement) => (
                <div key={achievement.id}>
                  <button
                    onClick={() => handleOpenAchievementModal(achievement)}
                  >
                    <img
                      src={`${config.serverUrl}/${
                        achievement.isVisible
                          ? achievement.image
                          : "static/uploads/daQuestion.png"
                      }`}
                      width="100"
                      alt={achievement.title}
                    />
                  </button>
                  <p>{achievement.title}</p>
                </div>
              ))}
            </div>

            <Button
              onClick={handleGoToAchievements}
              sx={{
                alignSelf: "center",
                whiteSpace: "nowrap",
                minWidth: "max-content",
                marginLeft: "16px",
              }}
            >
              See More
            </Button>
          </div>

          <Modal
            open={openReportModal}
            onClose={handleCloseReportModal}
            aria-labelledby="modal-title"
          >
            <Box sx={reportModalStyle(theme)}>
              <IconButton
                onClick={handleCloseReportModal}
                style={{ position: "absolute", top: 5, right: 5 }}
              >
                <CloseIcon sx={{ fontSize: 30, fontWeight: "bold" }} />
              </IconButton>

              <Typography id="modal-title" variant="h4" component="h2">
                Report User
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
                  handleReportUser();
                  handleCloseReportModal();
                }}
              >
                Confirm Report
              </Button>
            </Box>
          </Modal>

          <Modal
        open={openAchievementModal}
        onClose={handleCloseAchievementModal}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={modalStyle}>
          {selectedAchievement && (
            <>
              {/* Achievement Title */}
              <Typography id="modal-modal-title" variant="h6" component="h2" sx={{ textAlign: "center", marginBottom: "10px" }}>
                {selectedAchievement.title}
              </Typography>

              {/* Image */}
              <Box 
                sx={{
                  width: "100%",  // Full width of the modal container
                  height: "auto", // Allow the image to adjust height based on its width
                  display: "flex", 
                  justifyContent: "center", // Center the image horizontally
                  alignItems: "center",  // Center the image vertically
                  maxHeight: "50%",  // Limit the height of the image to 50% of the modal's height
                }}
              >
                <img
                  src={`${config.serverUrl}/${selectedAchievement.image}`}
                  alt={selectedAchievement.title}
                  style={{
                    width: "100%", // Image takes full width
                    height: "auto", // Maintain aspect ratio
                    maxHeight: "100%", // Ensure the image doesn't exceed the container's height
                    objectFit: "contain",  // Ensure image fits within the container while maintaining aspect ratio
                  }}
                />
              </Box>

              {/* Achievement Description */}
              <Typography id="modal-modal-description" sx={{ mt: 2, textAlign: "center", fontSize: "1rem", maxHeight: "30%", overflow: "auto" }}>
                {selectedAchievement.description}
              </Typography>
            </>
          )}
        </Box>
      </Modal>
        </>
      )}
    </>
  );
};

export default OtherProfile;

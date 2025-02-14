import axios, { AxiosError } from "axios";
import FolderIcon from "@mui/icons-material/Folder";
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, ChangeEvent, useRef } from "react";
import {
  Avatar,
  Box,
  Button,
  Modal,
  Typography,
  LinearProgress,
  Tooltip,
  IconButton,
} from "@mui/material";
import Achievement from "./Achievements";
import Confetti from "react-confetti";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

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

const modalStyle = {
  position: "absolute",
  top: "calc(50% + 60px)",
  left: "50%",
  transform: "translateX(-50%)",
  width: 250,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  pt: 2,
  px: 4,
  pb: 3,
  borderRadius: 2,
};

const OtherProfile: React.FC = () => {
  const navigate = useNavigate();
  let { id } = useParams<{ id: string }>();
  if (id == undefined) {
    id = "1";
  }

  const [lname, setLname] = useState<String>();
  const [fname, setFname] = useState<String>();
  const [username, setUsername] = useState<String>();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [profilePicUrl, setProfilePicUrl] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [user_level, setLevel] = useState<number>(0);
  const [xp_points, setXp_points] = useState<number>(0);
  const [hasLeveled, setHasLeveled] = useState<boolean>(false);

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

  const getResponse = async () => {
    try {
      const response = await axios.get(
        `http://127.0.0.1:5000/profile/get_other_profile/${id}`,
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
      const profilePicturePath = response.data.profile_picture;
      if (profilePicturePath) {
        console.log(data.profile_picture);
        setProfilePicUrl(profilePicturePath);
      }
    } catch (error) {
      console.error("Error getting profile:", error);
    }
  };

  useEffect(() => {
    getResponse();
  }, []);

  const handleGoToRecipes = async () => {
    navigate(`/recipes`);
  };

  const handleGoToAchievements = () => {
    navigate("/achievements");
  };

  const resetHasLeveled = async () => {
    try {
      await axios.post(
        `http://127.0.0.1:5000/profile/leveled/`,
        {},
        { withCredentials: true }
      );
      setHasLeveled(false);
    } catch (error) {
      console.error("Error resetting hasLeveled:", error);
    }
  };

  const xpBarRef = useRef<HTMLDivElement | null>(null);

  return (
    <>
      <IconButton
        onClick={() => navigate(-1)}
        style={{ position: "absolute", top: 30, left: 30 }}
      >
        <ArrowBackIcon sx={{ fontSize: 30, fontWeight: "bold" }} />
      </IconButton>

      <h1>This is {username}'s profile!</h1>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          marginBottom: "16px",
          width: "150px",
          height: "150px",
          borderRadius: "50%",
          border: "2px solid #ccc",
          marginLeft: "auto",
          marginRight: "auto",
        }}
      >
        {profilePicUrl ? (
          <Avatar src={profilePicUrl} sx={{ width: 120, height: 120 }} />
        ) : (
          <FolderIcon sx={{ fontSize: 80 }} />
        )}
      </div>
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
          {achievements.slice(0, 3).map((achievement: Achievement) => (
            <div key={achievement.id}>
              <button onClick={() => handleOpenAchievementModal(achievement)}>
                <img
                  src={achievement.image}
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
        open={openAchievementModal}
        onClose={handleCloseAchievementModal}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={modalStyle}>
          {selectedAchievement && (
            <>
              <Typography id="modal-modal-title" variant="h6" component="h2">
                {selectedAchievement.title}
              </Typography>
              <Typography id="modal-image">
                <Box>
                  <img
                    src={selectedAchievement.image}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                    alt={selectedAchievement.title}
                  />
                </Box>
              </Typography>
              <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                {selectedAchievement.description}
              </Typography>
            </>
          )}
        </Box>
      </Modal>
    </>
  );
};

export default OtherProfile;

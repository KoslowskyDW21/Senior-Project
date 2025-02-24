import React from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useMediaQuery, Select, MenuItem, FormControl, InputLabel } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Button, IconButton } from "@mui/material";
import { CheckCircle } from "@mui/icons-material";
import config from "../config.js";

interface Achievement {
  id: number;
  title: string;
  image?: string;
  isVisible: boolean;
  description: string;
}

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

const Achievements: React.FC = () => {
  const [achievements, setAchievements] = React.useState<Achievement[]>([]);
  const [specAchievements, setSpecAchievements] = React.useState<Achievement[]>([]);
  const [open, setOpen] = React.useState(false);
  const [selectedAchievement, setSelectedAchievement] = React.useState<Achievement | null>(null);
  const [filter, setFilter] = React.useState("all"); // "all" or "completed"

  const navigate = useNavigate();

  const handleOpen = (achievement: Achievement) => {
    setSelectedAchievement(achievement);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedAchievement(null);
  };

  const isSmallScreen = useMediaQuery("(max-width:600px)");
  const isMediumScreen = useMediaQuery("(max-width:960px)");

  const gridTemplateColumns = isSmallScreen
    ? "repeat(1, 1fr)"
    : isMediumScreen
    ? "repeat(2, 1fr)"
    : "repeat(3, 1fr)";

  const getResponse = async () => {
    try {
      const response = await axios.post(`${config.serverUrl}/achievements/`);
      const { achievements, specAchievements }: { achievements: Achievement[]; specAchievements: Achievement[] } = response.data;
      setAchievements(achievements);
      setSpecAchievements(specAchievements);
    } catch (error) {
      console.error("Error fetching achievements:", error);
    }
  };

  React.useEffect(() => {
    getResponse();
  }, []);

  // Filter achievements based on the selected filter
  const filteredAchievements =
    filter === "completed"
      ? achievements.filter((achievement) => specAchievements.some((specAch) => specAch.id === achievement.id))
      : achievements;

  return (
    <div>
      <IconButton
        onClick={() => navigate(-1)}
        style={{ position: "absolute", top: 30, left: 30 }}
      >
        <ArrowBackIcon sx={{ fontSize: 30, fontWeight: "bold" }} />
      </IconButton>
      <h1>Achievements</h1>

      {/* Dropdown for Filtering Achievements */}
      <FormControl fullWidth style={{ marginBottom: "16px" }}>
        <InputLabel>Filter Achievements</InputLabel>
        <Select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          label="Filter Achievements"
        >
          <MenuItem value="all">All Achievements</MenuItem>
          <MenuItem value="completed">Completed Achievements</MenuItem>
        </Select>
      </FormControl>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: gridTemplateColumns,
          gap: "16px",
        }}
      >
        {filteredAchievements.map((achievement) => {
          const isSpecial = specAchievements.some(
            (specAch) => specAch.id === achievement.id
          );

          return (
            <div key={achievement.id}>
              <Button
                onClick={() => handleOpen(achievement)}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  padding: "10px",
                  textAlign: "center",
                  filter: isSpecial ? "none" : "grayscale(100%)",
                }}
              >
                {achievement.image && (
                  <img
                    src={achievement.image}
                    alt={achievement.title}
                    style={{
                      width: "100%",
                      height: "auto",
                      objectFit: "cover",
                      maxHeight: "150px",
                    }}
                  />
                )}
                {isSpecial && (
                  <Box
                    sx={{
                      position: "absolute",
                      top: 0,
                      right: 0,
                      width: 40,
                      height: 40,
                    }}
                  >
                    <Box
                      sx={{
                        position: "absolute",
                        top: 0,
                        right: 0,
                        width: "100%",
                        height: "100%",
                        borderRadius: "50%",
                        backgroundColor: "white",
                      }}
                    />
                    <CheckCircle
                      style={{
                        position: "absolute",
                        top: "50%",
                        right: "50%",
                        transform: "translate(50%, -50%)",
                        color: "green",
                        fontSize: 50,
                      }}
                    />
                  </Box>
                )}

                <Typography variant="body1" style={{ marginTop: "8px" }}>
                  {achievement.title}
                </Typography>
              </Button>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
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
    </div>
  );
};

export default Achievements;

import axios, { AxiosError } from "axios";
import FolderIcon from "@mui/icons-material/Folder";
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, ChangeEvent } from "react";
import { Avatar, Box, Button, Modal } from "@mui/material"; //matui components
import Achievement from "./Achievements";

interface ProfileResponse {
  lname: string;
  fname: string;
  username: string;
  achievements: Achievement[];
}

interface getProfileResponse {
  message: string;
}

interface getDeleteResponse {
  message: string;
}

interface getUpdateResponse {
  message: string;
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

const Profile: React.FC = () => {
  const navigate = useNavigate(); //for navigation

  let { id } = useParams<{ id: string }>();
  if (id == undefined) {
    id = "1";
  }
  const [lname, setLname] = useState<String>();
  const [fname, setFname] = useState<String>();
  const [username, setUsername] = useState<String>();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [profilePicUrl, setProfilePicUrl] = useState<string | null>(null);
  const [openPfpModal, setOpenPfpModal] = useState(false);
  const [message, setMessage] = useState("");

  const getResponse = async () => {
    const response = await axios.post(
      `http://127.0.0.1:5000/profile/${id}`,
      {},
      { withCredentials: true }
    );
    const data: ProfileResponse = response.data;
    setLname(data.lname);
    setFname(data.fname);
    setUsername(data.username);
    setAchievements(data.achievements);
  };

  useEffect(() => {
    getResponse();
    getProfilePic();
  }, []);

  const getProfilePic = async () => {
    try {
      const response = await axios.post(
        "http://127.0.0.1:5000/profile/get_profile_pic/",
        {},
        { withCredentials: true }
      );
      const profilePicturePath = response.data.profile_picture;
      console.log(profilePicturePath);
      if (profilePicturePath) {
        console.log("Setting path");
        setProfilePicUrl(profilePicturePath);
        console.log(profilePicUrl);
      }
      console.log(profilePicUrl);
    } catch (error) {
      const axiosError = error as AxiosError;

      if (axiosError.response && axiosError.response.data) {
        const errorData = axiosError.response.data as getProfileResponse;
        setMessage(errorData.message);
      } else {
        setMessage("An unknown error occurred");
      }
    }
  };

  const handleGoToRecipes = async () => {
    console.log("Navigating to recipes page");
    navigate(`/recipes`);
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const formData = new FormData();
      formData.append("profile_picture", file);

      try {
        const response = await axios.post(
          "http://127.0.0.1:5000/profile/change_profile_pic/",
          formData,
          {
            withCredentials: true,
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        const updatedProfilePicUrl = response.data.profile_picture;
        setProfilePicUrl(updatedProfilePicUrl);
        setMessage("Profile picture updated successfully!");
        getProfilePic();
      } catch (error) {
        const axiosError = error as AxiosError;
        if (axiosError.response && axiosError.response.data) {
          const errorData = axiosError.response.data as getUpdateResponse;
          setMessage(errorData.message);
        } else {
          setMessage("An error occurred while updating the profile picture.");
        }
      }
    }
  };

  const handleOpenPfpModal = () => {
    setOpenPfpModal(true);
  };

  const handleClosePfpModal = () => {
    setOpenPfpModal(false);
  };

  const handleChangePfp = () => {
    document.getElementById("profile-picture-input")?.click();
    handleClosePfpModal();
  };

  const handleRemovePfp = async () => {
    handleClosePfpModal();
    try {
      const response = await axios.post(
        "http://127.0.0.1:5000/profile/remove_profile_pic/",
        {},
        { withCredentials: true }
      );
      setProfilePicUrl(null);
      setMessage("Profile picture removed successfully!");
      getProfilePic();
    } catch (error) {
      const axiosError = error as AxiosError;
      if (axiosError.response && axiosError.response.data) {
        const errorData = axiosError.response.data as getDeleteResponse;
        setMessage(errorData.message);
      } else {
        setMessage("An unknown error occurred");
      }
    }
  };

  return (
    <>
      <h1>This is a profile page!!</h1>{" "}
      {/* TODO: replace with fuller account information */}
      <h2>This is {username}'s profile!</h2>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          marginBottom: "16px",
          marginLeft: "175px",
          cursor: "pointer",
          width: "150px",
          height: "150px",
          borderRadius: "50%",
          border: "2px solid #ccc",
        }}
        onClick={handleOpenPfpModal}
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
        onChange={handleFileChange}
        style={{ display: "none" }}
        id="profile-picture-input"
      />
      <Modal open={openPfpModal} onClose={handleClosePfpModal}>
        <Box sx={modalStyle}>
          <Button onClick={handleChangePfp} fullWidth>
            Change Profile Picture
          </Button>
          <Button onClick={handleRemovePfp} fullWidth color="error">
            Remove Profile Picture
          </Button>
        </Box>
      </Modal>
      <Button onClick={handleGoToRecipes} variant="contained" color="primary">
        Recipes
      </Button>
      <Button
        onClick={() => navigate("/settings")}
        variant="contained"
        color="primary"
      >
        Settings
      </Button>
      <p> Recent Achievements: </p>
      {achievements.map((achievement) => (
        <div key={achievement.id}>
          <button>
            <img
              src={achievement.image}
              width="100"
              onClick={() => navigate(`/achievements/${achievement.id}`)} //need to change to modal code
            />
          </button>
          <p> {achievement.title}</p>
        </div>
      ))}
    </>
  );
};

export default Profile;

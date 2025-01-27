import axios, { AxiosError } from "axios";
import FolderIcon from "@mui/icons-material/Folder";
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, ChangeEvent } from "react";
import { Avatar, Button, TextField, Container } from "@mui/material"; //matui components
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
        setProfilePicUrl(profilePicturePath);
      }
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

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const fileUrl = URL.createObjectURL(file);
      setProfilePicUrl(fileUrl);
    }
  };

  return (
    <>
      <h1>This is a profile page!!</h1>{" "}
      {/* TODO: replace with fuller account information */}
      <h2>This is {username}'s profile!</h2>
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
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          marginBottom: "16px",
          marginLeft: "50px",
          cursor: "pointer",
          width: "150px",
          height: "150px",
          borderRadius: "50%",
          border: "2px solid #ccc",
        }}
        onClick={() =>
          document.getElementById("profile-picture-input")?.click()
        }
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
      <p> Recent Achievements: </p>
      {achievements.map((achievement) => (
        <div key={achievement.id}>
          <button>
            <img
              src={achievement.image}
              width="100"
              onClick={() => navigate(`/achievements/${achievement.id}`)}
            />
          </button>
          <p> {achievement.title}</p>
        </div>
      ))}
    </>
  );
};

export default Profile;

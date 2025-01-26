import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import React from "react";
import { Button, TextField, Container } from "@mui/material"; //matui components
import Achievement from "./Achievements";


interface ProfileResponse {
    lname: string;
    fname: string;
    username: string;
    achievements: Achievement[];
}

const Profile: React.FC = () => {

    const navigate = useNavigate(); //for navigation

    let { id } = useParams<{ id: string }>();
    if (id == undefined) {
        id = "1";
    }
    const [lname, setLname] = React.useState<String>();
    const [fname, setFname] = React.useState<String>();
    const [username, setUsername] = React.useState<String>();
    const [achievements, setAchievements] = React.useState<Achievement[]>([]);

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
    }

React.useEffect(() => {
    getResponse();
}, []);

const handleGoToRecipes = async () => {
    console.log("Navigating to recipes page");
    navigate(`/recipes`);
  }

    return (
        <>
            <h1>This is a profile page!!</h1> {/* TODO: replace with fuller account information */}
            <h2>This is {username}'s profile!</h2>

            <Button
                onClick={handleGoToRecipes}
                variant="contained"
                color="primary"
            >
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
            <button><img src={achievement.image} width = "100" onClick={() => navigate(`/achievements/${achievement.id}`)} /></button>
            <p> {achievement.title}</p>
          </div> 
          ))}
        </>
    )
}

export default Profile;
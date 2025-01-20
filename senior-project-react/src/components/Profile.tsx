import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import React from "react";
import { Button, TextField, Container } from "@mui/material"; //matui components

interface ProfileResponse {
    lname: string;
    fname: string;
    username: string;
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

    const getResponse = async () => {
        const response = await axios.post(
            `http://127.0.0.1:5000/profile/${id}`
        );
        const data: ProfileResponse = response.data;
        setLname(data.lname);
        setFname(data.fname);
        setUsername(data.username);
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
        </>
    )
}

export default Profile;
import React from "react";
import { useNavigate } from "react-router-dom"; // React Router for nav
import { Button, TextField, Container } from "@mui/material"; //matui components

const Recipes: React.FC = () => {

  const navigate = useNavigate(); //for navigation

  const handleGoToProfile = async () => {
    console.log("Navigating to profile page");
    navigate(`/profile`); // TODO: get current user and put that here instead
  }

  const handleGoToChallenges = async () => {
    console.log("Navigating to challenges page");
    navigate(`/challenges`);
  }

  const handleGoToAchievements = async() => {
    console.log("Navigating to achievements page");
    navigate(`/achievements`)
  }

  return (
    <div>
      <h1>Welcome to the Recipes Page!</h1>
      <p>Here are your delicious recipes.</p>
      <Button
        onClick={handleGoToProfile}
        variant="contained"
        color="primary"
      >
        Profile
      </Button>
      <Button
        onClick={handleGoToChallenges}
        variant="contained"
        color="primary"
      >
        Challenges
      </Button>
      <Button
        onClick={handleGoToAchievements}
        variant="contained"
        color="primary"
      >
        Achievements
      </Button>
    </div>
  );
};

export default Recipes;

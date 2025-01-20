import React from "react";
import { useNavigate } from "react-router-dom"; // React Router for nav
import { Button, TextField, Container } from "@mui/material"; //matui components

function Recipe() {
   // TODO: figure out how to use bootstrap with react
  return (
    <>
      <div className="col-xs-12 col-sm-6 col-md-4 col-lg-4 col-xl-4" /* style="padding-bottom: 20px;" */ >
        <p>This is a recipe.</p>
      </div>
    </>
  );
}

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
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" />
      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.1/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-F3w7mX95PdgyTmZZMECAngseQB83DfGTowi0iMjiWaeVhAn4FJkqJByhZMI3AhiU" crossOrigin="anonymous" />

      <h1>Welcome to the Recipes Page!</h1>
      <p>Here are your delicious recipes.</p>

      <div className="container">
        <div className="row">
          <i className="bi-diamond-fill"></i>
          <Recipe />
        </div>
      </div>

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

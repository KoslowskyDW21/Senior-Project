import React, { useState } from "react";
import axios, { AxiosError } from "axios";
import { useNavigate } from "react-router-dom"; // React Router for nav
import { Button, TextField, Container } from "@mui/material"; //matui components

interface Recipe {
  id: number;
  name: string;
  difficulty: "1" | "2" | "3" | "4" | "5";
  image_src: string;
}

function Difficulty({ difficulty }) {
  if (difficulty === "1") {
    return (
      <>
        <i className="bi-diamond-fill"></i>
        <i className="bi-diamond"></i>
        <i className="bi-diamond"></i>
        <i className="bi-diamond"></i>
        <i className="bi-diamond"></i>
      </>
    );
  }
  else if (difficulty === "2") {
    return (
      <>
        <i className="bi-diamond-fill"></i>
        <i className="bi-diamond-fill"></i>
        <i className="bi-diamond"></i>
        <i className="bi-diamond"></i>
        <i className="bi-diamond"></i>
      </>
    );
  }
  else if (difficulty === "3") {
    return (
      <>
        <i className="bi-diamond-fill"></i>
        <i className="bi-diamond-fill"></i>
        <i className="bi-diamond-fill"></i>
        <i className="bi-diamond"></i>
        <i className="bi-diamond"></i>
      </>
    );
  }
  else if (difficulty === "4") {
    return (
      <>
        <i className="bi-diamond-fill"></i>
        <i className="bi-diamond-fill"></i>
        <i className="bi-diamond-fill"></i>
        <i className="bi-diamond-fill"></i>
        <i className="bi-diamond"></i>
      </>
    );
  }
  else {
    return (
      <>
        <i className="bi-diamond-fill"></i>
        <i className="bi-diamond-fill"></i>
        <i className="bi-diamond-fill"></i>
        <i className="bi-diamond-fill"></i>
        <i className="bi-diamond-fill"></i>
      </>
    );
  }
}

function Recipe({ name, difficulty, image }) {
  return (
    <div className="col-xs-12 col-sm-6 col-md-4 col-lg-4 col-xl-4" /* style="padding-bottom: 20px;" */ >
      <div className="card-header">
        <p>{name}</p>
      </div>
      <div className="card-body">
        <Difficulty difficulty={difficulty} />
      </div>
      <img src={image} alt={name} className="card-img-bottom" />
    </div>
  );
}

const Recipes: React.FC = () => {
  let recipes: Array<Recipe> = [];
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

  async function loadRecipes() {
    try {
      const response = await axios.post("");
      recipes = response.data;
    }
    catch (error) {

    }
  }

  React.useEffect(() => { loadRecipes(); }, []);

  return (
    <div>
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" />
      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.1/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-F3w7mX95PdgyTmZZMECAngseQB83DfGTowi0iMjiWaeVhAn4FJkqJByhZMI3AhiU" crossOrigin="anonymous" />

      <h1>Welcome to the Recipes Page!</h1>
      <p>Here are your delicious recipes.</p>

      <div className="container">
        <div className="row">
          <Recipe name="Spaghetti" difficulty="1" image="" />
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

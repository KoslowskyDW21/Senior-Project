import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // React Router for nav
import {
  Button,
  ButtonBase,
  Card,
  CardHeader,
  CardMedia,
  CardActionArea,
  Box,
} from "@mui/material"; // matui components
import Grid from "@mui/material/Grid2";
import Header from "./Header";

interface Recipe {
  id: number;
  recipe_name: string;
  difficulty: "1" | "2" | "3" | "4" | "5";
  xp_amount: number;
  rating: number;
  image: string;
}

function Difficulty({ difficulty }) {
  const diamondStyle = {
    width: 24,
    height: 24,
    backgroundColor: "black",
    transform: "rotate(45deg)",
    marginRight: 2,
  };

  const renderDiamonds = (num) => {
    const diamonds = [];
    for (let i = 0; i < 5; i++) {
      diamonds.push(
        <Box
          key={i}
          sx={{
            ...diamondStyle,
            opacity: i < num ? 1 : 0.1,
          }}
        />
      );
    }
    return diamonds;
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center", // Centers the diamonds
        padding: "2px",
      }}
    >
      {difficulty === "1" && renderDiamonds(1)}
      {difficulty === "2" && renderDiamonds(2)}
      {difficulty === "3" && renderDiamonds(3)}
      {difficulty === "4" && renderDiamonds(4)}
      {difficulty === "5" && renderDiamonds(5)}
    </Box>
  );
}

// @ts-expect-error
function Recipe({ id, name, difficulty, image }) {
  const navigate = useNavigate(); // for navigation
  id = id.toString(); // hacky insurance against mistakes

  const handleGoToRecipe = async () => {
    console.log(`Navigating to recipe page of recipe with id=${id}`);
    navigate(`/recipes/${id}`);
  };
  return (
    <Card
      variant="outlined"
      sx={{ display: "flex", flexDirection: "column", height: "100%" }}
    >
      <CardActionArea onClick={handleGoToRecipe}>
        <CardHeader
          title={name}
          subheader={Difficulty({ difficulty })}
          sx={{
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
            flexShrink: 0,
            width: "90%",
            fontSize: "clamp(1rem, 4vw, 2rem)",
          }}
        />
        <CardMedia
          component="img"
          image={image}
          sx={{
            height: 200,
            objectFit: "cover",
            width: "100%",
          }}
        />
      </CardActionArea>
    </Card>
  );
}

const Recipes: React.FC = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);

  const navigate = useNavigate();

  const handleGoToChallenges = async () => {
    navigate(`/challenges`);
  };
  const handleGoToGroups = async () => {
    navigate(`/groups`);
  };

  async function loadRecipes() {
    try {
      const response = await axios.post("http://127.0.0.1:5000/recipes/");
      const data = response.data;
      setRecipes(data);
    } catch (error) {
      console.error("Unable to fetch recipes", error);
    }
  }

  const filterRecipes = (recipes: Recipe[]) => {
    const urlParams = new URLSearchParams(location.search);
    const searchQuery = urlParams.get("search")?.toLowerCase() || "";
    if (searchQuery) {
      const filtered = recipes.filter((recipe) =>
        recipe.recipe_name.toLowerCase().includes(searchQuery)
      );
      setFilteredRecipes(filtered);
    } else {
      setFilteredRecipes(recipes); 
    }
  };

  React.useEffect(() => {
    loadRecipes();
  }, []);

  React.useEffect(() => {
    filterRecipes(recipes);
  }, [location.search, recipes]); 

  return (
    <div>
      <Header title="Recipes" />
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-start",
          alignItems: "center",
          fontSize: "24px",
          fontWeight: "bold",
          textAlign: "center",
          mt: 4,
        }}
      ></Box>
      <main role="main" style={{ paddingTop: "100px" }}>
        <Grid container spacing={3}>
          {filteredRecipes.map((recipe) => (
            <Grid size={3} key={recipe.id}> 
              <Box
                sx={{
                  border: "2px solid rgb(172, 169, 169)",
                  borderRadius: 2,
                  boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.1)",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    borderColor: "#1976d2",
                    boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
                  },
                  display: "flex",
                  flexDirection: "column", // Ensure that content is aligned vertically
                  height: "100%", // Make sure box takes full height
                }}
              >
                <Recipe
                  id={recipe.id}
                  name={recipe.recipe_name}
                  difficulty={recipe.difficulty}
                  image={recipe.image}
                />
              </Box>
            </Grid>
          ))}
        </Grid>
      </main>
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "space-around",
          padding: "10px",
          backgroundColor: "#fff",
          boxShadow: "0px -2px 5px rgba(0, 0, 0, 0.1)",
          zIndex: 1000,
        }}
      >
        <Button variant="outlined" color="primary" sx={{ flex: 1 }}>
          Recipes
        </Button>
        <Button
          onClick={handleGoToChallenges}
          variant="contained"
          color="primary"
          sx={{ flex: 1 }}
        >
          Challenges
        </Button>
        <Button
          onClick={handleGoToGroups}
          variant="contained"
          color="primary"
          sx={{ flex: 1 }}
        >
          Community
        </Button>
      </div>
    </div>
  );
};

export default Recipes;

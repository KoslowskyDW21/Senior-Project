import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { Button, Card, CardHeader, CardMedia, CardActionArea, Box } from "@mui/material";
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
    <Box sx={{ display: "flex", justifyContent: "center", padding: "2px" }}>
      {difficulty === "1" && renderDiamonds(1)}
      {difficulty === "2" && renderDiamonds(2)}
      {difficulty === "3" && renderDiamonds(3)}
      {difficulty === "4" && renderDiamonds(4)}
      {difficulty === "5" && renderDiamonds(5)}
    </Box>
  );
}

function Recipe({ id, name, difficulty, image }) {
  const navigate = useNavigate();
  id = id.toString();

  const handleGoToRecipe = async () => {
    console.log(`Navigating to recipe page of recipe with id=${id}`);
    navigate(`/recipes/${id}`);
  };

  return (
    <Card variant="outlined" sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <CardActionArea onClick={handleGoToRecipe}>
        <CardHeader
          title={name}
          subheader={<Difficulty difficulty={difficulty} />}
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
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const hasMounted = useRef(false);
  const location = useLocation();

  const navigate = useNavigate();
  const hasScrolled = useRef(false);

  const handleGoToChallenges = async () => {
    navigate(`/challenges`);
  };
  const handleGoToGroups = async () => {
    navigate(`/groups`);
  };

  const getSearchQuery = () => {
    const queryParams = new URLSearchParams(location.search);
    return queryParams.get("search") || "";
  };
  const getSelectedAllergens = () => {
    const queryParams = new URLSearchParams(location.search);
    return queryParams.get("allergens")?.split(",") || [];  
  };

  const loadRecipes = async () => {
    if (loading || page > totalPages) return;
    const searchQuery = getSearchQuery();
    const allergenQuery = getSelectedAllergens();
    setLoading(true);
    try {
      const response = await axios.post("http://127.0.0.1:5000/recipes/", null, {
        params: {
          page: page,
          per_page: 20,
          search_query: searchQuery,
          allergen_query: allergenQuery
        },
      });

      const { recipes: newRecipes, total_pages } = response.data;
      setRecipes((prevRecipes) => [...prevRecipes, ...newRecipes]);
      setTotalPages(total_pages);
      setPage((prevPage) => prevPage + 1);
    } catch (error) {
      console.error("Unable to fetch recipes", error);
    } finally {
      setLoading(false);
      hasScrolled.current = false; 
    }
  };


  useEffect(() => {
    if (hasMounted.current) return;
    hasMounted.current = true;
    window.scrollTo(0, 0)
    setRecipes([]);  
    setPage(1);  
    loadRecipes();  
  }, [location.search]);

  // Infinite scroll handler
  const handleScroll = () => {
    if (loading || page > totalPages || hasScrolled.current) return;

    const container = document.getElementById("scroll-container");
    if (container) {
      const nearBottom = container.scrollHeight - container.scrollTop === container.clientHeight;

      if (nearBottom) {
        hasScrolled.current = true;
        loadRecipes();
      }
    }
  };

  useEffect(() => {
    const container = document.getElementById("scroll-container");
    if (container) {
      container.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (container) {
        container.removeEventListener("scroll", handleScroll);
      }
    };
  }, [loading, page, totalPages]);

  return (
    <div>
      <Header title="Recipes" searchLabel="Search for recipes" searchVisible={true} />
      <Box
        id="scroll-container"
        sx={{ overflowY: "scroll", height: "80vh", mt: 4 }}
      >
        <main role="main" style={{ paddingTop: "60px" }}>
          <Grid container spacing={3}>
            {recipes.map((recipe) => (
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
                    flexDirection: "column",
                    height: "100%",
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
      </Box>
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
        <Button onClick={handleGoToChallenges} variant="contained" color="primary" sx={{ flex: 1 }}>
          Challenges
        </Button>
        <Button onClick={handleGoToGroups} variant="contained" color="primary" sx={{ flex: 1 }}>
          Community
        </Button>
      </div>
    </div>
  );
};

export default Recipes;

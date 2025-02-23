import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Button,
  Card,
  CardHeader,
  CardMedia,
  CardActionArea,
  Box,
  useMediaQuery,
} from "@mui/material";
import Grid2 from "@mui/material/Grid2";
import Header from "./Header";
import debounce from "lodash.debounce";
import Typography from "@mui/material/Typography";

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
    width: "clamp(5px, 2vw, 24px)", // Min size 16px, max size 24px, grows based on viewport width
    height: "clamp(5px, 2vw, 24px)",
    backgroundColor: "black",
    transform: "rotate(45deg)",
    marginRight: "clamp(4px, 1vw, 8px)",
  };

  const renderDiamonds = (num) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Box key={i} sx={{ ...diamondStyle, opacity: i < num ? 1 : 0.1 }} />
    ));
  };

  return (
    <Box sx={{ display: "flex", justifyContent: "center", padding: "0px" }}>
      {renderDiamonds(Number(difficulty))}
    </Box>
  );
}

function Recipe({ id, name, difficulty, image }) {
  const navigate = useNavigate();

  const handleGoToRecipe = () => {
    console.log(`Navigating to recipe page of recipe with id=${id}`);
    navigate(`/recipes/${id}`);
  };

  return (
    <Card
      variant="outlined"
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        flexShrink: 1,
      }}
    >
      <CardActionArea onClick={handleGoToRecipe}>
        <CardHeader
          title={
            <Typography
              variant="h5"
              sx={{ fontSize: "clamp(1rem, 1.5vw, 2rem)", textAlign: "center" }}
            >
              {name}
            </Typography>
          }
          subheader={<Difficulty difficulty={difficulty} />}
          sx={{
            justifyContent: "center",
            alignItems: "center",
            flexShrink: 1,
            width: "auto",
          }}
        />
        <CardMedia
          component="img"
          image={image}
          sx={{ height: "auto", objectFit: "contain", width: "100%" }}
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
  const hasScrolled = useRef(false);
  const location = useLocation();
  const navigate = useNavigate();

  const getSearchQuery = () =>
    new URLSearchParams(location.search).get("search") || "";
  const [debouncedSearch, setDebouncedSearch] = useState(getSearchQuery());

  const debouncedSetSearch = debounce((query) => {
    setDebouncedSearch(query);
  }, 300);

  useEffect(() => {
    debouncedSetSearch(getSearchQuery());
    return () => debouncedSetSearch.cancel();
  }, [location.search]);

  useEffect(() => {
    setRecipes([]);
    setPage(1);
    setTotalPages(1);
    loadRecipes(true);
  }, [debouncedSearch]);

  useEffect(() => {
    loadRecipes(page === 1);
  }, [page]);

  const loadRecipes = async (reset = false) => {
    if (loading || page > totalPages) return;
    setLoading(true);

    try {
      const response = await axios.post(
        "http://127.0.0.1:5000/recipes/",
        null,
        {
          params: {
            page: reset ? 1 : page,
            per_page: 20,
            search_query: debouncedSearch,
          },
        }
      );

      const { recipes: newRecipes, total_pages } = response.data;

      setRecipes((prev) => (reset ? newRecipes : [...prev, ...newRecipes]));
      setTotalPages(total_pages);
    } catch (error) {
      console.error("Unable to fetch recipes", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    hasScrolled.current = false;
  }, [recipes]);

  const handleScroll = () => {
    if (loading || page >= totalPages || hasScrolled.current) return;

    const container = document.getElementById("scroll-container");
    if (container) {
      const nearBottom =
        container.scrollHeight - container.scrollTop <=
        container.clientHeight + 10;
      if (nearBottom) {
        hasScrolled.current = true;
        setPage((prevPage) => prevPage + 1);
      }
    }
  };

  useEffect(() => {
    const container = document.getElementById("scroll-container");
    if (container) container.addEventListener("scroll", handleScroll);
    return () => container?.removeEventListener("scroll", handleScroll);
  }, [loading, page, totalPages]);

  const isSmallScreen = useMediaQuery("(max-width:600px)");
  const isMediumScreen = useMediaQuery(
    "(min-width:600px) and (max-width:900px)"
  );

  return (
    <div>
      <Header title="Recipes" searchLabel="Search for recipes" searchVisible />
      <Box
        id="scroll-container"
        sx={{
          overflowY: "scroll",
          height: "calc(100vh - 60px)",
          mt: 4,
          width: "100%",
        }}
      >
        <main role="main" style={{ paddingTop: "60px" }}>
          <Grid2 container spacing={3}>
            {recipes.map((recipe) => (
              <Grid2
                key={recipe.id}
                size={isSmallScreen ? 4 : isMediumScreen ? 4 : 3}
              >
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
                    minHeight: "200px", // Base minimum height
                    "@media (min-width:600px)": {
                      maxHeight: "300px", // Adjust the minHeight for medium screens
                    },
                    "@media (min-width:900px)": {
                      maxHeight: "350px", // Adjust the minHeight for larger screens
                    },
                  }}
                >
                  <Recipe
                    id={recipe.id}
                    name={recipe.recipe_name}
                    difficulty={recipe.difficulty}
                    image={recipe.image}
                  />
                </Box>
              </Grid2>
            ))}
          </Grid2>
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
        <Button
          onClick={() => navigate("/challenges")}
          variant="contained"
          color="primary"
          sx={{ flex: 1 }}
        >
          Challenges
        </Button>
        <Button
          onClick={() => navigate("/groups")}
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

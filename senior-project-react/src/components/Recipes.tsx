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
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  FormHelperText,
  SelectChangeEvent,
} from "@mui/material";
import Grid2 from "@mui/material/Grid2";
import Header from "./Header";
import debounce from "lodash.debounce";
import Typography from "@mui/material/Typography";
import config from "../config.js";

interface Recipe {
  id: number;
  recipe_name: string;
  difficulty: "1" | "2" | "3" | "4" | "5";
  xp_amount: number;
  rating: number;
  image: string;
}

interface DietaryRestrictions {
  dietaryRestrictions: [];
  userDietaryRestrictions: [];
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
  const [noResultsFound, setNoResultsFound] = useState(false);
  const hasScrolled = useRef(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState<string>("");

  const getSearchQuery = () =>
    new URLSearchParams(location.search).get("search") || "";

  const [dietaryRestrictions, setDietaryRestrictions] = useState<[]>([]);
  const [userDietaryRestrictions, setUserDietaryRestrictions] = useState<[]>([]);
  const [selectedDietaryRestrictions, setSelectedDietaryRestrictions] = useState<string[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  

  const handleDietaryRestrictionsChange = (
    event: SelectChangeEvent<typeof selectedDietaryRestrictions>
  ) => {
    const selectedNames = event.target.value;
    const selectedIdz = dietaryRestrictions
      .filter((dietaryRestriction) =>
        selectedNames.includes(dietaryRestriction.name)
      )
      .map((dietaryRestriction) => dietaryRestriction.id);
    setSelectedDietaryRestrictions(selectedNames);
    setSelectedIds(selectedIdz);
  };

  useEffect(() => {
    // If dietary restrictions or page change, reload recipes
    setRecipes([]); // Clear previous recipes
    setPage(1); // Reset page to 1
    setTotalPages(1); // Reset total pages
    setNoResultsFound(false); // Reset no results state
    loadRecipes(true); // Load recipes with the initial settings
  }, [selectedDietaryRestrictions]);
  
  

  // Use the searchQuery directly without debouncing
  const debouncedSearch = searchQuery;

  // Handle search changes and trigger navigation immediately
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    setSearchQuery(query);

    // Update URL with the new search query
    if (query) {
      navigate({
        pathname: location.pathname,
        search: `?search=${query}`,
      });
    } else {
      navigate({
        pathname: location.pathname,
        search: "",
      });
    }
  };

  // Effect to load recipes when the search query or page changes
  useEffect(() => {
    setRecipes([]); // Clear previous results
    setPage(1); // Reset to first page
    setTotalPages(1); // Reset total pages
    setNoResultsFound(false); // Reset no results state
    loadRecipes(true); // Load recipes with the initial query
  }, [debouncedSearch]);

  useEffect(() => {
    loadRecipes(page === 1);
  }, [page]);

  const loadRecipes = async (reset = false) => {
    if (loading || page > totalPages) return;
    setLoading(true);
  
    try {
      const response = await axios.post(`${config.serverUrl}/recipes/`, null, {
        params: {
          page: reset ? 1 : page,
          per_page: 20,
          search_query: debouncedSearch || "", 
          dietary_restrictions: selectedIds, 
        },
      });
  
      const { recipes: newRecipes, total_pages } = response.data;
  
      if (newRecipes.length === 0) {
        setNoResultsFound(true);
      } else {
        setNoResultsFound(false);
      }
  
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

  useEffect(() => {
    getDietaryRestrictions(); 
  }, []);

  React.useEffect(() => {
      const preselectedDietaryRestrictions = dietaryRestrictions
        .filter((dietaryRestriction) =>
          userDietaryRestrictions.some(
            (userDietaryRestriction) =>
              userDietaryRestriction.restriction_id === //use the actual ID attribute from the SQL table
              dietaryRestriction.id
          )
        )
        .map((dietaryRestriction) => dietaryRestriction.name);
      const selectedIdz = dietaryRestrictions
      . filter((dietaryRestriction) =>
          preselectedDietaryRestrictions.includes(dietaryRestriction.name)
        )
        .map((dietaryRestriction) => dietaryRestriction.id);
  
      setSelectedDietaryRestrictions(preselectedDietaryRestrictions);
      setSelectedIds(selectedIdz);
    }, [dietaryRestrictions, userDietaryRestrictions]);


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

  const getDietaryRestrictions = async () => {
    try {
      const response = await axios.post(
        `${config.serverUrl}/settings/dietary_restrictions/`,
        {},
        { withCredentials: true }
      );
      console.log("response: ", response);
      const data: DietaryRestrictions = response.data;
      console.log("data: " + data);
      setDietaryRestrictions(data.dietaryRestrictions);
      setUserDietaryRestrictions(data.userDietaryRestrictions);
    } catch (error) {
      console.error("Could not fetch dietary restrictions:", error);
    }
  };

  const isSmallScreen = useMediaQuery("(max-width:600px)");
  const isMediumScreen = useMediaQuery(
    "(min-width:600px) and (max-width:900px)"
  );

  return (
    <div>
      <Header title="Recipes" />
      <Box
        mt={{ xs: 10, sm: 14, md: 14 }}
        textAlign="center"
        display="flex"
        justifyContent="center"
        sx={{ flexGrow: 1 }}
      >
        <TextField
          label="Search for recipes"
          variant="outlined"
          fullWidth
          value={searchQuery}
          onChange={handleSearchChange}
          sx={{
            width: "100%",
          }}
        />
      </Box>
      <Box mt={2} display="flex" justifyContent="center">
        <FormControl variant="filled" sx={{ m: 1, width: 250 }} size="small">
          <InputLabel id="dietary_restriction-select-label">
            Dietary Restrictions
          </InputLabel>
          <Select
            labelId="dietary_restriction-select-label"
            multiple
            value={selectedDietaryRestrictions}
            onChange={handleDietaryRestrictionsChange}
            renderValue={(selected) => selected.join(", ")}
            displayEmpty
          >
            <MenuItem value="" disabled>
              <em>Choose a dietary restriction</em>
            </MenuItem>
            {dietaryRestrictions.map((restriction) => (
              <MenuItem key={restriction.id} value={restriction.name}>
                <Checkbox
                  checked={selectedDietaryRestrictions.includes(restriction.name)}
                />
                <ListItemText primary={restriction.name} />
              </MenuItem>
            ))}
          </Select>
          <FormHelperText>Select Dietary Restrictions</FormHelperText>
        </FormControl>
      </Box>

      <Box
        id="scroll-container"
        sx={{
          overflowY: "scroll",
          height: "calc(100vh - 60px)",
          mt: 0,
          width: "100%",
        }}
      >
        <main role="main" style={{ paddingTop: "60px" }}>
          {noResultsFound ? (
            <Typography variant="h6" textAlign="center">
              No recipes found for "{debouncedSearch}".
            </Typography>
          ) : (
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
          )}
        </main>
      </Box>

      {/* Footer buttons */}
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

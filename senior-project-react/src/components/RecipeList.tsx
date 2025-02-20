import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Button,
  Grid2,
  TextField,
  IconButton,
  Box,
  Card,
  CardActionArea,
  CardHeader,
  CardMedia,
  Select,
  FormControl,
  InputLabel,
  MenuItem,
  SelectChangeEvent
} from "@mui/material"; //matui components
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import axios, { AxiosError } from "axios";

interface Recipe {
  id: number;
  recipe_name: string;
  xp_amount: number;
  difficulty: "1" | "2" | "3" | "4" | "5";
  image: string;
}

interface RecipeList {
  id: number;
  name: string;
  belongs_to: number;
}

interface AddRecipeToListResponse {
  message: string;
}

interface RemoveRecipeFromListResponse {
  message: string;
}

// @ts-expect-error
function Difficulty({ difficulty }) {
  const diamondStyle = {
    width: 24,
    height: 24,
    backgroundColor: "black",
    transform: "rotate(45deg)",
    marginRight: 2,
  };

  // @ts-expect-error
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
        flexDirection: "row",
        justifyContent: "center",
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

const RecipeLists: React.FC = () => {
  const [recipes, setRecipes] = React.useState<Recipe[]>([]);
  const [allRecipes, setAllRecipes] = React.useState<Recipe[]>([]);
  const [recipe_list, setRecipe_list] = React.useState<RecipeList>();
  const [searchQuery, setSearchQuery] = React.useState<String>("");
  const [recipeToAddId, setRecipeToAddId] = React.useState<String>("");
  const { id } = useParams<{ id: string }>();

  const navigate = useNavigate();

  const handleGoToRecipeLists = async () => {
    console.log("Navigating to all recipe lists page");
    navigate(`/recipe-lists/`);
  };

  const handleGoToRecipes = async () => {
    console.log("Navigating to all recipes page");
    navigate(`/recipes`);
  };

  const getRecipesAndThisList = async () => {
    try {
      const response = await axios.get(
        `http://127.0.0.1:5000/recipe_lists/recipes/${id}`
      );
      const resp_recipes: Recipe[] = response.data;
      console.log(resp_recipes);
      setRecipes(resp_recipes);
      const response2 = await axios.get(
        `http://127.0.0.1:5000/recipe_lists/info/${id}`
      );
      const resp_recipe_list: RecipeList = response2.data;
      console.log(resp_recipe_list);
      setRecipe_list(resp_recipe_list);
    } catch (error) {
      console.error("Error fetching recipeList: ", error);
    }
  };

  const getAllRecipes = async () => {
    try {
      const response = await axios.get(
        `http://127.0.0.1:5000/recipes/all`
      );
      setAllRecipes(response.data.recipes);
    } catch (error) {
      console.error("Error fetching all recipes ", error);
    }
  }

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const filteredRecipes = recipes.filter((recipe) =>
    recipe.recipe_name.toLowerCase().includes(searchQuery.toLocaleLowerCase())
  );

  // @ts-expect-error
  function Recipe({ rid, name, difficulty, image, lid }) {
    const [message, setMessage] = React.useState<String>();
    rid = rid.toString(); // hacky insurance against mistakes

    const handleGoToRecipe = async () => {
      console.log(`Navigating to recipe page of recipe with id=${rid}`);
      navigate(`/recipes/${rid}`);
    };

    const handleRemoveRecipeFromList = async () => {
      if (rid == undefined) {
        return;
      }
      console.log(`Trying to remove recipe ${rid} from this list`);
      const formData = new FormData();
      formData.append("rid", rid.toString());
      formData.append("lid", lid);
      try {
        const response = await axios.post(
          "http://127.0.0.1:5000/recipe_lists/remove-recipe-from-list",
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        const data: RemoveRecipeFromListResponse = response.data;
        setMessage(data.message);
        console.log(data.message);
        getRecipesAndThisList();
      } catch (error) {
        const axiosError = error as AxiosError;
        if (axiosError.response && axiosError.response.data) {
          const errorData = axiosError.response
            .data as RemoveRecipeFromListResponse;
          setMessage(errorData.message);
        } else {
          setMessage("An unknown error occurred--how spooky");
        }
      }

      async function handleAddRecipeToList(event: SelectChangeEvent) {
        console.log(`Trying to add recipe id=${event.target.value} to list`);
        if (event.target.value == undefined) {
          console.error("The ID of the recipe to add is undefined");
        }
        try {
          const formData = new FormData();
          formData.append("rid", event.target.value);
          formData.append("lid", id);
          const response = await axios.post(`http://127.0.0.1:5000/recipe_lists/add-recipe-to-list`, formData,
            { headers: { "Content-Type": "multipart/form-data" }}
          );
          const data: AddRecipeToListResponse = response.data;
          setMessage(data.message);
          console.log(data.message);
        } catch (error) {
          const axiosError = error as AxiosError;
          if (axiosError.response && axiosError.response.data) {
              const errorData = axiosError.response.data as AddRecipeToListResponse;
              setMessage(errorData.message);
          } else {
              setMessage("An unknown error occurred");
          }
        }
      }

      function RecipesDropdown({ allRecipes }) {
        if (allRecipes.length == 0) {
          return <p>Loading...</p>
        } else {
          return (
            <>
              <FormControl
                sx={{width: 400}}
              >
                <InputLabel>Add a recipe</InputLabel>
                <Select
                  value={recipeToAddId}
                  onChange={handleAddRecipeToList}
                >
                  {
                    allRecipes.map((recipe: Recipe) => {
                      return <MenuItem value={recipe.id}>{recipe.recipe_name}</MenuItem>
                    })
                  };
                </Select>
              </FormControl>
            </>
          )
        }
      }
    };

    return (
      <>
        <Card variant="outlined">
          <CardActionArea onClick={handleGoToRecipe}>
            <CardHeader title={name} subheader={Difficulty({ difficulty })} />
            <CardMedia component="img" image={image} />
          </CardActionArea>
        </Card>
        <Button
          variant="contained"
          color="error"
          onClick={handleRemoveRecipeFromList}
        >
          Delete
        </Button>
      </>
    );
  } // end of embedded Recipe component definition

  React.useEffect(() => {
    getRecipesAndThisList();
  }, []);

  React.useEffect(() => {
    getAllRecipes();
  }, []);

  if (!recipe_list) {
    return (
      <>
        <p>Loading...</p>
      </>
    );
  }

  return (
    <>
      {/* Navbar */}
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          display: "flex",
          alignItems: "center",
          padding: "10px 20px",
          backgroundColor: "#fff",
          boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.1)",
          zIndex: 1000,
          height: "100px",
          justifyContent: "space-between",
        }}
      >
        {/* Back button */}
        <IconButton
          onClick={() => navigate("/recipe-lists")}
          style={{ position: "absolute", top: 30, left: 30 }}
        >
          <ArrowBackIcon sx={{ fontSize: 30, fontWeight: "bold" }} />
        </IconButton>

        {/* Recipe list name */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            flexGrow: 1,
            alignItems: "center",
            fontSize: "24px",
            fontWeight: "bold",
          }}
        >
          <h1>{recipe_list.name}</h1>
        </Box>

        {/* Search bar */}
        <Box
          mt={4}
          mb={2}
          textAlign="center"
          display="flex"
          justifyContent="center"
          sx={{ flexGrow: 1 }}
        >
          <TextField
            label="Search Recipes"
            variant="outlined"
            fullWidth
            value={searchQuery}
            onChange={handleSearchChange}
            sx={{
              zIndex: 1001,
              width: 500,
            }}
          />
        </Box>
      </Box>{" "}
      {/* End of header bar */}
      {/* Spacer */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-start",
          alignItems: "center",
          fontSize: "24px",
          fontWeight: "bold",
          textAlign: "center",
          mt: 12,
        }}
      ></Box>

      {/* AllRecipesDropdown */}
      

      {/* Implements a grid view of recipes */}
      <Grid2 container spacing={3}>
        {filteredRecipes.map((recipe) => (
          <Grid2 size={4} key={recipe.id}>
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
              }}
            >
              <Recipe
                rid={recipe.id}
                lid={id}
                name={recipe.recipe_name}
                difficulty={recipe.difficulty}
                image={recipe.image}
              />
            </Box>
          </Grid2>
        ))}
      </Grid2>
      <br />
      <br />
      {/* Button to find more recipes (return to recipe page) */}
      <Button onClick={handleGoToRecipes} variant="contained" color="primary">
        Find Recipes
      </Button>
    </>
  );
};

export default RecipeLists;

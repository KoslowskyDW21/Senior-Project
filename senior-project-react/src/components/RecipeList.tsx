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
  SelectChangeEvent,
} from "@mui/material"; //matui components
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Snackbar, { SnackbarCloseReason } from "@mui/material/Snackbar";
import axios, { all, AxiosError } from "axios";
import CloseIcon from "@mui/icons-material/Close";
import config from "../config.js";
import Header from "./Header";

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

interface AddAllRecipesInListToShoppingListResponse {
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
  const [recipeToAddId, setRecipeToAddId] = React.useState<string>("");
  const [message, setMessage] = React.useState("");
  const [snackbarOpen, setSnackbarOpen] = React.useState(false);
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
        `${config.serverUrl}/recipe_lists/recipes/${id}`
      );
      const resp_recipes: Recipe[] = response.data;
      console.log(resp_recipes);
      setRecipes(resp_recipes);
      const response2 = await axios.get(
        `${config.serverUrl}/recipe_lists/info/${id}`
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
      const response = await axios.get(`${config.serverUrl}/recipes/all/`);
      setAllRecipes(response.data.recipes);
    } catch (error) {
      console.error("Error fetching all recipes ", error);
    }
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const filteredRecipes = recipes.filter((recipe) =>
    recipe.recipe_name.toLowerCase().includes(searchQuery.toLocaleLowerCase())
  );

  {
    /* Copy/pasted snackbar stuff */
  }
  const handleSnackBarClose = (
    event: React.SyntheticEvent | Event,
    reason?: SnackbarCloseReason
  ) => {
    if (reason === "clickaway") {
      return;
    }

    setSnackbarOpen(false);
  };

  {
    /* More copy/pasted snackbar stuff */
  }
  const action = (
    <React.Fragment>
      {/* <Button color="secondary" size="small" onClick={handleSnackBarClose}>
        Close
      </Button> */}
      <IconButton
        size="small"
        aria-label="close"
        color="inherit"
        onClick={handleSnackBarClose}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    </React.Fragment>
  );

  // @ts-expect-error
  function Recipe({ rid, name, difficulty, image, lid }) {
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
          `${config.serverUrl}/recipe_lists/remove-recipe-from-list`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        const data: RemoveRecipeFromListResponse = response.data;
        setMessage("Recipe successfully removed from list");
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
      setSnackbarOpen(true);
    };

    return (
      <>
        <Card variant="outlined">
          <CardActionArea onClick={handleGoToRecipe}>
            <CardHeader title={name} subheader={Difficulty({ difficulty })} />
            <CardMedia component="img" image={`${config.serverUrl}/${image}`} />
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

  {
    /* Should integrate with a snackbar */
  }
  async function handleAddAllIngredientsToShoppingList() {
    console.log(
      `Trying to add the ingredients of all recipes in this list to the current user's shopping list`
    );
    try {
      const response = await axios.post(
        `${config.serverUrl}/shopping_lists/items/addlist/${id}`
      );
      if (response.status == 200) {
        console.log("Recipes successfully added to shopping list");
        setMessage("Recipes successfully added to shopping list");
      } else {
        console.error(
          "Something went wrong while trying to add all recipes to shopping list"
        );
        setMessage(
          "Something went wrong while trying to add all recipes to shopping list"
        );
      }
    } catch (error) {
      console.error(
        "Error in trying to add all recipes to shopping list",
        error
      );
      setMessage("Error in trying to add all recipes to shopping list");
    }
    setSnackbarOpen(true);
  }

  async function handleAddRecipeToList(event: SelectChangeEvent) {
    console.log(`Trying to add recipe id=${event.target.value} to list`);
    if (event.target.value == undefined) {
      console.error("The ID of the recipe to add is undefined");
    }
    try {
      if (id == undefined) {
        console.error("id of list is undefined");
        return;
      }
      const formData = new FormData();
      formData.append("rid", event.target.value);
      formData.append("lid", id);
      const response = await axios.post(
        `${config.serverUrl}/recipe_lists/add-recipe-to-list`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      const data: AddRecipeToListResponse = response.data;
      console.log(data.message);
      setMessage(`Successfully added recipe to this list`);
    } catch (error) {
      const axiosError = error as AxiosError;
      if (axiosError.response && axiosError.response.data) {
        const errorData = axiosError.response.data as AddRecipeToListResponse;
        setMessage(errorData.message);
      } else {
        setMessage("An unknown error occurred");
        console.error("An unknown error occurred!");
      }
    }
    getRecipesAndThisList();
  }

  function RecipesDropdown({ allRecipes }: any) {
    if (allRecipes.length == 0) {
      return <p>Loading...</p>;
    } else {
      return (
        <>
          <FormControl sx={{ width: 400, mt: 2, mb: 2 }}>
            <InputLabel>Add a recipe</InputLabel>
            <Select value={recipeToAddId} onChange={handleAddRecipeToList}>
              {allRecipes.map((recipe: Recipe) => {
                return (
                  <MenuItem value={recipe.id}>{recipe.recipe_name}</MenuItem>
                );
              })}
              ;
            </Select>
          </FormControl>
        </>
      );
    }
  }

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
      <Header title={recipe_list.name}></Header>

      <IconButton
        onClick={() => navigate(-1)}
        style={{ position: "fixed", top: "clamp(70px, 10vw, 120px)",
          left: "clamp(0px, 1vw, 100px)",
          zIndex: 1000, }}
      >
        <ArrowBackIcon sx={{ fontSize: 30, fontWeight: "bold" }} />
      </IconButton>

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
      <RecipesDropdown allRecipes={allRecipes}></RecipesDropdown>
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
      {/* <Button onClick={handleGoToRecipes} variant="contained" color="primary">
        Find Recipes
      </Button> */}
      {/* Button to add all ingredients in all recipes to shopping list */}
      <Button
        onClick={handleAddAllIngredientsToShoppingList}
        variant="contained"
        color="primary"
      >
        Add All to Shopping List
      </Button>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackBarClose}
        message={message}
        action={action}
      />
    </>
  );
};

export default RecipeLists;

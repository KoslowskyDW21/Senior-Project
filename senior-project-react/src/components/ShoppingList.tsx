import React from "react";
import axios, { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  Checkbox,
  Grid2,
  IconButton,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Header from "./Header";
import config from "../config.js";
import DeleteIcon from "@mui/icons-material/Delete";

interface ShoppingListInterface {
  id: number;
  user_id: number;
}

interface ShoppingListItem {
  id: number;
  shopping_list_id: number;
  ingredient_id: number;
  measure: string;
}

interface Ingredient {
  id: number;
  ingredient_name: string;
}

class _ShoppingListItemIngredient {
  id: number = -1;
  shopping_list_id: number = -1;
  ingredient_id: number = -1;
  measure: string = "uninitialized";
  ingredient_name: string = "uninitialized";
  checked: boolean | undefined;
}

interface Recipe {
  id: number;
  recipe_name: string;
  xp_amount: number;
  difficulty: "1" | "2" | "3" | "4" | "5";
  image: string;
}

interface AddRecipeToListResponse {
  message: string;
  objects: ShoppingListItem[];
}

const ShoppingList: React.FC = () => {
  const [shoppingList, setShoppingList] =
    React.useState<ShoppingListInterface>();
  const [shoppingListItems, setShoppingListItems] = React.useState<
    ShoppingListItem[]
  >([]);
  const [ingredients, setIngredients] = React.useState<Ingredient[]>([]);
  const [shoppingListItemIngredients, setShoppingListItemIngredients] =
    React.useState<_ShoppingListItemIngredient[]>([]);
  const [
    filteredShoppingListItemIngredients,
    setFilteredShoppingListItemIngredients,
  ] = React.useState<_ShoppingListItemIngredient[]>([]);
  const [recipes, setRecipes] = React.useState<Recipe[]>([]);
  const [message, setMessage] = React.useState<string>("");
  const [recipe_id, setRecipe_id] = React.useState<string>("");
  const [searchQuery, setSearchQuery] = React.useState<string>("");

  const navigate = useNavigate();

  async function getShoppingListInfo() {
    try {
      let response = await axios.get(
        `${config.serverUrl}/shopping_lists/user_list`
      );
      const shopping_list: ShoppingListInterface = response.data;
      setShoppingList(shopping_list);
      console.log(
        `Shopping list now set: ${shopping_list.id} ${shopping_list.user_id}`
      );

      response = await axios.get(
        `${config.serverUrl}/shopping_lists/items/${shopping_list.id}`
      );
      const shopping_list_items: ShoppingListItem[] = response.data;
      setShoppingListItems(shopping_list_items);
      // console.log(`Shopping list items now set: ${shopping_list_items}`);

      response = await axios.get(
        `${config.serverUrl}/ingredients/shopping_list/${shopping_list.id}`
      );
      const ingredients_list: Ingredient[] = response.data;
      setIngredients(ingredients_list);
      console.log(`Ingredients now set:`);
      // for (const ingredient of ingredients_list) {
      //     console.log(`${ingredient.ingredient_name}`);
      // }

      let shopping_list_item_ingredients: _ShoppingListItemIngredient[] = [];
      for (const shopping_list_item of shopping_list_items) {
        const corresponding_ingredient: Ingredient = ingredients_list.filter(
          (ingredient) => ingredient.id == shopping_list_item.ingredient_id
        )[0];
        const shoppingListItemIngredient = new _ShoppingListItemIngredient();
        shoppingListItemIngredient.id = shopping_list_item.id;
        shoppingListItemIngredient.shopping_list_id =
          shopping_list_item.shopping_list_id;
        shoppingListItemIngredient.ingredient_id =
          shopping_list_item.ingredient_id;
        shoppingListItemIngredient.measure = shopping_list_item.measure;
        shoppingListItemIngredient.ingredient_name =
          corresponding_ingredient.ingredient_name;
        shopping_list_item_ingredients.push(shoppingListItemIngredient);
      }
      setShoppingListItemIngredients(shopping_list_item_ingredients);
    } catch (error) {
      console.error("Error fetching shopping list info: ", error);
    }
  }

  async function getRecipes() {
    try {
      const response = await axios.get(`${config.serverUrl}/recipes/all`);
      setRecipes(response.data.recipes);
      console.log(
        `Grabbed all recipes: ${response.data.recipes.length} recipes grabbed`
      );
      // for (const recipe of recipes) {
      //     console.log(recipe.recipe_name)
      // }
    } catch (error) {
      console.error("Error fetching all recipes: ", error);
    }
  }

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

  const filterShoppingListItemIngredients = (
    shoppingListItemIngredients_: _ShoppingListItemIngredient[]
  ) => {
    const urlParams = new URLSearchParams(location.search);
    const searchQuery = urlParams.get("search")?.toLowerCase() || "";
    if (searchQuery) {
      const filtered = shoppingListItemIngredients_.filter(
        (_shoppingListItemIngredient) =>
          _shoppingListItemIngredient.ingredient_name
            .toLowerCase()
            .includes(searchQuery)
      );
      setFilteredShoppingListItemIngredients(filtered);
    } else {
      setFilteredShoppingListItemIngredients(shoppingListItemIngredients_);
    }
  };

  async function handleAddIngredientsOfRecipe(event: SelectChangeEvent) {
    console.log(
      `Trying to add recipe id=${event.target.value}'s ingredients to list`
    );
    if (event.target.value == undefined) {
      console.log("How did that happen? Selected recipe_id is undefined!");
      return;
    }
    console.log(
      `Trying to add all ingredients of recipe ${event.target.value} to shopping list`
    );
    try {
      const response = await axios.post(
        `${config.serverUrl}/shopping_lists/items/add/${event.target.value}`
      );
      if (response.status == 200) {
        setMessage("Recipe successfully added to list");
        console.log(`Recipe id=${event.target.value} added to list`);
        getShoppingListInfo();
      } else {
        setMessage("Recipe failed to be added to list");
      }
    } catch (error) {
      setMessage(
        "Error in trying to add recipe's ingredients to shopping list"
      );
      console.error(
        "Error in trying to add recipe's ingredients to shopping list",
        error
      );
    }
  }

  async function handleRemoveSLI(sli_id: number) {
    console.log(`Trying to remove SLI with id=${sli_id}`);
    try {
      const response = await axios.post(
        `${config.serverUrl}/shopping_lists/items/remove/${sli_id}`
      );
      if (response.status == 200) {
        setMessage("Item successfully removed from list");
        getShoppingListInfo();
        return;
      } else {
        setMessage("Failed to remove item from list");
        return;
      }
    } catch (error) {
      setMessage(
        `An error occurred while trying to remove item ${sli_id} from list`
      );
      return;
    }
  }

  async function handleRemoveAllSLIs() {
    console.log("Trying to remove all SLIs for user");
    try {
      const response = await axios.post(
        `${config.serverUrl}/shopping_lists/items/remove-all`
      );
      if (response.status == 200) {
        setMessage("All items successfully cleared from list");
        getShoppingListInfo();
        return;
      } else {
        setMessage("Failed to remove all items from list");
      }
    } catch (error) {
      setMessage(
        "An error occurred while trying to remove all items from list"
      );
      return;
    }
  }

  function RecipesDropdown({ recipes }) {
    if (recipes.length == 0) {
      return <p>Loading...</p>;
    } else {
      return (
        <>
          <FormControl sx={{ width: 400 }}>
            <InputLabel>Add all ingredients of a recipe</InputLabel>
            <Select value={recipe_id} onChange={handleAddIngredientsOfRecipe}>
              {recipes.map((recipe: Recipe) => {
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
    getShoppingListInfo();
  }, []);

  React.useEffect(() => {
    filterShoppingListItemIngredients(shoppingListItemIngredients);
  }, [location.search, shoppingListItemIngredients]);

  React.useEffect(() => {
    getRecipes();
  }, []);

  const handleIngredientCheck = (ingredientId: number, checked: boolean) => {
    // Find the ingredient and update its checked status
    const updatedIngredients = shoppingListItemIngredients.map((ingredient) => {
      if (ingredient.id === ingredientId) {
        return { ...ingredient, checked };
      }
      return ingredient;
    });
  
    // Update the state with the new checked status for the ingredient
    setShoppingListItemIngredients(updatedIngredients);
  };
  

  return (
    <>
      {/* Back button */}
      <IconButton onClick={() => navigate("/recipes/")} style={{ position: "fixed", top: 30, left: 30 }}>
        <ArrowBackIcon sx={{ fontSize: 30, fontWeight: "bold" }} />
      </IconButton>

      <Box sx={{ display: "flex", justifyContent: "center", flexGrow: 1, alignItems: "center", fontSize: "48px", fontWeight: "bold" }}>
        Shopping List
      </Box>

      {/* Search field */}
      <Box sx={{ mt: 2 }}>
        <TextField
          label="Search for ingredients"
          variant="outlined"
          fullWidth
          value={searchQuery}
          onChange={handleSearchChange}
          sx={{ width: "100%" }}
        />
      </Box>

      {/* Remove All button */}
      <Button
        onClick={() => {
          handleRemoveAllSLIs();
        }}
        variant="contained"
        color="error"
        sx={{ marginTop: 2 }}
      >
        Remove All
      </Button>

      {/* Ingredient List */}
      <Box sx={{ mt: 4 }}>
        {filteredShoppingListItemIngredients.length > 0 ? (
          <Box sx={{ marginTop: 2 }}>
            {filteredShoppingListItemIngredients.map((ingredient) => (
              <Box key={ingredient.id} sx={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #ccc", alignItems: "center" }}>
                {/* Checkbox to the left of each ingredient */}
                <Checkbox
                  checked={ingredient.checked}  // Bind to the checked state of each ingredient
                  onChange={(e) => handleIngredientCheck(ingredient.id, e.target.checked)}  // Update checked state
                />
                <Typography
                  variant="body1"
                  sx={{
                    textDecoration: ingredient.checked ? "line-through" : "none",  // Apply strikethrough if checked
                    color: ingredient.checked ? "gray" : "black",  // Change color if checked
                    flex: 1,
                  }}
                >
                  {ingredient.ingredient_name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {ingredient.measure || "N/A"} {/* Display ingredient's measure */}
                </Typography>
                <IconButton
              onClick={() => handleRemoveSLI(ingredient.id)} // Remove ingredient when clicked
              color="error"
              aria-label="delete"
            >
              <DeleteIcon />
            </IconButton>
              </Box>
            ))}
          </Box>
        ) : (
          <Typography>No ingredients available.</Typography>
        )}
      </Box>
    </>
  );
};

export default ShoppingList;

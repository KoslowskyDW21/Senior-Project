import React from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Checkbox,
  TextField,
  Typography,
  IconButton,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import config from "../config.js";

interface ShoppingListItem {
  id: number;
  shopping_list_id: number;
  ingredient_id: number;
  measure: string;
}

interface Ingredient {
  id: number;
  ingredient_name: string;
  checked: boolean;  // Ensure checked state is part of the ingredient
  measure: string;   // Ensure measure is part of the ingredient
}

const ShoppingList: React.FC = () => {
  const [shoppingListItems, setShoppingListItems] = React.useState<ShoppingListItem[]>([]);
  const [ingredients, setIngredients] = React.useState<Ingredient[]>([]);
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [filteredShoppingListItemIngredients, setFilteredShoppingListItemIngredients] = React.useState<Ingredient[]>([]);

  const navigate = useNavigate();

  // Fetch shopping list and ingredients
  const getShoppingListInfo = async () => {
    try {
      const shoppingListResponse = await axios.get(`${config.serverUrl}/shopping_lists/user_list`);
      const shoppingList = shoppingListResponse.data;

      const shoppingListItemsResponse = await axios.get(`${config.serverUrl}/shopping_lists/items/${shoppingList.id}`);
      setShoppingListItems(shoppingListItemsResponse.data);

      const ingredientsResponse = await axios.get(`${config.serverUrl}/ingredients/shopping_list/${shoppingList.id}`);
      const ingredientsList = ingredientsResponse.data.map((ingredient: any) => ({
        ...ingredient,
        checked: false, // Ensure each ingredient starts with unchecked state
        measure: "",  // Initialize measure as empty string
      }));

      // Combine the shoppingListItems and ingredientsList
      const combinedIngredients = ingredientsList.map((ingredient: Ingredient) => {
        const shoppingListItem = shoppingListItemsResponse.data.find((item: ShoppingListItem) => item.ingredient_id === ingredient.id);
        return {
          ...ingredient,
          measure: shoppingListItem ? shoppingListItem.measure : "N/A",  // Use N/A if no measure is found
        };
      });

      // Set ingredients with the combined measure
      setIngredients(combinedIngredients);

      // Filter ingredients based on search query
      filterIngredients(combinedIngredients);

    } catch (error) {
      console.error("Error fetching shopping list info: ", error);
    }
  };

  // Filter ingredients based on the search query
  const filterIngredients = (ingredientsList: Ingredient[]) => {
    const filtered = ingredientsList.filter((ingredient) =>
      ingredient.ingredient_name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredShoppingListItemIngredients(filtered);
  };

  // Handle search field change
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    setSearchQuery(query);
    filterIngredients(ingredients);  // Re-filter ingredients based on the new search query
  };

  // Toggle the checked state of an ingredient
  const handleIngredientCheck = (ingredientId: number, checked: boolean) => {
    const updatedIngredients = ingredients.map((ingredient) =>
      ingredient.id === ingredientId ? { ...ingredient, checked } : ingredient
    );
    setIngredients(updatedIngredients);
    // Re-filter the ingredients after changing the checked state
    filterIngredients(updatedIngredients);
  };

  React.useEffect(() => {
    getShoppingListInfo();
  }, []);

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
          setIngredients(ingredients.map((ingredient) => ({ ...ingredient, checked: false })));
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

import React from 'react';
import axios, { AxiosError } from "axios";
import { useNavigate } from 'react-router-dom';
import { Box, Card, Checkbox, IconButton, TextField, FormControl, InputLabel, Select, MenuItem, SelectChangeEvent } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Header from "./Header";

interface ShoppingListInterface {
    id: number;
    user_id: number;
}

interface ShoppingListItem {
    shopping_list_id: number;
    ingredient_id: number;
    measure: string;
}

interface Ingredient {
    id: number;
    ingredient_name: string;
}

class _ShoppingListItemIngredient {
    shopping_list_id: number = -1;
    ingredient_id: number = -1;
    measure: string = "uninitialized";
    ingredient_name: string = "uninitialized";
}

// interface Recipe {
//     id: number;
//     recipe_name: string;
//     xp_amount: number;
//     difficulty: "1" | "2" | "3" | "4" | "5";
//     image: string;
//   }

const ShoppingList: React.FC = () => {
    const [ shoppingList, setShoppingList ] = React.useState<ShoppingListInterface>();
    const [ shoppingListItems, setShoppingListItems ] = React.useState<ShoppingListItem[]>([]);
    const [ ingredients, setIngredients ] = React.useState<Ingredient[]>([]);
    const [ shoppingListItemIngredients, setShoppingListItemIngredients ] = React.useState<_ShoppingListItemIngredient[]>([]);
    const [ filteredShoppingListItemIngredients, setFilteredShoppingListItemIngredients] = React.useState<_ShoppingListItemIngredient[]>([]);
    // const [ recipes, setRecipes ] = React.useState<Recipe[]>([]);
    // const [ selectedRecipeId, setSelectedRecipeId ] = React.useState<string>("");
    const [ message, setMessage ] = React.useState<String>("");

    const navigate = useNavigate();

    async function getShoppingListInfo() {
        try {
            let response = await axios.get(`http://127.0.0.1:5000/shopping_lists/user_list`);
            const shopping_list: ShoppingListInterface = response.data;
            setShoppingList(shopping_list);
            console.log(`Shopping list now set: ${shopping_list.id} ${shopping_list.user_id}`);
            
            response = await axios.get(`http://127.0.0.1:5000/shopping_lists/items/${shopping_list.id}`);
            const shopping_list_items: ShoppingListItem[] = response.data;
            setShoppingListItems(shopping_list_items);
            console.log(`Shopping list items now set: ${shopping_list_items}`);

            response = await axios.get(`http://127.0.0.1:5000/ingredients/shopping_list/${shopping_list.id}`);
            const ingredients_list: Ingredient[] = response.data;
            setIngredients(ingredients_list);
            console.log(`Ingredients now set:`);
            for (const ingredient of ingredients_list) {
                console.log(`${ingredient.ingredient_name}`);
            }

            let shopping_list_item_ingredients: _ShoppingListItemIngredient[] = []
            for (const shopping_list_item of shopping_list_items) {
                const corresponding_ingredient: Ingredient = ingredients_list.filter((ingredient) =>
                    ingredient.id == shopping_list_item.ingredient_id
                )[0];
                const shoppingListItemIngredient = new _ShoppingListItemIngredient();
                shoppingListItemIngredient.shopping_list_id = shopping_list_item.shopping_list_id;
                shoppingListItemIngredient.ingredient_id = shopping_list_item.ingredient_id;
                shoppingListItemIngredient.measure = shopping_list_item.measure;
                shoppingListItemIngredient.ingredient_name = corresponding_ingredient.ingredient_name;
                shopping_list_item_ingredients.push(shoppingListItemIngredient);
            }
            setShoppingListItemIngredients(shopping_list_item_ingredients);
            

        } catch (error) {
            console.error("Error fetching shopping list info: ", error);
        }
    };

      const filterShoppingListItemIngredients = (shoppingListItemIngredients_: _ShoppingListItemIngredient[]) => {
        const urlParams = new URLSearchParams(location.search);
        const searchQuery = urlParams.get("search")?.toLowerCase() || "";
        if (searchQuery) {
          const filtered = shoppingListItemIngredients_.filter((_shoppingListItemIngredient) =>
            _shoppingListItemIngredient.ingredient_name.toLowerCase().includes(searchQuery)
          );
          setFilteredShoppingListItemIngredients(filtered);
        } else {
          setFilteredShoppingListItemIngredients(shoppingListItemIngredients_); 
        }
      };

    function ShoppingListItemIngredient({ shopping_list_id, ingredient_id, measure, ingredient_name }: _ShoppingListItemIngredient) {
        return (
            <>
            <Card
                variant="outlined"
                sx={{
                    margin: 2,
                    padding: 1,
                    width: 300,
                    display: "flex"
                }}
            >
            <Checkbox
                sx={{ '& .MuiSvgIcon-root': { fontSize: 28 } }}
            />
            {ingredient_name}
            {measure}
            </Card>
            </>
        )
    }
    
    React.useEffect(() => {
        getShoppingListInfo();
    }, []);

    React.useEffect(() => {
        filterShoppingListItemIngredients(shoppingListItemIngredients);
    }, [location.search, shoppingListItemIngredients]);

    return (
        <>
        {/* Header bar */}
        <Header title="Shopping List" />
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

        {/* Spacer */}
        <Box
            sx={{
            display: 'flex',
            justifyContent: 'flex-start',
            alignItems: 'center',
            fontSize: '24px',
            fontWeight: 'bold',
            textAlign: 'center',
            mt: 12,
            }}
        >
        </Box>

        {/* Back button */}
        <IconButton aria-label="back"
            onClick={() => navigate(-1)}
            style={{ position: "relative", right: 650 }}
        >
            <ArrowBackIcon sx={{ fontSize: 30, fontWeight: "bold" } } />
        </IconButton>

        {filteredShoppingListItemIngredients.map((shoppingListItemIngredient) => (
            <ShoppingListItemIngredient
                shopping_list_id={shoppingListItemIngredient.shopping_list_id}
                ingredient_id={shoppingListItemIngredient.ingredient_id}
                measure={shoppingListItemIngredient.measure}
                ingredient_name={shoppingListItemIngredient.ingredient_name}
            />
        ))}

        </>
    )
}

export default ShoppingList;
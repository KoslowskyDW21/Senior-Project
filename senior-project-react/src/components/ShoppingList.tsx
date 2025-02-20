import React from 'react';
import axios, { AxiosError } from "axios";
import { useNavigate } from 'react-router-dom';
import { Box, Button, Card, Checkbox, Grid2, IconButton, TextField, FormControl, InputLabel, Select, MenuItem, SelectChangeEvent } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Header from "./Header";

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
}

interface Recipe {
    id: number;
    recipe_name: string;
    xp_amount: number;
    difficulty: "1" | "2" | "3" | "4" | "5";
    image: string;
  }

interface AddRecipeToListResponse {
    message: string
    objects: ShoppingListItem[]
}

const ShoppingList: React.FC = () => {
    const [ shoppingList, setShoppingList ] = React.useState<ShoppingListInterface>();
    const [ shoppingListItems, setShoppingListItems ] = React.useState<ShoppingListItem[]>([]);
    const [ ingredients, setIngredients ] = React.useState<Ingredient[]>([]);
    const [ shoppingListItemIngredients, setShoppingListItemIngredients ] = React.useState<_ShoppingListItemIngredient[]>([]);
    const [ filteredShoppingListItemIngredients, setFilteredShoppingListItemIngredients] = React.useState<_ShoppingListItemIngredient[]>([]);
    const [ recipes, setRecipes ] = React.useState<Recipe[]>([]);
    const [ message, setMessage ] = React.useState<string>("");
    const [ recipe_id, setRecipe_id ] = React.useState<string>("");

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
            // console.log(`Shopping list items now set: ${shopping_list_items}`);

            response = await axios.get(`http://127.0.0.1:5000/ingredients/shopping_list/${shopping_list.id}`);
            const ingredients_list: Ingredient[] = response.data;
            setIngredients(ingredients_list);
            console.log(`Ingredients now set:`);
            // for (const ingredient of ingredients_list) {
            //     console.log(`${ingredient.ingredient_name}`);
            // }

            let shopping_list_item_ingredients: _ShoppingListItemIngredient[] = []
            for (const shopping_list_item of shopping_list_items) {
                const corresponding_ingredient: Ingredient = ingredients_list.filter((ingredient) =>
                    ingredient.id == shopping_list_item.ingredient_id
                )[0];
                const shoppingListItemIngredient = new _ShoppingListItemIngredient();
                shoppingListItemIngredient.id = shopping_list_item.id;
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

    async function getRecipes() {
        try {
            const response = await axios.get('http://127.0.0.1:5000/recipes/all');
            setRecipes(response.data.recipes);
            console.log(`Grabbed all recipes: ${response.data.recipes.length} recipes grabbed`);
            // for (const recipe of recipes) {
            //     console.log(recipe.recipe_name)
            // }
        }
        catch (error) {
            console.error("Error fetching all recipes: ", error);
        }
    }

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

    async function handleAddIngredientsOfRecipe(event: SelectChangeEvent) {
        console.log(`Trying to add recipe id=${event.target.value}'s ingredients to list`);
        if (event.target.value == undefined) {
            console.log("How did that happen? Selected recipe_id is undefined!");
            return;
        }
        console.log(`Trying to add all ingredients of recipe ${event.target.value} to shopping list`);
        try {
            const response = await axios.post(`http://127.0.0.1:5000/shopping_lists/items/add/${event.target.value}`);
            if (response.status == 200) {
                setMessage("Recipe successfully added to list");
                console.log(`Recipe id=${event.target.value} added to list`);
                getShoppingListInfo();
            } else {
                setMessage("Recipe failed to be added to list");
            }
        } catch (error) {
            setMessage("Error in trying to add recipe's ingredients to shopping list");
            console.error("Error in trying to add recipe's ingredients to shopping list", error);
        }
        
    }

    async function handleRemoveSLI(sli_id: number) {
        console.log(`Trying to remove SLI with id=${sli_id}`);
        try {
            const response = await axios.post(`http://127.0.0.1:5000/shopping_lists/items/remove/${sli_id}`);
            if (response.status == 200) {
                setMessage("Item successfully removed from list");
                getShoppingListInfo();
                return;
            } else {
                setMessage("Failed to remove item from list");
                return;
            }
        } catch (error) {
            setMessage(`An error occurred while trying to remove item ${sli_id} from list`);
            return;
        }
    }

    async function handleRemoveAllSLIs() {
        console.log("Trying to remove all SLIs for user");
        try {
            const response = await axios.post(`http://127.0.0.1:5000/shopping_lists/items/remove-all`);
            if (response.status == 200) {
                setMessage("All items successfully cleared from list");
                getShoppingListInfo();
                return;
            } else {
                setMessage("Failed to remove all items from list");
            }
        } catch (error) {
            setMessage("An error occurred while trying to remove all items from list");
            return;
        }
    }

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

    function RecipesDropdown({ recipes }) {
        // for (const recipe of recipes) {
        //     console.log(recipe.recipe_name);
        // }
        if (recipes.length == 0) {
            return <p>Loading...</p>
        } else {
            return (
                <>
                    <FormControl
                    sx={{width: 400}}
                    >
                        <InputLabel>Add all ingredients of a recipe</InputLabel>
                        <Select
                            value={""}
                            onClick={handleAddIngredientsOfRecipe} // ignore this erro and *do not* change to onChange
                        >
                            {
                                recipes.map((recipe: Recipe) => { // FIX: "recipes.map is not a function"
                                    <MenuItem value={recipe.id} onClick={() => setRecipe_id(recipe.id.toString())}>{recipe.recipe_name}</MenuItem>
                                })
                            };
                        </Select>
                    </FormControl>
                </>
            )
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

    return (
        <>
        {/* Header bar */}
        <Header title="Shopping List" searchLabel="Search Shopping List" searchVisible={true} />
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

        {/* Put RecipeDropdown here */}
        <RecipesDropdown recipes={recipes}></RecipesDropdown>

        {/* Items of shopping list */}
        {filteredShoppingListItemIngredients.map((shoppingListItemIngredient) => (
            <Box
            key={shoppingListItemIngredient.id} // my attempt at appeasing React
            >
                <Card
                variant="outlined"
                sx={{
                    padding: 2,
                    margin: 2
                }}
                >
                    <ShoppingListItemIngredient
                        id={shoppingListItemIngredient.id}
                        shopping_list_id={shoppingListItemIngredient.shopping_list_id}
                        ingredient_id={shoppingListItemIngredient.ingredient_id}
                        measure={shoppingListItemIngredient.measure}
                        ingredient_name={shoppingListItemIngredient.ingredient_name}
                    />
                    <Button
                        onClick={() => {
                            handleRemoveSLI(shoppingListItemIngredient.id);
                        }}
                        variant="contained"
                        color="error"
                    >Remove</Button>
                </Card>
            </Box>
        ))}
        <br />
        <br />
        <Button
            onClick={() => {
                handleRemoveAllSLIs();
            }}
            variant="contained"
            color="error"
        >Remove All
        </Button>
        </>
    )
}

export default ShoppingList;
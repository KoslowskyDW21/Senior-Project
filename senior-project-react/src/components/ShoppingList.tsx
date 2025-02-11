import React from 'react';
import axios, { AxiosError } from "axios";
import { useNavigate } from 'react-router-dom';
import { Box, Card, Checkbox, IconButton, TextField, FormControl, InputLabel, Select, MenuItem, SelectChangeEvent } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

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

const ShoppingList: React.FC = () => {
    const [ shoppingList, setShoppingList ] = React.useState<ShoppingListInterface>();
    const [ shoppingListItems, setShoppingListItems ] = React.useState<ShoppingListItem[]>([]);
    const [ ingredients, setIngredients ] = React.useState<Ingredient[]>([]);
    const [ searchQuery, setSearchQuery ] = React.useState<String>("");
    const [ recipeLists, setRecipeLists ] = React.useState<RecipeList[]>([]);
    const [ recipeList, setRecipeList ] = React.useState<RecipeList>();
    const [ recipes, setRecipes ] = React.useState<Recipe[]>([]);
    const [ selectedRecipeListId, setSelectedRecipeListId] = React.useState<string>("");
    const [ selectedRecipeId, setSelectedRecipeId ] = React.useState<string>("");
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

        } catch (error) {
            console.error("Error fetching shopping list info: ", error);
        }
    };

    async function getAllRecipeListsOfUser() {
        try {
            const response = await axios.get(`http://127.0.0.1:5000/recipe_lists/all`);
            const recipe_lists: RecipeList[] = response.data;
            setRecipeLists(recipe_lists);
            console.log(`Recipe lists:`);
            for (const rl of recipe_lists) {
                console.log(`${rl.id} ${rl.name}`)
            }
        } catch (error) {
            console.error("Error fetching recipe lists of user: ", error);
        }
    }

    async function getAllRecipesInRecipeList() {
        if (recipeList == undefined) {
            console.log("No recipeList selected but getAllRecipesInRecipeList() ran");
            return;
        }
        try {
            const response = await axios.post(`http://127.0.0.1:5000/recipe_lists/recipes/${recipeList.id}`);
            const _recipes: Recipe[] = response.data;
            setRecipes(_recipes);
            console.log(`Recipes in list ${recipeList.id}`);
            for (const r of _recipes) {
                console.log(`${r.id} ${r.recipe_name}`);
            }
        } catch (error) {
            console.error(`Error fetching recipes in recipeList ${recipeList}: `, error);
        }
    }

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(event.target.value);
    };

    const handleSelectRecipeList = async (event: SelectChangeEvent) => {
        setRecipeList(recipeLists.filter(id=event.target.value)[0]); // we expect this filter to reduce recipeLists to only one value
        console.log(`recipeList has been set to ${event.target.value}`);
    };

    const handleSelectRecipe = async (event: SelectChangeEvent) => {
        //TODO: stuff
    };

    function ListItem({ shopping_list_id, ingredient_id, measure }: ShoppingListItem) {
        if (ingredients.length == 0) {
            return <p>Loading or empty...</p>
        }
        console.log(`measure of ingredient id ${ingredient_id}: ${measure}`);
        return (
            <>
            <Card
                variant="outlined"
                sx={{margin: 2,
                    padding: 1,
                    width: 300,
                    display: "flex"
                }}
            >
                <Checkbox
                    sx={{ '& .MuiSvgIcon-root': { fontSize: 28 }
                }}
                />
                {ingredients.filter(ingredient => ingredient.id==ingredient_id).map(ingredient => (<p>{ingredient.ingredient_name}</p>))} 
                {measure}
            </Card>
            
            </>
        )
    };
    
    React.useEffect(() => {
        getShoppingListInfo();
        getAllRecipeListsOfUser();
    }, []);

    return (
        <>
            {/* Navbar */}
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            display: 'flex',
            alignItems: 'center',
            padding: '10px 20px',
            backgroundColor: '#fff',
            boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.1)',
            zIndex: 1000,
            height: '100px',
            justifyContent: 'space-between',
          }}
        >
        {/* Back button */}
        <IconButton
                onClick={() => navigate('/recipes')}
                style={{ position: "absolute", top: 30, left: 30 }} 
        >
            <ArrowBackIcon sx={{ fontSize: 30, fontWeight: 'bold' }} />
        </IconButton>

        {/* Recipe list name */}
        <Box
            sx={{
              display: 'flex',
              justifyContent: 'center', 
              flexGrow: 1,
              alignItems: 'center',
              fontSize: '24px',
              fontWeight: 'bold',
            }}
          >
            <h1>My Shopping List</h1>
          </Box>

        {/* Search bar */}
        <Box mt={4} mb={2}
         textAlign="center"
          display="flex"
           justifyContent="center"
            sx={{ flexGrow: 1 }}>
            <TextField
              label="Search Shopping List"
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

        </Box> {/* End of header bar */}

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

        {/* Add the ingredients of a recipe from a recipe list to the shopping list */}
        <FormControl fullWidth>
            <InputLabel id="recipe-list-select-label">Add ingredients from a recipe in a list</InputLabel>
            <Select
                labelId="recipe-list-select-label"
                id="recipe-list-select"
                value={selectedRecipeListId}
                onChange={handleSelectRecipeList}
            >
                {recipeLists.map((recipeList) => (
                    // <MenuItem value={recipeList.id}>{recipeList.name}</MenuItem>
                    <FormControl fullWidth>
                        <InputLabel id="recipe-select-label">{recipeList.name}</InputLabel>
                        <Select
                            labelId="recipe-select-label"
                            value={selectedRecipeId}
                            onChange={handleSelectRecipe}
                        >
                            {recipes.map((recipe) => (
                                <MenuItem value={recipe.id}>{recipe.recipe_name}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                ))}
            </Select>
        </FormControl>


        {shoppingListItems.map((shoppingListItem) => (
            <ListItem // TODO: add key
            shopping_list_id={shoppingListItem.shopping_list_id}
            ingredient_id={shoppingListItem.ingredient_id}
            measure={shoppingListItem.measure}
            ></ListItem>
        ))}

        </>
    )
}

export default ShoppingList;
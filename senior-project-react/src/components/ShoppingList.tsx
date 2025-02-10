import React from 'react';
import axios, { AxiosError } from "axios";
import { useNavigate } from 'react-router-dom';
import { Box, Card, Checkbox, IconButton, TextField } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { positions } from '@mui/system';

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

const ShoppingList: React.FC = () => {
    const [ shoppingList, setShoppingList ] = React.useState<ShoppingListInterface>();
    const [ shoppingListItems, setShoppingListItems ] = React.useState<ShoppingListItem[]>([]);
    const [ ingredients, setIngredients ] = React.useState<Ingredient[]>([]);
    const [ searchQuery, setSearchQuery ] = React.useState<String>("");
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

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(event.target.value);
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

        {shoppingListItems.map((shoppingListItem) => (
            <ListItem 
            shopping_list_id={shoppingListItem.shopping_list_id}
            ingredient_id={shoppingListItem.ingredient_id}
            measure={shoppingListItem.measure}
            ></ListItem>
        ))}

        </>
    )
}

export default ShoppingList;
import React from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
    Button,
    Card,
    CardContent,
    Typography,
    Grid2,
} from "@mui/material";

interface RecipeList {
    id: number;
    name: string;
    belongs_to: number;
}

interface User {
    "id": string,
    "fname": string,
    "lname": string,
    "email_address": string,
    "username": string,
    "profile_picture": string,
    "xp_points": number,
    "user_level": number,
    "is_admin": boolean,
    "num_recipes_completed": number,
    "colonial_floor": string,
    "colonial_side": string,
    "date_created": string,
    "last_logged_in": string,
    "num_reports": number,
}

const RecipeLists: React.FC = () => {
    const [ currentUserId, setCurrentUserId ] = React.useState<string | null>(null);
    const [ recipeLists, setRecipeLists ] = React.useState<RecipeList[]>([]);
    const navigate = useNavigate();

    const handleGoToRecipes = async () => {
        console.log("Navigating to recipe page");
        navigate(`/recipes/`);
    }

    const getCurrentUser = async () => {
        console.log("Getting FULL JSON of current user");
        try {
            const response = await axios.get(`http://127.0.0.1:5000/profile/current_user`);
            const data: User = response.data;
            setCurrentUserId(data.id);
        } catch (error) {
            console.error("Error fetching recipe: ", error);
        }
    }
    
    const getResponse = async () => {
        try {
            await getCurrentUser();
        } catch (error) {
            console.error(`Error in fetching current_user's id`);
        }
        try {
            const response = await axios.get("http://127.0.0.1:5000/recipe_lists/all");
            const data: RecipeList[] = response.data;
            setRecipeLists(data);
        } catch (error) {
            console.error(`Error in fetching RecipeList[] for user id=${currentUserId}: ${error}`);
        }
    }

    // @ts-expect-error
    function RecipeList({ lid, name, belongs_to }) {
        const handleGoToRecipeList = async () => {
            console.log(`Navigating to page of RecipeList ${lid}`);
            navigate(`/recipe-lists/${lid}`);
        }
        const handleDeleteList = async () => {
            // TODO: implement
        }
        return (
            <>
                <Card>
                    <CardContent>
                    <Typography variant="h6" component="div" gutterBottom>
                        {name}
                    </Typography>
                    <Button
                        variant="outlined"
                        onClick={handleGoToRecipeList}
                    >
                        View List
                    </Button>
                    </CardContent>
                </Card>
            </>
        )
    }

    React.useEffect(() => {
        getResponse();
    }, []);

    return (
        <>
        <Typography variant="h5" gutterBottom>RecipeLists of user with id={currentUserId}</Typography>
        <Grid2 container spacing={2}>
            {recipeLists.map((recipeList) => (
                <Grid2 xs={12} sm={6} md={4} key={recipeList.id}>
                    <RecipeList lid={recipeList.id} name={recipeList.name} belongs_to={recipeList.belongs_to}/>
                </Grid2>
            ))}
        </Grid2>
        <Button
            onClick={handleGoToRecipes}
            variant="contained"
            color="primary"
        >
            Recipes
        </Button>
        </>
    );
}

export default RecipeLists;
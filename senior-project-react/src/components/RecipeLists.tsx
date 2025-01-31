import React from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
    Button,
    Card,
    CardContent,
    Typography,
    Grid,
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
    const [ recipeList, setRecipeList ] = React.useState<RecipeList>();
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
            console.log(data); // TODO: remove debugging
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

    React.useEffect(() => {
        getResponse();
    }, []);

    return (
        <>
        <Typography variant="h5" gutterBottom>RecipeLists of user with id={currentUserId}</Typography>
        <Grid container spacing={2}>
            {recipeLists.map((recipeList) => (
                <Grid item xs={12} sm={6} md={4} key={recipeList.id}>
                    <Card>
                        <CardContent>
                        <Typography variant="h6" component="div" gutterBottom>
                            {recipeList.name}
                        </Typography>
                        <Button
                            variant="outlined"
                            onClick={() => navigate(`/recipe-list/${recipeList.id}`)}
                        >
                            View List
                        </Button>
                        </CardContent>
                    </Card>
                </Grid>
            ))}
        </Grid>
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
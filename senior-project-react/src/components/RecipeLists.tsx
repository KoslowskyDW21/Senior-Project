import React from "react";
import axios, { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import {
    Button,
    Card,
    CardContent,
    Typography,
    Grid2,
    IconButton,
} from "@mui/material";

interface RecipeList {
    id: number;
    name: string;
    belongs_to: number;
}

interface RecipeListDeletionResponse {
    message: string;
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
    const [ message, setMessage ] = React.useState<String>("");
    const navigate = useNavigate();

    const handleGoToRecipes = async () => {
        console.log("Navigating to recipe page");
        navigate(`/recipes/`);
    }

    const handleGoToRecipeCreation = async () => {
        console.log("Navigating to create recipe list page");
        navigate(`/recipe-lists/create`);
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
            if (lid == undefined) {
                return;
            }
            console.log(`Deleting recipe list ${lid}`);
            const formData = new FormData();
            formData.append("lid", lid);
            try {
                const response = await axios.post(
                    "http://127.0.0.1:5000/recipe_lists/deletelist",
                    formData,
                    { headers: {"Content-Type": "multipart/form-data"} }
                );
                const data: RecipeListDeletionResponse = response.data;
                setMessage(data.message);
                console.log(message);
                getResponse(); // reload RecipeList list
            } catch (error) {
                const axiosError = error as AxiosError;
                if (axiosError.response && axiosError.response.data) {
                    const errorData = axiosError.response.data as RecipeListDeletionResponse;
                    setMessage(errorData.message);
                } else {
                    setMessage("An unknown error occured");
                }
            }
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
                    <br />
                    <br />
                    <Button
                        variant="outlined"
                        color="error"
                        onClick={handleDeleteList}
                    >
                        Delete List
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
        <IconButton
                onClick={() => navigate(-1)}
                style={{ position: "absolute", top: 30, left: 30 }} 
            >
            <ArrowBackIcon sx={{ fontSize: 30, fontWeight: 'bold' }} />
            </IconButton>
        <Typography variant="h5" gutterBottom>My Recipe Lists</Typography>
        <Grid2 container spacing={2}>
            {recipeLists.map((recipeList) => (
                <Grid2 xs={12} sm={6} md={4} key={recipeList.id}>
                    <RecipeList lid={recipeList.id} name={recipeList.name} belongs_to={recipeList.belongs_to}/>
                </Grid2>
            ))}
        </Grid2>
        <br />
        <br />
        <Button
            onClick={handleGoToRecipeCreation}
            variant="outlined"
        >
            Create new list
        </Button>
        </>
    );
}

export default RecipeLists;
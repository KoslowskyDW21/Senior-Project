import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button, FormControl, Avatar, MenuItem, Box, Select, InputLabel, FormControlLabel, Checkbox, Typography, SelectChangeEvent, IconButton, Container } from "@mui/material"; //matui components
import axios, { AxiosError } from "axios";
import Snackbar, { SnackbarCloseReason } from '@mui/material/Snackbar';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloseIcon from '@mui/icons-material/Close';

interface Recipe {
    "id": string,
    "recipe_name": string,
    "difficulty": string,
    "xp_amount": string,
    "rating": string,
    "image": string,
    "achievements": []
}

interface RecipeList {
    id: number;
    name: string;
    belongs_to: number;
}

interface Step {
    "recipe_id": string,
    "step_number": number,
    "step_description": string
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

interface AddRecipeToListResponse {
    message: string;
}

function Step({ recipe_id, step_number, step_description }: Step) {
    return (
        <>
            <Box
                sx={{
                    
                }}
            >
                <FormControlLabel
                 control={<Checkbox />}
                 label={`Step ${step_number}:`}
                  />
                <Typography>{step_description}</Typography>
            </Box>
        </>
    );
}

const IndividualRecipe: React.FC = () => {
    const [ recipe_name, setRecipe_name ] = React.useState<String>();
    const [ current_user, setCurrent_user ] = React.useState<User>();
    const [ message, setMessage ] = React.useState("");
    const [ lid, setLid ] = React.useState('');
    const [ recipeLists, setRecipeLists ] = React.useState<RecipeList[]>([]);
    const [ steps, setSteps ] = React.useState<Step[]>([]);
    const [ snackbarOpen, setSnackBarOpen ] = React.useState(false);
    const { id } = useParams<{ id: string }>();

    const navigate = useNavigate();

    const handleGoToCompletedRecipe = async () => {
        console.log("Navigating to completed recipe page");
        navigate(`/recipes/completed/${id}`);
    }

    const handleAddRecipeToList = async (event: SelectChangeEvent) => {
        if (id == undefined) {
            console.log("id is undefined!");
            return;
        }
        console.log(`Trying to add this recipe to list number ${event.target.value} `);
        const formData = new FormData();
        formData.append("rid", id.toString());
        formData.append("lid", event.target.value); // event.target.value is lid
        try {
            const response = await axios.post(
                "http://127.0.0.1:5000/recipe_lists/add-recipe-to-list", formData,
                 { headers: { "Content-Type": "multipart/form-data"} }
            );
            const data: AddRecipeToListResponse = response.data;
            setMessage(data.message);
            console.log(data.message);
        } catch (error) {
            const axiosError = error as AxiosError;
            if (axiosError.response && axiosError.response.data) {
                const errorData = axiosError.response.data as AddRecipeToListResponse;
                setMessage(errorData.message);
            } else {
                setMessage("An unknown error occurred");
            }
        }
        setSnackBarOpen(true);
    }

    const handleRemoveRecipeFromList = async (event: SelectChangeEvent) => {
        if (id == undefined) {
            console.log("id is undefined!");
            return;
        }
        console.log(`Trying to reove this recipe from list number ${event.target.value}`);
        const formData = new FormData();
        formData.append("rid", id.toString());
        formData.append("lid", event.target.value);
    }

    const handleSnackBarClose = (
        event: React.SyntheticEvent | Event,
        reason?: SnackbarCloseReason,
    ) => {
        if (reason === 'clickaway') {
            return;
          }
      
          setSnackBarOpen(false);
    };

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

    const getCurrentUser = async () => {
        console.log("Getting FULL JSON of current user");
        try {
            const response = await axios.post(`http://127.0.0.1:5000/profile/current_user`);
            const data: User = response.data;
            setCurrent_user(data);
        } catch (error) {
            console.error("Error fetching recipe: ", error);
        }
    }

    const getRecipeLists = async () => {
        try {
            const response = await axios.get("http://127.0.0.1:5000/recipe_lists/all");
            const data: RecipeList[] = response.data;
            setRecipeLists(data);
        } catch (error) {
            if (current_user) {
                console.error(`Error in fetching RecipeList[] for user id=${current_user.id}: ${error}`);
            }
            else {
                console.error("Error in fetching RecipeList[] for unknown user");
            }
        }
    }

    const getRecipeName = async () => {
        try {
            const response = await axios.post(`http://127.0.0.1:5000/recipes/${id}`);
            const data: Recipe = response.data;
            setRecipe_name(data.recipe_name);
        } catch (error) {
            console.error("Error fetching recipe: ", error);
        }
    };

    const getSteps = async () => {
        try {
            const response = await axios.post(`http://127.0.0.1:5000/recipes/steps/${id}`);
            const data: Step[] = response.data;
            for (const step of data) {
                console.log(step.step_description);
            }
            setSteps(data);
        } catch (error) {
            console.error("Error fetching steps: ", error);
        }
    }

    React.useEffect(() => {
        getRecipeName();
        getCurrentUser();
        getRecipeLists();
        getSteps();
    }, []);

    return (
        <>
            <IconButton
                onClick={() => navigate(-1)}
                style={{ position: "absolute", top: 30, left: 30 }} 
            >
                <ArrowBackIcon sx={{ fontSize: 30, fontWeight: 'bold' }} />
            </IconButton>
            
            <Box
            sx={{
                display: "flex",
                justifyContent: "center",
                flexGrow: 1,
                alignItems: "center",
                fontSize: "24px",
                fontWeight: "bold",
            }}
            >
                <h1>{recipe_name}</h1>
            </Box>

            <Button
                onClick={handleGoToCompletedRecipe}
                variant="contained"
                color="primary"
            >
                Mark as Complete
            </Button>
            <br/>
            <br/>
            <FormControl sx={{width: 400}}>
            <InputLabel id="demo-simple-select-label">Add to a list</InputLabel>
            <Select
                labelId="add-to-list-select-label"
                id="add-to-list-select"
                label="Add to a list"
                value={lid}
                onChange={handleAddRecipeToList}
            >
                {recipeLists.map((recipeList) => (
                    <MenuItem value={recipeList.id}>{recipeList.name}</MenuItem>
                ))}
            </Select>
            </FormControl>
            <FormControl sx={{width: 400}}>
            <InputLabel id="demo-simple-select-label">Remove from a list</InputLabel>
            <Select
                labelId="remove-from-list-select-label"
                id="remove-from-list-select"
                label="Remove from a list"
                value={lid}
                onChange={handleRemoveRecipeFromList}
            >
                {recipeLists.map((recipeList) => ( // TODO: remove lists the recipe is not in
                    <MenuItem value={recipeList.id}>{recipeList.name}</MenuItem>
                ))}
            </Select>
            </FormControl>
            
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

            <Box
                sx={{
                    textAlign: "left"
                }}
            >
                {steps.map((step) => (
                    <Step recipe_id={step.recipe_id} step_number={step.step_number} step_description={step.step_description} />
                ))}
            </Box>

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={handleSnackBarClose}
                message={message}
                action={action}
            />
        </>
    )
}

export default IndividualRecipe;
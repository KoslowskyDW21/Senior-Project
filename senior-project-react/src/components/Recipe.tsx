import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@mui/material"; //matui components
import axios from "axios";

interface Recipe {
    "id": string,
    "recipe_name": string,
    "difficulty": string,
    "xp_amount": string,
    "rating": string,
    "image": string,
}

const IndividualRecipe: React.FC = () => {
    const [ recipe_name, setRecipe_name ] = React.useState<String>();
    const { id } = useParams<{ id: string }>();

    const navigate = useNavigate();

    const handleGoToRecipes = async () => {
        console.log("Navigating to recipes page");
        navigate(`/recipes`);
    }

    const handleGoToCompletedRecipe = async () => {
        console.log("Navigating to completed recipe page");
        navigate(`/recipes/completed/${id}`);
    }

    const getResponse = async () => {
        try {
            const response = await axios.post(`http://127.0.0.1:5000/recipes/${id}`);
            const data: Recipe = response.data;
            setRecipe_name(data.recipe_name);
        } catch (error) {
            console.error("Error fetching recipe: ", error);
        }
    };

    React.useEffect(() => {
        getResponse();
    }, []);

    return (
        <>
            <h1>{recipe_name}</h1>
            <Button
                onClick={handleGoToRecipes}
                variant="contained"
                color="primary"
            >
                Recipes
            </Button>
            <Button
                onClick={handleGoToCompletedRecipe}
                variant="contained"
                color="primary"
            >
                Complete
            </Button>
        </>
    )
}

export default IndividualRecipe;
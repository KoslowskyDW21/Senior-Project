import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@mui/material"; //matui components
import axios from "axios";

interface Recipe {
    id: number;
    name: string;
    difficulty: "1" | "2" | "3" | "4" | "5";
    image_src: string;
  }

interface RecipeList {
    recipes: Recipe[];
}

const RecipeLists: React.FC = () => {
    const [ recipeList, setRecipeList ] = React.useState<Recipe[]>([]);
    const { recipeListId } = useParams<{ recipeListId: string }>();

    const navigate = useNavigate();

    const handleGoToRecipes = async () => {
        console.log("Navigating to recipes page");
        navigate(`/recipes`);
    }

    const getResponse = async () => {
        try {
            const response = await axios.post(`http://127.0.0.1:5000/recipe_lists/${id}`);
            const data: RecipeList = response.data;
            setRecipeList(data); // TODO: figure out how to get the Recipe[] out of a RecipeList (model?)
        } catch (error) {
            console.error("Error fetching recipe: ", error);
        }
    }

    return (
        <>
            <h1>RecipeList</h1>
            {recipeList.map((recipe) => (
          <div key={recipe.id}>
            <button><img src={recipe.image_src} width = "100" onClick={() => navigate(`/recipes/${recipe.id}`)} /></button>
            <p> {recipe.name}</p>
            
          </div> 
          ))}
            <Button
                onClick={handleGoToRecipes}
                variant="contained"
                color="primary"
            >
                Recipes
            </Button>
        </>
    )
}

export default RecipeLists;
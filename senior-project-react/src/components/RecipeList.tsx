import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@mui/material"; //matui components
import axios from "axios";

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

const RecipeLists: React.FC = () => {
    const [ recipes, setRecipes ] = React.useState<Recipe[]>([]);
    const [ recipe_list, setRecipe_list ] = React.useState<RecipeList>();
    const { id } = useParams<{ id: string }>();

    const navigate = useNavigate();

    const handleGoToRecipeLists = async () => {
        console.log("Navigating to all recipe lists page");
        navigate(`/recipe-lists/`);
    }

    const getResponse = async () => {
        try {
            const response = await axios.get(`http://127.0.0.1:5000/recipe_lists/recipes/${id}`);
            const resp_recipes: Recipe[] = response.data;
            console.log(resp_recipes);
            setRecipes(resp_recipes);
            const response2 = await axios.get(`http://127.0.0.1:5000/recipe_lists/info/${id}`);
            const resp_recipe_list: RecipeList = response2.data;
            console.log(resp_recipe_list);
            setRecipe_list(resp_recipe_list);
        } catch (error) {
            console.error("Error fetching recipeList: ", error);
        }
    };

    React.useEffect(() => {
        getResponse();
    }, []);

    if (!recipe_list) {
        return (
            <>
            <p>Loading...</p>
            </>
        )
    }

    return (
        <>
            <h1>{recipe_list.name}</h1>
            {recipes.map((recipe) => (
          <div key={recipe.id}>
            <button><img src={recipe.image} width = "100" onClick={() => navigate(`/recipes/${recipe.id}`)} alt={recipe.recipe_name} /></button>
            <p> {recipe.recipe_name}</p>
            
          </div> 
          ))}
            <Button
                onClick={handleGoToRecipeLists}
                variant="contained"
                color="primary"
            >
                All Lists
            </Button>
        </>
    )
}

export default RecipeLists;
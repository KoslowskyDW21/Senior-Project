import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button, Grid2, Card, CardActionArea, CardHeader, CardMedia } from "@mui/material"; //matui components
import { Star, StarBorder } from "@mui/icons-material"
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

// @ts-expect-error
function Difficulty({ difficulty }) {
  if (difficulty === "1") {
    return (
      <>
        <Star />
        <StarBorder />
        <StarBorder />
        <StarBorder />
        <StarBorder />
      </>
    );
  }
  else if (difficulty === "2") {
    return (
      <>
        <Star />
        <Star />
        <StarBorder />
        <StarBorder />
        <StarBorder />
      </>
    );
  }
  else if (difficulty === "3") {
    return (
      <>
        <Star />
        <Star />
        <Star />
        <StarBorder />
        <StarBorder />
      </>
    );
  }
  else if (difficulty === "4") {
    return (
      <>
        <Star />
        <Star />
        <Star />
        <Star />
        <StarBorder />
      </>
    );
  }
  else {
    return (
      <>
        <Star />
        <Star />
        <Star />
        <Star />
        <Star />
      </>
    );
  }
}

// @ts-expect-error
function Recipe({ id, name, difficulty, image }) {
    const navigate = useNavigate(); //for navigation
    id = id.toString(); // hacky insurance against mistakes
  
    const handleGoToRecipe = async () => {
      console.log(`Navigating to recipe page of recipe with id=${id}`);
      navigate(`/recipes/${id}`);
    }
  
    return (
        <>
        <Card variant="outlined"> {/* I'd like for the cards to be smaller but that's low priority */}
            <CardActionArea
            onClick={handleGoToRecipe}
            >
            <CardHeader
                title={name}
                subheader={Difficulty({difficulty})}
            />
            <CardMedia
                component="img"
                image={image}
            />
            </CardActionArea>
        </Card>
        <Button variant="outlined" color="error">Delete</Button>
        </>
    );
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

    const handleRemoveRecipeFromList = async () => {
        // TODO: implement
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

            {/* Implements a single-column view of recipes in list (GROSS) */}
            {/* {recipes.map((recipe) => (
          <div key={recipe.id}>
            <button><img src={recipe.image} width = "100" onClick={() => navigate(`/recipes/${recipe.id}`)} alt={recipe.recipe_name} /></button>
            <p> {recipe.recipe_name}</p>
          </div> 
          ))} */}

          {/* Implements a grid view of recipes */}
          <Grid2 container spacing={3}>
            {recipes.map((recipe) => (
                <Grid2 size={4} key={recipe.id}>
                    <Recipe id={recipe.id} name={recipe.recipe_name} difficulty={recipe.difficulty} image={recipe.image} />
                </Grid2>
            ))}
          </Grid2>
            <br />
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
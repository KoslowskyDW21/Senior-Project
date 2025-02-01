import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button, Grid2, Card, CardActionArea, CardHeader, CardMedia } from "@mui/material"; //matui components
import { Star, StarBorder } from "@mui/icons-material"
import axios, { AxiosError } from "axios";

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

interface RemoveRecipeFromListResponse {
  message: string;
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

const RecipeLists: React.FC = () => {
    const [ recipes, setRecipes ] = React.useState<Recipe[]>([]);
    const [ recipe_list, setRecipe_list ] = React.useState<RecipeList>();
    const { id } = useParams<{ id: string }>();

    const navigate = useNavigate();

    const handleGoToRecipeLists = async () => {
        console.log("Navigating to all recipe lists page");
        navigate(`/recipe-lists/`);
    }

    const getRecipesAndThisList = async () => {
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

// @ts-expect-error
function Recipe({ rid, name, difficulty, image, lid }) {
  const [ message, setMessage ] = React.useState<String>();
  const navigate = useNavigate(); //for navigation
  rid = rid.toString(); // hacky insurance against mistakes

  const handleGoToRecipe = async () => {
    console.log(`Navigating to recipe page of recipe with id=${rid}`);
    navigate(`/recipes/${rid}`);
  }

  const handleRemoveRecipeFromList = async () => {
    if (rid == undefined) {
      return;
    }
    console.log(`Trying to remove recipe ${rid} from this list`);
    const formData = new FormData();
    formData.append("rid", rid.toString());
    formData.append("lid", lid);
    try {
      const response = await axios.post(
        "http://127.0.0.1:5000/recipe_lists/remove-recipe-from-list",
        formData,
        {headers: {"Content-Type": "multipart/form-data"} }
      );
      const data: RemoveRecipeFromListResponse = response.data;
      setMessage(data.message);
      console.log(data.message);
      getRecipesAndThisList();
    } catch (error) {
      const axiosError = error as AxiosError;
      if (axiosError.response && axiosError.response.data) {
        const errorData = axiosError.response.data as RemoveRecipeFromListResponse
        setMessage(errorData.message);
      } else {
        setMessage("An unknown error occurred--how spooky");
      }
    }
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
        <Button variant="outlined"
         color="error"
          onClick={handleRemoveRecipeFromList}
          >
            Delete
          </Button>
        </>
    );
  } // end of embedded Recipe component definition

    React.useEffect(() => {
        getRecipesAndThisList();
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

          {/* Implements a grid view of recipes */}
          <Grid2 container spacing={3}>
            {recipes.map((recipe) => (
                <Grid2 size={4} key={recipe.id}>
                    <Recipe rid={recipe.id} name={recipe.recipe_name} difficulty={recipe.difficulty} image={recipe.image} lid={id} />
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
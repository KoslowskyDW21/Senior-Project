import React, { useState } from "react";
import axios, { AxiosError } from "axios";
import { useNavigate } from "react-router-dom"; // React Router for nav
import { Button, TextField, Container, Card, CardHeader, CardMedia, CardActionArea } from "@mui/material"; //matui components
import Grid from "@mui/material/Grid2";
import { Star, StarBorder } from "@mui/icons-material"

interface Recipe {
  id: number;
  recipe_name: string;
  difficulty: "1" | "2" | "3" | "4" | "5";
  xp_amount: number;
  rating: number;
  image: string;
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
    <Card variant="outlined">
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
  );
}

function createRecipe(recipe: Recipe) {
  console.log(recipe.id);
  console.log(recipe.recipe_name);
  console.log(recipe.difficulty);
  console.log(recipe.image);

  return <Recipe id={recipe.id} name={recipe.recipe_name} difficulty={recipe.difficulty} image={recipe.image} />;
  // return <Recipe id="1" name="Apple Frangipan Tart" difficulty="1" image="" />;
}

const Recipes: React.FC = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [ current_user, setCurrent_user ] = React.useState<User>();
  const navigate = useNavigate(); //for navigation

  const handleGoToProfile = async () => {
    console.log("Navigating to profile page");
    navigate(`/profile`); // TODO: get current user and put that here instead
  }

  const handleGoToChallenges = async () => {
    console.log("Navigating to challenges page");
    navigate(`/challenges`);
  }

  const handleGoToAchievements = async() => {
    console.log("Navigating to achievements page");
    navigate(`/achievements`)
  }

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

  async function loadRecipes() {
    try {
      const response = await axios.post("http://127.0.0.1:5000/recipes/");
      const data = response.data;
      setRecipes(data);
    }
    catch (error) {
      	console.error("Unable to fetch recipes", error);
    }
  }

  React.useEffect(() => {
    loadRecipes();
  }, []);

  return (
    <div>
      <Button
        onClick={handleGoToProfile}
        variant="contained"
        color="primary"
      >
        Profile
      </Button>
      <Button
        onClick={handleGoToChallenges}
        variant="contained"
        color="primary"
      >
        Challenges
      </Button>
      <Button
        onClick={handleGoToAchievements}
        variant="contained"
        color="primary"
      >
        Achievements
      </Button>

      <h1>Welcome to the Recipes Page!</h1>
      <h4>Here are your delicious recipes.</h4>

      <Grid container spacing={3}>
        {recipes.map((recipe) => (
          <Grid size={4} key={recipe.id}>
            <Recipe id={recipe.id} name={recipe.recipe_name} difficulty={recipe.difficulty} image={recipe.image} />
          </Grid>
        ))}
      </Grid>
    </div>
  );
};

export default Recipes;

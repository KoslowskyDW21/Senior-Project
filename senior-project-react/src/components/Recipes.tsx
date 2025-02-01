import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // React Router for nav
import { Button, Card, CardHeader, CardMedia, CardActionArea, Menu, MenuItem, IconButton, Avatar} from "@mui/material"; //matui components
import Grid from "@mui/material/Grid2";
import { Star, StarBorder } from "@mui/icons-material"
import PersonIcon from '@mui/icons-material/Person';

interface Recipe {
  id: number;
  recipe_name: string;
  difficulty: "1" | "2" | "3" | "4" | "5";
  xp_amount: number;
  rating: number;
  image: string;
}

interface User {
  profile_picture: string,
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

  const[profile_picture, setProfile_picture] = useState<string>();

  const navigate = useNavigate();

  const handleGoToProfile = async () => {
    navigate(`/profile`);
  }

  const handleGoToChallenges = async () => {
    navigate(`/challenges`);
  }

  const handleGoToAchievements = async() => {
    navigate(`/achievements`)
  }

  const handleGoToRecipeLists = async () => {
    navigate(`/recipe-lists/`);
  }

  const handleGoToGroups = async () => {
    navigate(`/groups`);
  }

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget); 
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  


   const getCurrentUser = async () => {
     try {
         const response = await axios.post(`http://127.0.0.1:5000/profile/get_profile_pic/`);
         const data: User = response.data;
         setProfile_picture(data.profile_picture)
         console.log(profile_picture)
     } catch (error) {
         console.error("Error fetching user: ", error);
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
    getCurrentUser();
    loadRecipes();
  }, []);

  return (
    <div>
        <IconButton
          onClick={handleClick}
          style={{ position: "absolute", top: 16, right: 16 }}
        >
        {profile_picture ? (
          <Avatar alt="Profile Picture" src={profile_picture} sx={{ width: 50, height: 50 }} />
        ) : (
          <Avatar sx={{ width: 50, height: 50, backgroundColor: "gray" }}>
            <PersonIcon sx={{ color: "white" }} />
          </Avatar>
        )}
        </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <MenuItem onClick={handleGoToProfile}>Profile</MenuItem>
        <MenuItem onClick={handleGoToChallenges}>Challenges</MenuItem>

      </Menu>
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
      <Button
        onClick={handleGoToRecipeLists}
        variant="contained"
        color="primary"
      >
        Recipe Lists
      </Button>
      <Button
        onClick={handleGoToGroups}
        variant="contained"
        color="primary"
      >
        Groups
      </Button>

      <h1>Welcome to the Recipes Page!</h1>

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

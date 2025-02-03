import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // React Router for nav
import { Button, Card, CardHeader, CardMedia, CardActionArea, Menu, MenuItem, IconButton, Avatar, TextField, Box} from "@mui/material"; //matui components
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
  const [admin, setAdmin] = useState<boolean>(false);

  const [ searchQuery, setSearchQuery ] = useState<string>("");
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

  const handleGoToSettings = async () => {
    navigate('/settings')
  }

  const handleGoToAdmin = async () => {
    navigate('/admin');
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

  async function isAdmin() {
    await axios.get("http://127.0.0.1:5000/admin/")
      .then((response) => {
        setAdmin(response.data.is_admin);
      })
      .catch((error) => {
        console.error("Unable to check if user is admin", error)
      })
  }

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  }

  const filteredRecipes = recipes.filter((recipe) => 
  recipe.recipe_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  React.useEffect(() => {
    getCurrentUser();
    loadRecipes();
    isAdmin();
  }, []);

  return (
    <div>
      <Box
  sx={{
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    display: 'flex',
    alignItems: 'center',
    padding: '10px 20px',
    backgroundColor: '#fff',
    boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.1)',
    zIndex: 1000,
    height: '100px', 
  }}
>
    <Box
    sx={{
      width: 70,
      height: 70,
      backgroundColor: 'lightgray',  
      borderRadius: 2,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: '20px',  
    }}
  >
    <img 
      src="http://127.0.0.1:5000/static\uploads\2cc38bfefa3a4e26b89ac081ff6cf7df_cook.jpg"
      alt="Image"
      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
    />
    </Box>

    <Box
    sx={{
      flexGrow: 1,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      fontSize: '24px',
      fontWeight: 'bold',
      textAlign: 'center',
    }}
  >
    <h1>Recipes</h1>
    </Box>
    <IconButton
    onClick={handleClick}
    style={{ position: "relative", top: 8, right: 8 }}
  >
    {profile_picture ? (
      <Avatar alt="Profile Picture" src={profile_picture} sx={{ width: 70, height: 70, border: '1px solid #000' }} />
    ) : (
      <Avatar sx={{ width: 70, height: 70, backgroundColor: "gray" }}>
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
    <MenuItem onClick={handleGoToSettings}>Settings</MenuItem>
    {admin ? <MenuItem onClick={handleGoToAdmin}>Admin Controls</MenuItem> : <></>}
    <MenuItem onClick={handleGoToRecipeLists}>Recipe Lists</MenuItem>
    <MenuItem onClick={handleGoToAchievements}>Achievements</MenuItem>
  </Menu>
  </Box>
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      fontSize: '24px',
      fontWeight: 'bold',
      textAlign: 'center',
    }}
    >
      <h1></h1>

  <Box mt={4} mb={2} textAlign="center">
    <TextField
      label="Search Recipes"
      variant="outlined"
      fullWidth
      value={searchQuery}
      onChange={handleSearchChange}
      sx={{
        zIndex: 1001,
        position: "fixed",
        top: screenTop + 20, // TODO: make these relative for mobile
        left: 480,
        right: 25,
        width: 500
      }}
    />
  </Box>

  </Box>
      <Grid container spacing={3}>
        {filteredRecipes.map((recipe) => (
          <Grid size={4} key={recipe.id}>
            <Recipe id={recipe.id} name={recipe.recipe_name} difficulty={recipe.difficulty} image={recipe.image} />
          </Grid>
        ))}
      </Grid>

      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'space-around',
        padding: '10px',
        backgroundColor: '#fff',
        boxShadow: '0px -2px 5px rgba(0, 0, 0, 0.1)',
        zIndex: 1000,
      }}>
        <Button variant ="outlined" color="primary" sx={{ flex: 1 }}>
          Recipes
        </Button>
        <Button onClick={handleGoToChallenges} variant="contained" color="primary" sx={{ flex: 1 }}>
          Challenges
        </Button>
        <Button onClick={handleGoToGroups} variant="contained" color="primary" sx={{ flex: 1 }}>
          Groups
        </Button>
      </div>
    </div>
  );
};

export default Recipes;

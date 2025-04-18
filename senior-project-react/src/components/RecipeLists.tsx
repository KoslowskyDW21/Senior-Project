import React from "react";
import axios, { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import {
  Button,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Grid2,
  IconButton,
  Box,
} from "@mui/material";
import config from "../config.js";
import Header from "./Header";

interface RecipeList {
  id: number;
  name: string;
  belongs_to: number;
  image: string;
}

interface RecipeListDeletionResponse {
  message: string;
}

interface User {
  id: string;
  fname: string;
  lname: string;
  email_address: string;
  username: string;
  profile_picture: string;
  xp_points: number;
  user_level: number;
  is_admin: boolean;
  num_recipes_completed: number;
  colonial_floor: string;
  colonial_side: string;
  date_created: string;
  last_logged_in: string;
  num_reports: number;
}

const RecipeLists: React.FC = () => {
  const [currentUserId, setCurrentUserId] = React.useState<string | null>(null);
  const [recipeLists, setRecipeLists] = React.useState<RecipeList[]>([]);
  const [message, setMessage] = React.useState<String>("");
  const navigate = useNavigate();

  const handleGoToRecipes = async () => {
    console.log("Navigating to recipe page");
    navigate(`/recipes/`);
  };

  const handleGoToRecipeCreation = async () => {
    console.log("Navigating to create recipe list page");
    navigate(`/recipe-lists/create`);
  };

  const getCurrentUser = async () => {
    console.log("Getting FULL JSON of current user");
    try {
      const response = await axios.post( // why did we do this?
        `${config.serverUrl}/profile/current_user`
      );
      const data: User = response.data;
      setCurrentUserId(data.id);
    } catch (error) {
      console.error("Error fetching current user: ", error);
    }
  };

  const getResponse = async () => {
    try {
      await getCurrentUser();
    } catch (error) {
      console.error(`Error in fetching current_user's id`);
    }
    try {
      const response = await axios.get(`${config.serverUrl}/recipe_lists/all`);
      const data: RecipeList[] = response.data;
      setRecipeLists(data);
    } catch (error) {
      console.error(
        `Error in fetching RecipeList[] for user id=${currentUserId}: ${error}`
      );
    }
  };

  function RecipeList({ lid, name, belongs_to, image }: any) {
    const handleGoToRecipeList = async () => {
      console.log(`Navigating to page of RecipeList ${lid}`);
      navigate(`/recipe-lists/${lid}`);
    };
    const handleDeleteList = async () => {
      if (lid == undefined) {
        return;
      }
      console.log(`Deleting recipe list ${lid}`);
      const formData = new FormData();
      formData.append("lid", lid);
      try {
        const response = await axios.post(
          `${config.serverUrl}/recipe_lists/deletelist`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        const data: RecipeListDeletionResponse = response.data;
        setMessage(data.message);
        console.log(message);
        getResponse(); // reload RecipeList list
      } catch (error) {
        const axiosError = error as AxiosError;
        if (axiosError.response && axiosError.response.data) {
          const errorData = axiosError.response
            .data as RecipeListDeletionResponse;
          setMessage(errorData.message);
        } else {
          setMessage("An unknown error occured");
        }
      }
    };
    return (
      <>
        <Card
          variant="outlined"
          onClick={handleGoToRecipeList}
          sx={{ cursor: "pointer" }}
        >
          <CardContent>
            <Typography variant="h4" component="div" gutterBottom>
              {name}
            </Typography>
            <br />
            {image && (
              <CardMedia
                component="img"
                image={`${config.serverUrl}/${image}`}
                sx={{
                  height: "auto",
                  objectFit: "contain",
                  width: "100%",
                  maxHeight: 200,
                }}
              />
            )}
            <Button
              variant="outlined"
              color="error"
              onClick={(e) => {
                {
                  e.stopPropagation();
                  handleDeleteList();
                }
              }}
            >
              Delete List
            </Button>
          </CardContent>
        </Card>
      </>
    );
  }

  React.useEffect(() => {
    getResponse();
  }, []);

  return (
    <div>
      <Header title="Recipe Lists" />
      {/* Spacer */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-start",
          alignItems: "center",
          fontSize: "24px",
          fontWeight: "bold",
          textAlign: "center",
          mt: 12,
        }}
      ></Box>

      <IconButton
        onClick={() => navigate("/recipes/")}
        style={{ position: "fixed", top: "clamp(70px, 10vw, 120px)",
          left: "clamp(0px, 1vw, 100px)",
          zIndex: 1000, }}
      >
        <ArrowBackIcon sx={{ fontSize: 30, fontWeight: "bold" }} />
      </IconButton>

      <Box>
        <Grid2 container spacing={2} justifyContent="flex-start">
          {recipeLists.map((recipeList) => (
            <Grid2 xs={12} sm={6} md={4} key={recipeList.id}>
              <Box
                sx={{
                  border: "2px solid rgb(172, 169, 169)",
                  borderRadius: 2,
                  boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.1)",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    borderColor: "#1976d2",
                    boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
                  },
                }}
              >
                <RecipeList
                  lid={recipeList.id}
                  name={recipeList.name}
                  belongs_to={recipeList.belongs_to}
                  image={recipeList.image}
                />
              </Box>
            </Grid2>
          ))}
        </Grid2>
      </Box>

      <br />
      <br />
      <Button onClick={handleGoToRecipeCreation} variant="contained">
        Create new list
      </Button>
    </div>
  );
};

export default RecipeLists;

import React, { useState, useContext } from "react";
import { Theme, useTheme } from "@mui/material/styles";
import { useParams, useNavigate } from "react-router-dom";
import {
  Button,
  FormControl,
  Avatar,
  MenuItem,
  Box,
  Select,
  InputLabel,
  FormControlLabel,
  Checkbox,
  Typography,
  SelectChangeEvent,
  IconButton,
  Container,
  Card,
  CardContent,
  CardMedia,
  Modal,
  Rating,
} from "@mui/material"; //matui components
import axios, { AxiosError } from "axios";
import Snackbar, { SnackbarCloseReason } from "@mui/material/Snackbar";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CloseIcon from "@mui/icons-material/Close";
import config from "../config.js";
import Header from "./Header.js";
import ConfirmationMessage from "./ConfirmationMessage.js";
import { ConfirmationProvider, useConfirmation } from "./ConfirmationHelper.js";

const reportModalStyle = (theme: Theme) => ({
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  bgcolor: theme.palette.background.default,
  boxShadow: 24,
  paddingTop: 3,
  paddingLeft: 7,
  paddingRight: 7,
  paddingBottom: 3,
  textAlign: "center",
});

interface Recipe {
  id: string;
  recipe_name: string;
  difficulty: "1" | "2" | "3" | "4" | "5";
  xp_amount: string;
  rating: "0.5" | "1" | "1.5" | "2" | "2.5" | "3" | "3.5" | "4" | "4.5" | "5";
  image: string;
  achievements: [];
}

interface RecipeList {
  id: number;
  name: string;
  belongs_to: number;
}

interface RecipeIngredient {
  recipe_id: "recipe_id";
  ingredient_id: "ingredient_id";
  ingredient_name: "ingredient_name";
  measure: "measure";
}

interface Review {
  id: number;
  recipe_id: number;
  text: string;
  image: string;
  rating: string;
  difficulty: string;
  num_reports: number;
  user_id: number;
  username: string;
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

interface AddRecipeToListResponse {
  message: string;
}

interface Step {
  recipe_id: string;
  step_number: number;
  step_description: string;
}

function Step({ step_number, step_description }: Step) {
  // State to track whether the step is checked off
  const [checked, setChecked] = useState(false);
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";

  const handleCheckboxChange = () => {
    setChecked(!checked);
  };

  return (
    <Box sx={{ marginBottom: 2 }}>
      {/* FormControlLabel with Checkbox */}
      <FormControlLabel
        control={<Checkbox checked={checked} onChange={handleCheckboxChange} />}
        label={`Step ${step_number}:`}
      />

      {/* Step description with conditional strikethrough */}
      <Typography
        sx={{
          textDecoration: checked ? "line-through" : "none", // Apply strikethrough if checked
          color: checked ? "gray" : isDarkMode ? "white" : "black", // Optional: change color when checked
        }}
      >
        {step_description}
      </Typography>
    </Box>
  );
}

function Difficulty({ difficulty }: any) {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";
  const diamondStyle = {
    width: "clamp(5px, 2vw, 24px)", // Min size 16px, max size 24px, grows based on viewport width
    height: "clamp(5px, 2vw, 24px)",
    backgroundColor: isDarkMode ? "white" : "black",
    transform: "rotate(45deg)",
    marginRight: "clamp(4px, 1vw, 8px)",
  };

  const renderDiamonds = (num: any) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Box key={i} sx={{ ...diamondStyle, opacity: i < num ? 1 : 0.1 }} />
    ));
  };

  return (
    <Box sx={{ display: "flex", justifyContent: "center", padding: "0px" }}>
      {renderDiamonds(Number(difficulty))}
    </Box>
  );
}

function RecipeRemoveSelect({
  lid,
  handleRemoveRecipeFromList,
  recipeListsIn,
}: any) {
  const {open, toggleOpen} = useConfirmation();

  if (recipeListsIn.length === 0) {
    return (
      <FormControl sx={{ width: 400, opacity: 0.5 }}>
        <InputLabel>Remove from a list</InputLabel>
        <Select variant="outlined" disabled={true}></Select>
      </FormControl>
    );
  }
  return (
    <FormControl sx={{ width: 400 }}>
      <InputLabel id="demo-simple-select-label">Remove from a list</InputLabel>
      <Select
        labelId="remove-from-list-select-label"
        id="remove-from-list-select"
        label="Remove from a list"
        value={lid}
        onChange={(event) => {
          handleRemoveRecipeFromList(event);
          toggleOpen();
        }}
      >
        {recipeListsIn.map((recipeList: any) => (
          <MenuItem value={recipeList.id}>{recipeList.name}</MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

const IndividualRecipe: React.FC = () => {
  //const confirmation = useContext(ConfirmationContext);

  const [recipe_name, setRecipe_name] = React.useState<String>();
  const [current_user, setCurrent_user] = React.useState<User>();
  const [message, setMessage] = React.useState("");
  const [lid, ] = React.useState("");
  const [recipeLists, setRecipeLists] = React.useState<RecipeList[]>([]);
  const [recipeListsIn, setRecipeListsIn] = React.useState<RecipeList[]>([]);
  const [steps, setSteps] = React.useState<Step[]>([]);
  const [, setSnackBarOpen] = React.useState(false);
  const { id } = useParams<{ id: string }>();
  const [reviews, setReviews] = React.useState<Review[]>([]);
  const [, setUserReview] = useState<Review | null>(null); // Store the user's review here
  const [reviewId, setReviewId] = useState<number | null>(null);
  const [difficulty, setDifficulty] = useState<string | undefined>();
  const [, setRating] = useState<string | undefined>();
  const [displayRating, setDisplayRating] = useState<string | undefined>();
  const [ingredients, setIngredients] = React.useState<RecipeIngredient[]>([]);
  const [open, setOpen] = useState(false);
  const handleOpenModal = () => setOpen(true);
  const handleCloseModal = () => setOpen(false);
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";
  const [image, setImage] = React.useState<string | undefined>("");

  const navigate = useNavigate();

  // React component necessary for contexts
  function ButtonWithConfirmation({ color, handler, text }: any) {
    const {open, toggleOpen} = useConfirmation();
  
    return (
      <Button
        variant="contained"
        color={color}
        onClick={() => {
          handler();
          toggleOpen();
        }}
      >
        {text}
      </Button>
    )
  }

  function SelectRecipeToAdd() {
    const {open, toggleOpen} = useConfirmation();

    return (
      <Select
        labelId="add-to-list-select-label"
        id="add-to-list-select"
        label="Add to a list"
        value={lid}
        onChange={(event) => {
          handleAddRecipeToList(event);
          toggleOpen();
        }}
      >
        {recipeLists.map((recipeList) => (
          <MenuItem value={recipeList.id}>{recipeList.name}</MenuItem>
        ))}
      </Select>
    )
  }

  const handleGoToCompletedRecipe = async () => {
    console.log("Navigating to completed recipe page");
    navigate(`/recipes/completed/${id}`);
  };

  const handleAddRecipeToList = async (event: SelectChangeEvent) => {
    if (id == undefined) {
      console.log("id is undefined!");
      return;
    }
    console.log(
      `Trying to add this recipe to list number ${event.target.value} `
    );
    const formData = new FormData();
    formData.append("rid", id.toString());
    formData.append("lid", event.target.value); // event.target.value is lid
    try {
      const response = await axios.post(
        `${config.serverUrl}/recipe_lists/add-recipe-to-list`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
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
    getRecipeListsIn();
    setSnackBarOpen(true);
  };

  const handleRemoveRecipeFromList = async (event: SelectChangeEvent) => {
    if (id == undefined) {
      console.log("id is undefined!");
      return;
    }
    console.log(
      `Trying to reove this recipe from list number ${event.target.value}`
    );
    const formData = new FormData();
    formData.append("rid", id.toString());
    formData.append("lid", event.target.value);
    try {
      const response = await axios.post(
        `${config.serverUrl}/recipe_lists/remove-recipe-from-list`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      if (response.status != 200) {
        console.error("Error while trying to remove recipe from list");
        setMessage(response.data.message);
      } else {
        console.log(
          `Successfully removed recipe id=${id.toString} from RecipeList id=${event.target.value}`
        );
        setMessage("Successfully removed recipe from list");
      }
    } catch (error) {
      const axiosError = error as AxiosError;
      if (axiosError.response && axiosError.response.data) {
        const errorData = axiosError.response.data as AddRecipeToListResponse;
        setMessage(errorData.message);
      } else {
        setMessage("An unknown error occurred");
      }
    }
    getRecipeListsIn();
    setSnackBarOpen(true);
  };

  async function handleAddIngredientsOfRecipe() {
    console.log(`Trying to add recipe id=${id}'s ingredients to list`);
    if (id == undefined) {
      console.error("id is undefined!");
      return;
    }
    console.log(
      `Trying to add all ingredients of this recipe to shopping list`
    );
    try {
      const response = await axios.post(
        `${config.serverUrl}/shopping_lists/items/add/${id}`
      );
      if (response.status == 200) {
        setMessage("Recipe successfully added to shopping list");
        console.log(`This recipe added to shopping list`);
      } else {
        setMessage("Recipe failed to be added to list");
        console.log("Recipe failed to be added to list");
      }
    } catch (error) {
      setMessage(
        "Error in trying to add recipe's ingredients to shopping list"
      );
      console.error(
        "Error in trying to add recipe's ingredients to shopping list",
        error
      );
    }
    setSnackBarOpen(true);
  }

  const handleSnackBarClose = (
    event: React.SyntheticEvent | Event,
    reason?: SnackbarCloseReason
  ) => {
    if (reason === "clickaway") {
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
      const response = await axios.post(
        `${config.serverUrl}/profile/current_user`
      );
      const data: User = response.data;
      setCurrent_user(data);
    } catch (error) {
      console.error("Error fetching user: ", error);
    }
  };

  const getReviews = async () => {
    //i am WELL aware that this is stupid - but i could NOT get it to accurately display the user id otherwise
    let myId = "-100";
    try {
      const response = await axios.get(
        `${config.serverUrl}/recipes/reviews/${id}/`
      );
      try {
        const response = await axios.post(`${config.serverUrl}/recipes/user`);
        myId = response.data.id;
      } catch (error) {
        console.error("Error fetching ingredients: ", error);
      }
      setReviews(response.data.reviews);
      const userReview = response.data.reviews.find(
        (review: Review) => review.user_id.toString() === myId
      );
      if (userReview) {
        console.log("should be working");
        setUserReview(userReview); // Set the current user's review if they have one
        setDisplayRating(userReview.rating);
      } else {
        console.log("didnt find nothing");
      }
    } catch (error) {
      console.error("Error fetching reviews: ", error);
    }
  };

  const getRecipeLists = async () => {
    try {
      const response = await axios.get(`${config.serverUrl}/recipe_lists/all`);
      const data: RecipeList[] = response.data;
      setRecipeLists(data);
    } catch (error) {
      if (current_user) {
        console.error(
          `Error in fetching RecipeList[] for user id=${current_user.id}: ${error}`
        );
      } else {
        console.error("Error in fetching RecipeList[] for unknown user");
      }
    }
  };

  const getRecipeListsIn = async () => {
    if (id == undefined) {
      return;
    }
    const response = await axios.get(
      `${config.serverUrl}/recipe_lists/all_containing/${id}`
    );
    const rli: RecipeList[] = response.data;
    console.log(rli);
    setRecipeListsIn(rli);
  };

  const getRecipeInfo = async () => {
    try {
      const response = await axios.get(`${config.serverUrl}/recipes/${id}/`);
      const data: Recipe = response.data;
      setRecipe_name(data.recipe_name);
      setDifficulty(data.difficulty);
      setRating(data.rating);
      setDisplayRating(data.rating);
      setImage(data.image);
      console.log(data.image); // TODO: remove debugging
    } catch (error) {
      console.error("Error fetching recipe: ", error);
    }
  };

  const getSteps = async () => {
    try {
      const response = await axios.post(
        `${config.serverUrl}/recipes/steps/${id}`
      );
      const data: Step[] = response.data;
      for (const step of data) {
        console.log(step.step_description);
      }
      setSteps(data);
    } catch (error) {
      console.error("Error fetching steps: ", error);
    }
  };

  const getIngredients = async () => {
    try {
      const response = await axios.post(
        `${config.serverUrl}/recipes/ingredients/${id}`
      );
      const data: RecipeIngredient[] = response.data;
      setIngredients(data);
    } catch (error) {
      console.error("Error fetching ingredients: ", error);
    }
  };

  const handleReportReview = async () => {
    let data;

    await axios
      .get(`${config.serverUrl}/recipes/${reviewId}/report`)
      .then((response) => {
        data = response.data;
      })
      .catch((error) => {
        console.error("Could not get if already reported", error);
      });

    if (!data!.alreadyReported) {
      const newData = {
        user_id: data!.id,
        review_id: reviewId,
      };

      await axios
        .post(`${config.serverUrl}/recipes/${reviewId}/report`, newData, {
          headers: {
            "Content-Type": "application/json",
          },
        })
        .then((response) => {
          console.log(response.data.message);
          setMessage("Review successfully reported.");
          setSnackBarOpen(true);
          setReviews((prevReviews) =>
            prevReviews.filter((review) => review.id !== reviewId)
          );
        })
        .catch((error) => {
          console.log("Could not report review", error);
        });
    } else {
      console.log("Review already reported");
    }
  };

  React.useEffect(() => {
    getRecipeInfo();
    getCurrentUser();
    getReviews();
    getRecipeLists();
    getSteps();
    getIngredients();
    getRecipeListsIn();
  }, []);

  return (
    <ConfirmationProvider>
      <IconButton
        onClick={() => navigate(-1)}
        style={{ position: "fixed", top: "clamp(70px, 10vw, 120px)",
          left: "clamp(0px, 1vw, 100px)",
          zIndex: 1000, }}
      >
        <ArrowBackIcon sx={{ fontSize: 30, fontWeight: "bold" }} />
      </IconButton>

      <Header title={recipe_name ? recipe_name.toString() : "loading...".toString()}></Header>

      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexShrink: 1,
          width: "auto",
          marginTop: 6, // Add space on top if necessary
          marginBottom: 2, // Add space on bottom if necessary
          padding: "10px", // Optional padding for extra space inside the Box
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexShrink: 1,
            width: "auto",
            fontSize: "24px",
            padding: "30px",
          }}
        >
          {difficulty && <Difficulty difficulty={difficulty} />}
        </Box>

        <Box sx={{ marginLeft: 2, display: "flex", alignItems: "center" }}>
          <Rating
            name="recipe-rating"
            value={Number(displayRating)}
            precision={0.5}
            readOnly
          />
        </Box>
      </Box>
      <br />

      <Box
        sx={{
          objectFit: "contain",
          maxWidth: "100%",
          marginBottom: 2,
        }}
      >
        {image && (<img src={`${config.serverUrl}/${image}`} style={{height:400, width:400}} role="presentation"/>)}
      </Box>

      <Box
        mb={2}
      >
        <FormControl sx={{ width: 400 }}>
          <InputLabel id="demo-simple-select-label">Add to a list</InputLabel>
          <SelectRecipeToAdd/>
        </FormControl>
      </Box>

      <RecipeRemoveSelect
        lid={lid}
        handleRemoveRecipeFromList={handleRemoveRecipeFromList}
        recipeListsIn={recipeListsIn}
      ></RecipeRemoveSelect>

      <br />

      {/* Add recipe's ingredients to the shopping list */}
      <Box
        mt={2}
      >
        <FormControl>
          <ButtonWithConfirmation
            color="primary"
            handler={handleAddIngredientsOfRecipe}
            text="Add to shopping list"
          />
        </FormControl>
      </Box>

      <Box
        sx={{
          textAlign: "left",
          marginTop: 4, // Space between ingredients and other sections
          marginBottom: 4, // Optional space for separation
        }}
      >
        <Typography sx={{ fontWeight: "bold" }}>Ingredients:</Typography>
        {ingredients.length > 0 ? (
          <Box sx={{ marginTop: 2 }}>
            {ingredients.map((ingredient: any) => (
              <Box
                key={ingredient.ingredient_id}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "8px 0",
                  borderBottom: "1px solid #ccc",
                  alignItems: "center", // Center items vertically
                }}
              >
                {/* Checkbox to the left of each ingredient */}
                <Checkbox
                  onChange={(e) => {
                    // Toggle checked state of ingredient
                    const newIngredients = ingredients.map((item) =>
                      item.ingredient_id === ingredient.ingredient_id
                        ? { ...item, checked: e.target.checked }
                        : item
                    );
                    setIngredients(newIngredients); // Update ingredients state
                  }}
                />
                <Typography
                  variant="body1"
                  sx={{
                    textDecoration: ingredient.checked
                      ? "line-through"
                      : "none", // Strikethrough if checked
                    color: ingredient.checked
                      ? "gray"
                      : isDarkMode
                      ? "white"
                      : "black", // Optional: change color if checked
                    flex: 1, // Allow the ingredient name to grow and take available space
                  }}
                >
                  {ingredient.ingredient_name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {ingredient.measure}
                </Typography>
              </Box>
            ))}
          </Box>
        ) : (
          <Typography>No ingredients available.</Typography>
        )}
      </Box>

      <Box
        sx={{
          textAlign: "left",
        }}
      >
        {steps.map((step) => (
          <Step
            recipe_id={step.recipe_id}
            step_number={step.step_number}
            step_description={step.step_description}
          />
        ))}
      </Box>

      <Button
        onClick={handleGoToCompletedRecipe}
        variant="contained"
        color="primary"
      >
        Complete Recipe
      </Button>

      <h2>Reviews: </h2>

      <Box sx={{ textAlign: "left" }}>
        {reviews.length > 0 ? (
          reviews.map((review) => (
            <Card
              key={review.id}
              sx={{
                marginBottom: 2,
                border: "1px solid #ccc",
                borderRadius: 2,
                boxShadow: 2,
              }}
            >
              <CardContent>
                <Typography variant="h6">{review.username}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {review.text}
                </Typography>
                {review.difficulty !== "0" && (
                  <Typography variant="body2" color="text.secondary">
                    Difficulty: {review.difficulty}
                  </Typography>
                )}
                {review.rating !== "0" && (
                  <Typography variant="body2" color="text.secondary">
                    Rating: {review.rating}
                  </Typography>
                )}
                {review.image != "NULL" && (
                  <CardMedia
                    component="img"
                    height="200"
                    image={`${config.serverUrl}/${review.image}`}
                    alt="Review Image"
                    sx={{
                      objectFit: "contain",
                      maxWidth: "100%",
                      marginBottom: 2,
                    }}
                  />
                )}
                <Button
                  style={{
                    position: "relative",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, 0%)",
                  }}
                  variant="contained"
                  color="error"
                  onClick={() => {
                    setReviewId(review.id);
                    handleOpenModal();
                  }}
                >
                  Report Review
                </Button>
              </CardContent>
            </Card>
          ))
        ) : (
          <Typography>No reviews yet.</Typography>
        )}
      </Box>

      <Modal
        open={open}
        onClose={handleCloseModal}
        aria-labelledby="modal-title"
      >
        <Box sx={reportModalStyle(theme)}>
          <IconButton
            onClick={handleCloseModal}
            style={{ position: "absolute", top: 5, right: 5 }}
          >
            <CloseIcon sx={{ fontSize: 30, fontWeight: "bold" }} />
          </IconButton>

          <Typography id="modal-title" variant="h4" component="h2">
            Report Review
          </Typography>

          <FormControl variant="filled" sx={{ m: 1, width: 250 }} size="small">
            <InputLabel id="reason-label">Reason</InputLabel>
            <Select labelId="reason-label"></Select>
          </FormControl>
          <br />
          <ButtonWithConfirmation
            color="error"
            handler={() => {
              handleReportReview();
              handleCloseModal();
            }}
            text="Confirm Report"
          />
        </Box>
      </Modal>

      <ConfirmationMessage
        message={message}
      />
    </ConfirmationProvider>
  );
};

export default IndividualRecipe;

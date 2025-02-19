import axios, { AxiosError } from "axios";
import { useState } from "react";
import React from "react";
import {
  Button,
  InputLabel,
  Select,
  MenuItem,
  Modal,
  FormControl,
  SelectChangeEvent,
  Box,
  FormHelperText,
  Checkbox,
  ListItemText,
  IconButton,
  TextField,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useMsal } from "@azure/msal-react";

interface DeleteResponse {
  message: string;
}

export interface User {
  id: number;
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
  date_create: Date;
  last_logged_in: Date;
  num_reports: number;
}

interface UserCuisines {
  cuisines: [];
  userCuisines: [];
}

interface DietaryRestrictions {
  dietaryRestrictions: [];
  userDietaryRestrictions: [];
}

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  pt: 2,
  px: 4,
  pb: 3,
};

async function updateUser(floor: string, side: string) {
  try {
    // Sending the updated data to the backend
    const response = await axios.post(
      "http://127.0.0.1:5000/settings/update/",
      {
        floor: floor,
        side: side,
      }
    );
    console.log("User updated successfully:", response.data);
  } catch (error) {
    console.error("Could not update user: ", error);
  }
}

export default function Settings() {
  const [user, setUser] = useState({
    id: null,
    fname: null,
    lname: null,
    username: "",
    profile_picture: null,
    colonial_floor: "",
    colonial_side: "",
  });
  const [username, setUsername] = useState<string>("");
  const [usernameTaken, setUsernameTaken] = useState<boolean>(false);
  const [colonialFloor, setColonialFloor] = useState<string>("");
  const [colonialSide, setColonialSide] = useState<string>("");

  const [message, setMessage] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const navigate = useNavigate();

  const [cuisines, setCuisines] = useState<[]>([]);
  const [userCuisines, setUserCuisines] = useState<[]>([]);
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);

  const [dietaryRestrictions, setDietaryRestrictions] = useState<[]>([]);
  const [userDietaryRestrictions, setUserDietaryRestrictions] = useState<[]>(
    []
  );
  const [selectedDietaryRestrictions, setSelectedDietaryRestrictions] =
    useState<string[]>([]);

  async function loadUser() {
    await axios
      .get("http://127.0.0.1:5000/settings/")
      .then((response) => {
        setUser(response.data);
        setUsername(user.username);
        setColonialFloor(user.colonial_floor);
        setColonialSide(user.colonial_side);
        console.log("Username: " + username);
        console.log("Floor: " + user.colonial_floor);
        console.log("Side: " + user.colonial_side);
        loadCuisines();
      })
      .catch((error) => {
        console.log("Could not fetch user: ", error);
      });
  }

  async function loadCuisines() {
    await axios
      .get("http://127.0.0.1:5000/settings/cuisines/")
      .then((response) => {
        const data: UserCuisines = response.data;
        setCuisines(data.cuisines);
        setUserCuisines(data.userCuisines);
      })
      .catch((error) => {
        console.log("Could not fetch cuisines: ", error);
      });
  }

  async function updateUserCuisines(selectedIds: number[]) {
    try {
      const data = {
        user_id: user.id,
        selected_cuisines: selectedIds,
      };
      await axios.post(
        "http://127.0.0.1:5000/settings/update_cuisines/",
        data,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      console.log("Cuisines updated successfully!");
    } catch (error) {
      console.error("Error updating cuisines: ", error);
    }
  }

  const getDietaryRestrictions = async () => {
    try {
      const response = await axios.post(
        "http://127.0.0.1:5000/settings/dietary_restrictions/",
        {},
        { withCredentials: true }
      );
      console.log("response: ", response);
      const data: DietaryRestrictions = response.data;
      console.log("data: " + data);
      setDietaryRestrictions(data.dietaryRestrictions);
      setUserDietaryRestrictions(data.userDietaryRestrictions);
    } catch (error) {
      console.error("Could not fetch dietary restrictions:", error);
    }
  };

  async function updateDietaryRestrictions(selectedIds: number[]) {
    try {
      const data = {
        user_id: user.id,
        selected_dietary_restrictions: selectedIds,
      };
      await axios.post(
        "http://127.0.0.1:5000/settings/update_dietary_restrictions/",
        data,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      console.log("Dietary restrictions updated successfully!");
      console.log(dietaryRestrictions);
    } catch (error) {
      console.error("Error updating dietary restrictions: ", error);
    }
  }

  async function handleDelete() {
    try {
      const response = await axios.post(
        "http://127.0.0.1:5000/settings/api/delete_account/"
      );
      console.log("Response:");
      console.log(response);
      const data: DeleteResponse = response.data;
      setMessage(data.message);
      console.log("Message:");
      console.log(data.message);
      if (data.message === "Account deleted successfully") {
        navigate("/deleted_account");
      }
    } catch (error) {
      const axiosError = error as AxiosError;

      if (axiosError.response && axiosError.response.data) {
        const errorData = axiosError.response.data as DeleteResponse;
        setMessage(errorData.message);
      } else {
        setMessage("An unknown error occurred");
      }
    }
  }
  
  async function updateUsername() {
    const data = {
      username: username,
    };
    await axios.post("http://127.0.0.1:5000/settings/update_username/", data, {
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        console.log(response.data.message);
        setUsernameTaken(response.data.alreadyTaken);
      })
      .catch((error) => {
        console.error("Could not update username", error);
      });
  }

  React.useEffect(() => {
    loadUser();
    getDietaryRestrictions();
  }, []);

  React.useEffect(() => {
    console.log("Dietary Restrictions:", dietaryRestrictions);
    console.log("User Dietary Restrictions:", userDietaryRestrictions);
    const preselectedCuisines = cuisines
      .filter((cuisine) =>
        userCuisines.some(
          (userCuisine) =>
            userCuisine.cuisine_id === cuisine.id &&
            userCuisine.userSelected === true
        )
      )
      .map((cuisine) => cuisine.name);

    setSelectedCuisines(preselectedCuisines);
  }, [cuisines, userCuisines]);

  React.useEffect(() => {
    const preselectedDietaryRestrictions = dietaryRestrictions
      .filter((dietaryRestriction) =>
        userDietaryRestrictions.some(
          (userDietaryRestriction) =>
            userDietaryRestriction.restriction_id === //use the actual ID attribute from the SQL table
            dietaryRestriction.id
        )
      )
      .map((dietaryRestriction) => dietaryRestriction.name);

    setSelectedDietaryRestrictions(preselectedDietaryRestrictions);
    console.log(preselectedDietaryRestrictions);
  }, [dietaryRestrictions, userDietaryRestrictions]);

  const handleCuisineChange = (
    event: SelectChangeEvent<typeof selectedCuisines>
  ) => {
    const selectedNames = event.target.value;
    const selectedIds = cuisines
      .filter((cuisine) => selectedNames.includes(cuisine.name))
      .map((cuisine) => cuisine.id);

    if (selectedIds.length <= 5) {
      setSelectedCuisines(selectedNames);
      updateUserCuisines(selectedIds);
    } else {
      alert("You can only select up to 5 cuisines.");
    }
  };

  const handleDietaryRestrictionsChange = (
    event: SelectChangeEvent<typeof selectedDietaryRestrictions>
  ) => {
    const selectedNames = event.target.value;
    const selectedIds = dietaryRestrictions
      .filter((dietaryRestriction) =>
        selectedNames.includes(dietaryRestriction.name)
      )
      .map((dietaryRestriction) => dietaryRestriction.id);

    setSelectedDietaryRestrictions(selectedNames);
    updateDietaryRestrictions(selectedIds);
  };

  const handleFloorChange = (event: SelectChangeEvent) => {
    const newFloor = event.target.value;
    console.log("Floor: " + newFloor);
    console.log("Side: " + colonialSide);
    setColonialFloor(newFloor);
    setUser((prevUser) => ({
      ...prevUser,
      colonial_floor: newFloor,
    }));
    updateUser(newFloor, user.colonial_side);
  };

  const handleSideChange = (event: SelectChangeEvent) => {
    const newSide = event.target.value;
    console.log("Floor: " + user.colonial_floor);
    console.log("Side: " + newSide);
    setColonialSide(newSide);
    setUser((prevUser) => ({
      ...prevUser,
      colonial_side: newSide,
    }));
    updateUser(user.colonial_floor, newSide);
  };

  const handleUsernameChange = () => {
    updateUsername();
  }

  const handleOpenModal = () => {
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handleConfirmDelete = () => {
    handleDelete();
    setOpenModal(false);
  };

  const { instance } = useMsal();

  const handleLogout = async () => {
    try {
      // Get access token
      const response = await instance.acquireTokenSilent({
        scopes: ["User.Read"],
      });

      const token = response.idToken;

      await axios.post(
        "http://127.0.0.1:5000/api/logout/",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      instance.logoutRedirect().then(() => {
        navigate("/");
      });
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  console.log("Username: " + username);

  return (
    <>
      <IconButton aria-label="back"
        onClick={() => navigate(-1)}
        style={{ position: "absolute", top: 30, left: 30 }}
      >
        <ArrowBackIcon sx={{ fontSize: 30, fontWeight: "bold" } } />
      </IconButton>
      <h1>Settings Page</h1>
      <main role="main">
      <p>
        Name: {user.fname} {user.lname}
      </p>
      <p>Username: {user.username}</p>
      <p>Colonial Floor: {user.colonial_floor}</p>
      <p>Colonial Side: {user.colonial_side}</p>

      <h2>Change Personal Details</h2>

      <FormControl variant="filled" sx={{ m: 1, width: 250 }} size="small" >
        <Select
          displayEmpty
          value={colonialFloor}
          onChange={handleFloorChange}
          renderValue={(selected) => {
            if (selected.length === 0) {
              return <i>{user.colonial_floor}</i>;
            }
            return selected;
          }}
        >
          <MenuItem disabled value="">
            {user.colonial_floor}
          </MenuItem>
          <MenuItem value={1}>One</MenuItem>
          <MenuItem value={2}>Two</MenuItem>
          <MenuItem value={3}>Three</MenuItem>
          <MenuItem value={4}>Four</MenuItem>
        </Select>
        <FormHelperText>Colonial Floor</FormHelperText>
      </FormControl>

      <FormControl variant="filled" sx={{ m: 1, width: 250 }} size="small" aria-label="side-select">
        <Select
          displayEmpty
          value={colonialSide}
          onChange={handleSideChange}
          renderValue={(selected) => {
            if (selected.length === 0) {
              return <i>{user.colonial_side}</i>;
            }
            return selected;
          }}
        >
          <MenuItem disabled value="" aria-label="default-text">
            {user.colonial_side}
          </MenuItem>
          <MenuItem value={"Mens"}>Men's</MenuItem>
          <MenuItem value={"Womens"}>Women's</MenuItem>
        </Select>
        <FormHelperText>Colonial Side</FormHelperText>
      </FormControl>

      <br />
      <br />

      <h2>Change Account Details</h2>
      
      {!usernameTaken ?
        <TextField
          aria-label="username-textfield"
          size="small"
          helperText="Username"
          value={user.username}
          variant="filled"
          onChange={(e) => {
            const newUsername = e.target.value;

            setUsername(newUsername);
            setUser((prevUser) => ({
              ...prevUser,
              username: newUsername,
            }));
          }}
        />
      :
        <TextField
          error
          aria-label="username-textfield"
          size="small"
          helperText="Error: Username already taken"
          value={user.username}
          variant="filled"
          onChange={(e) => {
            const newUsername = e.target.value;

            setUsernameTaken(false);
            setUsername(newUsername);
            setUser((prevUser) => ({
              ...prevUser,
              username: newUsername,
            }));
          }}
        />
      }

      <Button
        sx={{ marginLeft: 2 }}
        variant="contained"
        color="primary"
        onClick={handleUsernameChange}
      >
        Save
      </Button>

      <br />
      <br />

      <h2>Change Cuisine Preferences</h2>

      <FormControl variant="filled" sx={{ m: 1, width: 250 }} size="small">
        <InputLabel id="cuisine-select-label">Cuisines</InputLabel>
        <Select
          labelId="cuisine-select-label"
          multiple
          value={selectedCuisines}
          onChange={handleCuisineChange}
          renderValue={(selected) => selected.join(", ")}
          displayEmpty
        >
          <MenuItem value="" disabled>
            <em>Choose a cuisine</em>
          </MenuItem>
          {cuisines &&
            cuisines.map((cuisine, index) => (
              <MenuItem key={index} value={cuisine.name}>
                <Checkbox
                  checked={selectedCuisines.indexOf(cuisine.name) > -1}
                />
                <ListItemText primary={cuisine.name} />
              </MenuItem>
            ))}
        </Select>
        <FormHelperText>Select Favorite Cuisines</FormHelperText>
      </FormControl>

      <FormControl variant="filled" sx={{ m: 1, width: 250 }} size="small">
        <InputLabel id="dietary_restriction-select-label">
          Dietary Restrictions
        </InputLabel>
        <Select
          labelId="dietary_restriction-select-label"
          multiple
          value={selectedDietaryRestrictions}
          onChange={handleDietaryRestrictionsChange}
          renderValue={(selected) => selected.join(", ")}
          displayEmpty
        >
          <MenuItem value="" disabled>
            <em>Choose a dietary restriction</em>
          </MenuItem>
          {dietaryRestrictions.map((restriction) => (
            <MenuItem key={restriction.id} value={restriction.name}>
              <Checkbox
                checked={selectedDietaryRestrictions.includes(restriction.name)}
              />
              <ListItemText primary={restriction.name} />
            </MenuItem>
          ))}
        </Select>
        <FormHelperText>Select Dietary Restrictions</FormHelperText>
      </FormControl>

      <br />
      <br />

      <Box mt={4} display="flex" flexDirection="column" gap={2}>
        <Button variant="contained" color="error" onClick={handleOpenModal}>
          Delete Account
        </Button>
        <Button variant="contained" color="primary" onClick={handleLogout}>
          Logout
        </Button>
      </Box>

      <Modal open={openModal} onClose={handleCloseModal}>
        <Box sx={modalStyle}>
          <h2>Are you sure you want to delete your account?</h2>
          <Button
            onClick={handleConfirmDelete}
            variant="contained"
            color="error"
            sx={{ marginRight: 2 }}
          >
            Yes, delete my account
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleCloseModal}
          >
            Cancel
          </Button>
        </Box>
      </Modal>
      </main>
    </>
  );
}

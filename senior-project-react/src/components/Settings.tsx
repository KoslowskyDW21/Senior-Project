import axios, { AxiosError } from "axios";
import { useState } from "react";
import React from "react";
import { Button, InputLabel, Select, MenuItem, Modal, FormControl, SelectChangeEvent, Box, FormHelperText } from "@mui/material";
import { ShouldRevalidateFunction, useNavigate } from "react-router-dom";


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
  xp_points: number
  user_level: number
  is_admin: boolean
  num_recipes_completed: number
  colonial_floor: string;
  colonial_side: string;
  date_create: Date;
  last_logged_in: Date;
  num_reports: number;
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

export default function Settings() {
  const [user, setUser] = useState({
    id: null,
    fname: null,
    lname: null,
    profile_picture: null,
    colonial_floor: "",
    colonial_side: "",
  });
  const [colonialFloor, setColonialFloor] = useState<string>("");
  const [colonialSide, setColonialSide] = useState<string>("");

  const [message, setMessage] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const navigate = useNavigate();

  async function loadUser() {
    const response = await axios.post("http://127.0.0.1:5000/settings/");
    setUser(response.data);
    setColonialFloor(user.colonial_floor);
    setColonialSide(user.colonial_side);
  }

  async function updateUser() {
    // TODO: Insert the correct URL
    try {
      await axios.post("", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(user),
      });
    } catch (error) {
      console.log("Could not update user ", error);
    }
  }

  async function handleDelete() {
    try {
      const response = await axios.post("http://127.0.0.1:5000/settings/api/delete_account/");
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

  React.useEffect(() => {
    loadUser();
  }, []);

  const handleFloorChange = (event: SelectChangeEvent) => {
    const newFloor = event.target.value;

    setColonialFloor(newFloor);
    setUser({
      id: user.id,
      fname: user.fname,
      lname: user.lname,
      profile_picture: user.profile_picture,
      colonial_floor: newFloor,
      colonial_side: user.colonial_side,
    });

    updateUser();
  };

  const handleSideChange = (event: SelectChangeEvent) => {
    const newSide = event.target.value;

    setColonialSide(newSide);
    setUser({
      id: user.id,
      fname: user.fname,
      lname: user.lname,
      profile_picture: user.profile_picture,
      colonial_floor: user.colonial_floor,
      colonial_side: newSide,
    });

    updateUser();
  };

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

  return (
    <>
      <h1>Settings Page</h1>
      <p>
        Name: {user.fname} {user.lname}
      </p>
      <p>Colonial Floor: {user.colonial_floor}</p>
      <p>Colonial Side: {user.colonial_side}</p>

      <h2>Change Personal Details</h2>

      <FormControl variant="filled" sx={{ m: 1, minWidth: 200 }} size="small">
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

      <FormControl variant="filled" sx={{ m: 1, minWidth: 200 }} size="small">
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
          <MenuItem disabled value="">
            {user.colonial_side}
          </MenuItem>
          <MenuItem value={"Men's"}>Men's</MenuItem>
          <MenuItem value={"Women's"}>Women's</MenuItem>
        </Select>
        <FormHelperText>Colonial Side</FormHelperText>
      </FormControl>

      <br />
      <br />

      <Button
        onClick={handleOpenModal}
        variant="contained"
        color="error"
        fullWidth
      >
        DELETE ACCOUNT
      </Button>
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
    </>
  );
}

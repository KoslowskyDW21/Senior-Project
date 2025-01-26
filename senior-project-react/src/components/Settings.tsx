import axios, { AxiosError } from "axios";
import { useState } from "react";
import React from "react";
import { Button, InputLabel, Select, MenuItem, FormControl, SelectChangeEvent, Box, FormHelperText } from "@mui/material";
import { useNavigate } from "react-router-dom";

interface DeleteResponse {
  message: string;
}

namespace SettingsPage {
  export interface User {
    id: number;
    fname: string;
    lname: string;
    profile_picture: string;
    colonial_floor: string;
    colonial_side: string;
  }
}

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
  const navigate = useNavigate();

  async function loadUser() {
    const response = await axios.post(
      "http://127.0.0.1:5000/settings/",
      {},
      { withCredentials: true }
    );
    setUser(response.data);
    setColonialFloor(user.colonial_floor);
    setColonialSide(user.colonial_side);
  }

  async function updateUser() { // TODO: Insert the correct URL
    try {
      await axios.post("", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(user)
      });
    }
    catch (error) {
      console.log("Could not update user ", error);
    }
  }

  async function handleDelete() {
    try {
      const response = await axios.post(
        "http://127.0.0.1:5000/api/delete_account",
        {},
        { withCredentials: true }
      );

      const data: DeleteResponse = response.data;
      setMessage(data.message);
      if (data.message === "Account deleted successfully") {
        navigate("/");
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
  }

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
  }

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
          <MenuItem disabled value="">{user.colonial_floor}</MenuItem>
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
          <MenuItem disabled value="">{user.colonial_side}</MenuItem>
          <MenuItem value={"Men's"}>Men's</MenuItem>
          <MenuItem value={"Women's"}>Women's</MenuItem>
        </Select>
        <FormHelperText>Colonial Side</FormHelperText>
      </FormControl>
      
      <br />
      <br />    

      <Button
        onClick={handleDelete}
        variant="contained"
        color="error"
        fullWidth
      >
        DELETE ACCOUNT
      </Button>
    </>
  );
}

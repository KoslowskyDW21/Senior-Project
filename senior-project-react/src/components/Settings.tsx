import axios, { AxiosError } from "axios";
import { useState } from "react";
import React from "react";
import { Button } from "@mui/material";
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
    colonial_floor: null,
    colonial_side: null,
  });

  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  async function loadUser() {
    const response = await axios.post(
      "http://127.0.0.1:5000/settings/",
      {},
      { withCredentials: true }
    );
    setUser(response.data);
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

  return (
    <>
      <h1>Settings Page</h1>
      <p>
        Name: {user.fname} {user.lname}
      </p>
      <p>Colonial Floor: {user.colonial_floor}</p>
      <p>Colonial Side: {user.colonial_side}</p>

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

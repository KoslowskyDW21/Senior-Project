import axios, { AxiosError } from "axios";
import { useState } from "react";
import React from "react";
import { Button, IconButton, Modal, TextField, Typography, Box, FormControl, InputLabel, Select, MenuItem, SelectChangeEvent } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CloseIcon from "@mui/icons-material/Close";
import { useNavigate } from "react-router-dom";

export default function ReportPage() {
  const [admin, setAdmin] = useState<boolean>(false);
  const navigate = useNavigate();

  async function isAdmin() {
    await axios.get("http://127.0.0.1:5000/admin/")
      .then((response) => {
        setAdmin(response.data.is_admin);
      })
      .catch((error) => {
        console.error("Unable to check if user is admin", error)
      });
  }

  React.useEffect(() => {isAdmin();}, []);

  if(admin) {
    return (
      <>
        <IconButton
          onClick={() => navigate(-1)}
          style={{ position: "absolute", top: 30, left: 30 }} 
        >
          <ArrowBackIcon sx={{ fontSize: 30, fontWeight: 'bold' }} />
        </IconButton>

        <h1>Reported Content</h1>

        <h2>Reported Groups</h2>
      </>
    );
  }
  else {
    return (
      <>
        <h1>You don't have access to this page.</h1>
        <Button
          onClick={() => navigate(`/recipes`)}
          variant="contained"
          color="primary"
        >
          Recipes
        </Button>
      </>
    );
  }
}
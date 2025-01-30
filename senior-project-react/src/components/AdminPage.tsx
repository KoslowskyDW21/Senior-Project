import axios, { AxiosError } from "axios";
import { useState } from "react";
import React from "react";
import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

async function isAdmin() {
  await axios.get("") // TODO: Add the URL
    .then((response) => {
      return response.data.isAdmin;
    })
    .catch((error) => {
      console.log("Could not retrieve data: ", (error));
    })
}

export default function AdminPage() {
  const isAdmin = false;
  const navigate = useNavigate();

  if(isAdmin) {
    return <h1>Admin Page</h1>;
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
    )
    navigate(`/recipes`);
  }
}
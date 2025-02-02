import axios, { AxiosError } from "axios";
import { useState } from "react";
import React from "react";
import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

async function isAdmin(admin: boolean) {
  await axios.get("http://127.0.0.1:5000/admin/") // TODO: Add the URL
    .then((response) => {
      admin = response.data.is_admin;
    })
    .catch((error) => {
      console.log("Could not retrieve data: ", (error));
    })

  admin = false;
}

export default function AdminPage() {
  let admin: boolean = false;
  React.useEffect(() => {isAdmin(admin);}, [])

  const navigate = useNavigate();

  if(admin) {
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
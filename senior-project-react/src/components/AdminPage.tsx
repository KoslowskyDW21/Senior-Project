import axios, { AxiosError } from "axios";
import { useState } from "react";
import React from "react";
import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

interface User {
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

export default function AdminPage() {
  const [admin, setAdmin] = useState<boolean>(false);
  const [users, setUsers] = useState<User[]>([]);
  const navigate = useNavigate();

  async function isAdmin() {
    await axios.get("http://127.0.0.1:5000/admin/")
      .then((response) => {
        setAdmin(response.data.is_admin);
      })
      .catch((error) => {
        console.error("Unable to check if user is admin", error)
      })
  }

  async function loadUsers() {
    await axios.get("http://127.0.0.1:5000/admin/users/")
      .then((response) => {
        setUsers(response.data);
      })
      .catch((error) => {
        console.error("Could not load users", error);
      })
  }
  
  React.useEffect(() => {isAdmin(); loadUsers();}, []);

  if(admin) {
    return (
      <>
        <h1>Admin Page</h1>
        <br />
        <h2>Users</h2>
        <table>
          <thead>
            <tr>
              <td>Email</td>
              <td>Username</td>
              <td>Admin Status</td>
              <td>Reports</td>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.email_address}</td>
                <td>{user.username}</td>
                <td>{user.is_admin.toString()}</td>
                <td>{user.num_reports}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </>
    )
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
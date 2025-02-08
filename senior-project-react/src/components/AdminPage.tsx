import axios, { AxiosError } from "axios";
import { useState } from "react";
import React from "react";
import { Button, IconButton, TextField } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
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
  const [userAdmin, setUserAdmin] = useState<boolean[]>([]);
  const navigate = useNavigate();
  const [idInput, setIdInput] = useState('');

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

  async function updateUser(isAnAdmin: boolean, userId: number) {
    const data = {
      id: userId,
      isAdmin: isAnAdmin,
    };

    await axios.post("http://127.0.0.1:5000/admin/makeAdmin/", data, {
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        console.log("User successfully updated.");
        console.log(response.data);
      })
      .catch((error) => {
        console.error("Could not update user", error);
      });
  }

  const handleAdminChange = (user: User) => {
    console.log("handleAdminChange called");

    const id = user.id;
    for(const findUser of users) {
      if(findUser.id == id) {
        findUser.is_admin = false;
      }
    }

    user.is_admin ? updateUser(false, id) : updateUser(true, id);
  }

  const handleDeleteRecipe = async() =>{
    try {
      const response = await axios.post(`http://127.0.0.1:5000/admin/delete/${idInput}`);
      console.log('Response from backend:', response);
    } catch (error) {
      console.error('Error submitting ID');
    }

  }

  if(admin) {
    return (
      <>
        <IconButton
          onClick={() => navigate(-1)}
          style={{ position: "absolute", top: 30, left: 30 }} 
        >
          <ArrowBackIcon sx={{ fontSize: 30, fontWeight: 'bold' }} />
        </IconButton>

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
              <td>Make Admin</td>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.email_address}</td>
                <td>{user.username}</td>
                <td>{user.is_admin.toString()}</td>
                <td>{user.num_reports}</td>
                <td>
                  <Button
                    onClick={() => {
                      handleAdminChange(user);
                    }}
                    variant="contained"
                    color={user.is_admin ? "error" : "success"}
                  >
                    {user.is_admin ? "Remove Status" : "Make Admin"}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <br />
      <TextField
        label="Enter Recipe ID"
        variant="outlined"
        value={idInput}
        onChange={(e) => setIdInput(e.target.value)}
        style={{ marginBottom: '20px' }}
      />
      <Button variant="contained" color="primary" onClick={handleDeleteRecipe}>
        Delete Recipe
      </Button>
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
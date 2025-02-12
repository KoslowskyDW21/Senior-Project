import axios, { AxiosError } from "axios";
import { useState } from "react";
import React from "react";
import { Button, IconButton, Modal, TextField, Typography, Box } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Icon from "@mui/material/Icon";
import CloseIcon from "@mui/icons-material/Close";
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
  is_super_admin: boolean;
  num_recipes_completed: number;
  colonial_floor: string;
  colonial_side: string;
  date_create: Date;
  last_logged_in: Date;
  num_reports: number;
  is_banned: boolean;
}

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  bgcolor: "#ffffff",
  boxShadow: 24,
  paddingTop: 3,
  paddingLeft: 7,
  paddingRight: 7,
  paddingBottom: 3,
  textAlign: "center",
}

export default function AdminPage() {
  const [admin, setAdmin] = useState<boolean>(false);
  const [superAdmin, setSuperAdmin] = useState<boolean>(false);
  const [users, setUsers] = useState<User[]>([]);
  const navigate = useNavigate();
  const [idInput, setIdInput] = useState('');
  const [userToBan, setUserToBan] = useState<User | null>(null);
  const [open, setOpen] = useState(false);
  const handleOpenModal = () => setOpen(true);
  const handleCloseModal = () => setOpen(false);

  function CreateAdminButton({ user, handleAdminChange }) {
    if(superAdmin) {
      return (
        <Button
          onClick={() => {
            handleAdminChange(user);
          }}
          variant="contained"
          color={user.is_admin ? "error" : "success"}
        >
          {user.is_admin ? "Remove Status" : "Make Admin"}
        </Button>
      );
    }
    else if(!user.is_admin) {
      return (
        <Button
          onClick={() => {
            handleAdminChange(user);
          }}
          variant="contained"
          color="success"
        >
          Make Admin
        </Button>
      );
    }
    else {
      return <></>;
    }
  }

  async function isAdmin() {
    await axios.get("http://127.0.0.1:5000/admin/")
      .then((response) => {
        setAdmin(response.data.is_admin);
        setSuperAdmin(response.data.is_super_admin);
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

    const change = (user: User) => {
      if(user.id === id) {
        user.is_admin = !user.is_admin;
      }
      
      return user;
    }

    const newUsers = users.map((oldUser) => change(oldUser));
    setUsers(newUsers);

    console.log("User: " + user.fname + " " + user.lname);
    console.log("is_admin: " + user.is_admin);

    !user.is_admin ? updateUser(false, id) : updateUser(true, id);
  }

  async function banUser(userId: number) {
    const data = {
      id: userId,
      ban: true,
    };

    await axios.post("http://127.0.0.1:5000/admin/ban/", data, {
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        console.log("User successfully banned.");
        console.log(response.data);
      })
      .catch((error) => {
        console.error("Could not ban user", error);
      });
  }

  const handleBan = () => {
    console.log("handleBan called");

    const id = userToBan!.id;

    const change = (user: User) => {
      if(user.id === id) {
        user.is_banned = !user.is_banned;
      }

      return user
    }

    const newUsers = users.map((oldUser) => change(oldUser));
    setUsers(newUsers);

    banUser(id);

    setUserToBan(null);
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
        <link rel="stylesheet" href="/src/AdminPage.css" />
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
              <td></td>
              <td></td>
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
                  {CreateAdminButton({ user, handleAdminChange })}
                </td>
                <td>
                  {!user.is_banned ?
                  <Button
                    variant="contained"
                    color="error"
                    onClick={() => {
                      handleOpenModal();
                      setUserToBan(user);
                    }}
                  >
                    Ban User
                  </Button>
                  :
                  <Button
                    variant="contained"
                    color="success"
                    onClick={() => {
                      // TODO: complete this method
                    }}
                  >
                    Unban User
                  </Button>
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        <Modal
          open={open}
          onClose={handleCloseModal}
          aria-labelledby="modal-title"
          aria-describedby="modal-description"
        >
          <Box sx={modalStyle}>
            <IconButton
              onClick={handleCloseModal}
              style={{ position: "absolute", top: 5, right: 5 }}
            >
              <CloseIcon sx={{ fontSize: 30, fontWeight: "bold" }} />
            </IconButton>

            <Typography id="modal-title" variant="h4" component="h2">
              Ban User
            </Typography>
            <Typography id="modal-description" variant="body1" component="p">
              {"Banning " + (userToBan !== null ? userToBan.username : "null")}
            </Typography>
            <Button
              variant="contained"
              color="error"
              onClick={() => {
                handleBan();
                handleCloseModal();
              }}
            >
              Confirm Ban
            </Button>
          </Box>
        </Modal>

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
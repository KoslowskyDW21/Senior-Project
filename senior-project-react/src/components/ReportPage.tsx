import axios, { AxiosError } from "axios";
import { useState } from "react";
import React from "react";
import { Button, IconButton, Modal, TextField, Typography, Box, FormControl, InputLabel, Select, MenuItem, SelectChangeEvent } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CloseIcon from "@mui/icons-material/Close";
import { useNavigate } from "react-router-dom";

interface UserGroup {
  id: number;
  name: string;
  description: string;
  is_public: boolean;
  num_reports: number;
  image?: string;
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

export default function ReportPage() {
  const [admin, setAdmin] = useState<boolean>(false);
  const [groups, setGroups] = useState<UserGroup[]>([]);
  const [group, setGroup] = useState<UserGroup | null>(null);
  const [openGroup, setOpenGroup] = useState(false);
  const handleOpenGroupModal = () => setOpenGroup(true);
  const handleCloseGroupModal = () => setOpenGroup(false);
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

  async function loadGroups() {
    await axios.get("http://127.0.0.1:5000/groups/reported/")
    .then((response) => {
      if(response.status === 200) {
        setGroups(response.data);
      }
    })
    .catch((error) => {
      console.error("Could not fetch reported groups ", error);
    });
  }

  React.useEffect(() => {isAdmin(); loadGroups();}, []);

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

        <table>
          <thead>
            <tr>
              <td>ID</td>
              <td>Name</td>
              <td>num_reports</td>
              <td></td>
            </tr>
          </thead>
          <tbody>
            {groups.map((group) => (
              <tr key={group.id}>
                <td>{group.id}</td>
                <td>{group.name}</td>
                <td>{group.num_reports}</td>
                <td>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => {
                      setGroup(group);
                      handleOpenGroupModal();
                    }}
                  >
                    View Reports
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <Modal
          open={openGroup}
          onClose={handleCloseGroupModal}
          aria-labelledby="modal-title"
        >
          <Box sx={modalStyle}>
            <IconButton
              onClick={handleCloseGroupModal}
              style={{ position: "absolute", top: 5, right: 5 }}
            >
              <CloseIcon sx={{ fontSize: 30, fontWeight: "bold" }} />
            </IconButton>

            <Typography id="modal-title" variant="h4" component="h2">
              {group !== null ? group.name : ""}
            </Typography>
          </Box>
        </Modal>
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
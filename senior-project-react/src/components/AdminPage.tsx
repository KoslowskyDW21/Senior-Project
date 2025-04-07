import axios, { AxiosError } from "axios";
import { useState, useEffect } from "react";
import { useThemeContext } from "./ThemeContext";
import "../AdminPage.css";
import React from "react";
import {
  Button,
  IconButton,
  Modal,
  TextField,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Icon from "@mui/material/Icon";
import CloseIcon from "@mui/icons-material/Close";
import { useNavigate } from "react-router-dom";
import config from "../config.js";
import Header from "./Header.js";

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

interface Report {
  reported_user: number;
  reported_by: number;
  reason: string;
}

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  bgcolor: "background.paper",
  boxShadow: 24,
  paddingTop: 3,
  paddingLeft: 7,
  paddingRight: 7,
  paddingBottom: 3,
  textAlign: "center",
};

const banTimes = [1, 7, 14, 21, 30, 60, 730];

export default function AdminPage() {
  const [admin, setAdmin] = useState<boolean>(false);
  const [superAdmin, setSuperAdmin] = useState<boolean>(false);
  const [users, setUsers] = useState<User[]>([]);
  const navigate = useNavigate();
  const [idInput, setIdInput] = useState("");
  const [userToBan, setUserToBan] = useState<User | null>(null);
  const [indexOfLength, setIndexOfLength] = useState<number>(-1);
  const [userReport, setUserReport] = useState<User | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [open, setOpen] = useState(false);
  const handleOpenModal = () => setOpen(true);
  const handleCloseModal = () => setOpen(false);
  const [openReports, setOpenReports] = useState<boolean>(false);
  const handleOpenReportModal = () => setOpenReports(true);
  const handleCloseReportModal = () => setOpenReports(false);
  const { mode } = useThemeContext();

  function CreateAdminButton({ user, handleAdminChange }: any) {
    if (superAdmin) {
      if (user.is_super_admin) {
        return <></>;
      } else {
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
    } else if (!user.is_admin) {
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
    } else {
      return <></>;
    }
  }

  async function isAdmin() {
    await axios
      .get(`${config.serverUrl}/admin/`)
      .then((response) => {
        setAdmin(response.data.is_admin);
        setSuperAdmin(response.data.is_super_admin);
      })
      .catch((error) => {
        console.error("Unable to check if user is admin", error);
      });
  }

  async function loadUsers() {
    await axios
      .get(`${config.serverUrl}/admin/users/`)
      .then((response) => {
        setUsers(response.data);
      })
      .catch((error) => {
        console.error("Could not load users", error);
      });
  }

  React.useEffect(() => {
    isAdmin();
    loadUsers();
    console.log(mode);
  }, []);

  useEffect(() => {
    const applyTheme = (theme: "light" | "dark") => {
      if (theme === "dark") {
        document.body.classList.add("dark");
      } else {
        document.body.classList.remove("dark");
      }
    };

    if (mode === "auto") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

      // Initial setting based on system
      applyTheme(mediaQuery.matches ? "dark" : "light");

      // Listen for changes to system preference
      const handleChange = (e: MediaQueryListEvent) => {
        applyTheme(e.matches ? "dark" : "light");
      };

      mediaQuery.addEventListener("change", handleChange);

      // Cleanup on unmount
      return () => {
        mediaQuery.removeEventListener("change", handleChange);
      };
    } else {
      // Manually set dark/light if not in auto
      applyTheme(mode);
    }
  }, [mode]);

  async function updateUser(isAnAdmin: boolean, userId: number) {
    const data = {
      id: userId,
      isAdmin: isAnAdmin,
    };

    await axios
      .post(`${config.serverUrl}/admin/makeAdmin/`, data, {
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
      if (user.id === id) {
        user.is_admin = !user.is_admin;
      }

      return user;
    };

    const newUsers = users.map((oldUser) => change(oldUser));
    setUsers(newUsers);

    console.log("User: " + user.fname + " " + user.lname);
    console.log("is_admin: " + user.is_admin);

    !user.is_admin ? updateUser(false, id) : updateUser(true, id);
  };

  async function banUser(userId: number, banUser: boolean, days: number) {
    const data = {
      id: userId,
      ban: banUser,
      days: days,
    };

    await axios
      .post(`${config.serverUrl}/admin/ban/`, data, {
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

  const changeBan = (user: User, id: number) => {
    if (user.id === id) {
      user.is_banned = !user.is_banned;
    }

    return user;
  };

  const handleBan = () => {
    console.log("handleBan called");

    const id = userToBan!.id;

    const newUsers = users.map((oldUser) => changeBan(oldUser, id));
    setUsers(newUsers);

    banUser(id, true, banTimes[indexOfLength !== -1 ? indexOfLength : 6]);

    setUserToBan(null);
  };

  const handleUnban = (id: number) => {
    const newUsers = users.map((oldUser) => changeBan(oldUser, id));
    setUsers(newUsers);

    banUser(id, false, -1);
  };

  const handleDeleteRecipe = async () => {
    try {
      const response = await axios.post(
        `${config.serverUrl}}/admin/delete/${idInput}`
      );
      console.log("Response from backend:", response);
    } catch (error) {
      console.error("Error submitting ID");
    }
  };

  const handleLengthSelection = (event: SelectChangeEvent) => {
    const length: number = +event.target.value;
    setIndexOfLength(length);
  };

  async function loadReports(id: number) {
    await axios
      .get(`${config.serverUrl}/admin/reports/${id}`)
      .then((response) => {
        setReports(response.data);
      })
      .catch((error) => {
        console.error("Could not fetch reports", error);
      });
  }

  async function deleteReports() {
    await axios
      .delete(
        `${config.serverUrl}/admin/reports/${userReport!.id}/delete_reports`
      )
      .then((response) => {
        console.log(response.data);
      })
      .catch((error) => {
        console.error("Could not delete reports", error);
      });
  }

  async function setReportsZero() {
    await axios
      .post(
        `${config.serverUrl}/admin/reports/${userReport!.id}/set_reports_zero`
      )
      .then((response) => {
        console.log(response.data);
      })
      .catch((error) => {
        console.error("Could not set reports to zero", error);
      });
  }

  async function handleRemoveReports() {
    deleteReports();
    setReportsZero();

    location.reload();
  }

  function getUserById(id: number) {
    const user = users.find((user) => user.id === id);
    return user?.username;
  }

  if (admin) {
    return (
      <>
        <Header title="Admin" />

        <IconButton
          onClick={() => navigate("/recipes/")}
          style={{
            position: "fixed",
            top: "clamp(70px, 10vw, 120px)",
            left: "clamp(0px, 1vw, 100px)",
            zIndex: 1000,
          }}
        >
          <ArrowBackIcon sx={{ fontSize: 30, fontWeight: "bold" }} />
        </IconButton>

        <Box mt={6} />

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
                  {user.is_banned ? (
                    <p style={{ color: "#ff0000", fontWeight: "bold" }}>
                      BANNED
                    </p>
                  ) : (
                    ""
                  )}
                </td>
                <td>{CreateAdminButton({ user, handleAdminChange })}</td>
                <td>
                  {!user.is_super_admin ? (
                    !user.is_banned ? (
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
                    ) : (
                      <Button
                        variant="contained"
                        color="success"
                        onClick={() => {
                          handleUnban(user.id);
                        }}
                      >
                        Unban User
                      </Button>
                    )
                  ) : (
                    <></>
                  )}
                </td>
                <td>
                  {user.num_reports > 0 && (
                    <Button
                      variant="contained"
                      color="info"
                      onClick={() => {
                        setUserReport(user);
                        loadReports(user.id);
                        handleOpenReportModal();
                      }}
                    >
                      View Reports
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <Modal
          open={openReports}
          onClose={handleCloseReportModal}
          aria-labelledby="modal-title"
        >
          <Box sx={modalStyle}>
            <IconButton
              onClick={handleCloseReportModal}
              style={{ position: "absolute", top: 5, right: 5 }}
            >
              <CloseIcon sx={{ fontSize: 30, fontWeight: "bold" }} />
            </IconButton>

            <Typography id="modal-title" variant="h4" component="h2">
              {`Reports pertaining to ${userReport?.username}`}
            </Typography>

            <table>
              <thead>
                <tr>
                  <td>Reported by</td>
                  <td>Reason</td>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => (
                  <tr key={report.reported_by}>
                    <td>{getUserById(report.reported_by)}</td>
                    <td>{report.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* <Button
              variant="contained"
              color="error"
              onClick={() => {
                handleRemoveReport();
                handleCloseReportModal();
              }}
            >
              Remove Review
            </Button> */}
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                handleRemoveReports();
                handleCloseReportModal();
              }}
            >
              Dismiss Report(s)
            </Button>
          </Box>
        </Modal>

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

            <FormControl
              variant="filled"
              sx={{ m: 1, width: 250 }}
              size="small"
            >
              <InputLabel id="length-label">Length</InputLabel>
              <Select labelId="length-label" onChange={handleLengthSelection}>
                <MenuItem value={0}>1 Day</MenuItem>
                <MenuItem value={1}>1 Week</MenuItem>
                <MenuItem value={2}>2 Weeks</MenuItem>
                <MenuItem value={3}>3 Weeks</MenuItem>
                <MenuItem value={4}>1 Month</MenuItem>
                <MenuItem value={5}>2 Months</MenuItem>
                <MenuItem value={6}>Indefinite</MenuItem>
              </Select>
            </FormControl>

            <br />

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

        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            navigate("/reported_content");
          }}
        >
          View Reported Content
        </Button>

        <br />
        <br />
        <TextField
          label="Enter Recipe ID"
          variant="outlined"
          value={idInput}
          onChange={(e) => setIdInput(e.target.value)}
          style={{ marginBottom: "20px" }}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleDeleteRecipe}
        >
          Delete Recipe
        </Button>
      </>
    );
  } else {
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

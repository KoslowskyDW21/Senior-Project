import axios, { AxiosError } from "axios";
import { useState } from "react";
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
import CloseIcon from "@mui/icons-material/Close";
import { useNavigate } from "react-router-dom";
import config from "../config.js";

interface UserGroup {
  id: number;
  name: string;
  description: string;
  is_public: boolean;
  num_reports: number;
  image?: string;
}

interface GroupReport {
  user_id: number;
  group_id: number;
  reason: string;
}

interface Review {
  id: number;
  num_reports: number;
  username: string;
}

interface ReviewReport {
  review_id: number;
  user_id: number;
  reason: string;
}

interface Message {
  id: number;
  group_id: number;
  user_id: number;
  num_reports: number;
  text: string;
}

interface MessageReport {
  user_id: number;
  message_id: number;
  reason: string;
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
};

export default function ReportPage() {
  const [admin, setAdmin] = useState<boolean>(false);
  const [groups, setGroups] = useState<UserGroup[]>([]);
  const [group, setGroup] = useState<UserGroup | null>(null);
  const [groupReports, setGroupReports] = useState<GroupReport[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [review, setReview] = useState<Review | null>(null);
  const [reviewReports, setReviewReports] = useState<ReviewReport[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState<Message | null>(null);
  const [messageReports, setMessageReports] = useState<MessageReport[]>([]);
  const [openGroup, setOpenGroup] = useState(false);
  const handleOpenGroupModal = () => setOpenGroup(true);
  const handleCloseGroupModal = () => setOpenGroup(false);
  const [openReview, setOpenReview] = useState(false);
  const handleOpenReviewModal = () => setOpenReview(true);
  const handleCloseReviewModal = () => setOpenReview(false);
  const [openMessage, setOpenMessage] = useState(false);
  const handleOpenMessageModal = () => setOpenMessage(true);
  const handleCloseMessageModal = () => setOpenMessage(false);
  const navigate = useNavigate();

  async function isAdmin() {
    await axios
      .get(`${config.serverUrl}/admin/`)
      .then((response) => {
        setAdmin(response.data.is_admin);
      })
      .catch((error) => {
        console.error("Unable to check if user is admin", error);
      });
  }

  async function loadGroups() {
    await axios
      .get(`${config.serverUrl}/groups/reported/`)
      .then((response) => {
        if (response.status === 200) {
          setGroups(response.data);
        }
      })
      .catch((error) => {
        console.error("Could not fetch reported groups ", error);
      });
  }

  async function loadReviews() {
    await axios
      .get(`${config.serverUrl}/recipes/reported_reviews`)
      .then((response) => {
        setReviews(response.data);
      })
      .catch((error) => {
        console.error("Could not fetch reported reviews ", error);
      });
  }

  async function loadMessages() {
    await axios
      .get(`${config.serverUrl}/groups/reported_messages`)
      .then((response) => {
        setMessages(response.data);
      })
      .catch((error) => {
        console.error("Could not fetch reported messages", error);
      });
  }

  async function loadGroupReports(id: number) {
    await axios
      .get(`${config.serverUrl}/groups/reports/${id}/`)
      .then((response) => {
        setGroupReports(response.data);
      })
      .catch((error) => {
        console.error("Could not fetch reports ", error);
      });
  }

  async function loadReviewReports(id: number) {
    await axios
      .get(`${config.serverUrl}/recipes/reports/${id}`)
      .then((response) => {
        setReviewReports(response.data);
      })
      .catch((error) => {
        console.error("Could not fetch reports ", error);
      });
  }

  async function loadMessageReports(id: number) {
    await axios
      .get(`${config.serverUrl}/groups/message_reports/${id}`)
      .then((response) => {
        setMessageReports(response.data);
      })
      .catch((error) => {
        console.error("Could not fetch reports", error);
      });
  }

  async function deleteGroupReports() {
    await axios
      .delete(`${config.serverUrl}/groups/${group!.id}/delete_reports`)
      .then((response) => {
        console.log(response.data);
      })
      .catch((error) => {
        console.error("Could not delete reports ", error);
      });
  }

  async function deleteGroup() {
    await axios
      .delete(`${config.serverUrl}/groups/${group!.id}/delete`)
      .then((response) => {
        console.log(response.data);
      })
      .catch((error) => {
        console.error("Could not delete group ", error);
      });
  }

  function handleRemoveGroup() {
    deleteGroupReports();
    deleteGroup();
  }

  async function deleteReviewReports() {
    await axios
      .delete(`${config.serverUrl}/recipes/${review!.id}/delete_reports`)
      .then((response) => {
        console.log(response.data);
      })
      .catch((error) => {
        console.error("Could not delete reports ", error);
      });
  }

  async function deleteReview() {
    await axios
      .delete(`${config.serverUrl}/recipes/${review!.id}/delete`)
      .then((response) => {
        console.log(response.data);
      })
      .catch((error) => {
        console.error("Could not delete review ", error);
      });
  }

  function handleRemoveReview() {
    deleteReviewReports();
    deleteReview();
  }

  async function deleteMessageReports() {
    await axios
      .delete(`${config.serverUrl}/groups/${message!.id}/delete_message_reports`)
      .then((response) => {
        console.log(response.data);
      })
      .catch((error) => {
        console.error("Could not delete reports", error);
      });
  }

  async function deleteMessage() {
    await axios
      .delete(`${config.serverUrl}/groups/${message!.id}/delete_message`)
      .then((response) => {
        console.log(response.data);
      })
      .catch((error) => {
        console.error("Could not delete message", error);
      });
  }

  function handleRemoveMessage(){
    deleteMessageReports();
    deleteMessage();
  }

  React.useEffect(() => {
    isAdmin();
    loadGroups();
    loadReviews();
    loadMessages();
  }, []);

  if (admin) {
    return (
      <>
        <IconButton
          onClick={() => navigate(-1)}
          style={{ position: "absolute", top: 30, left: 30 }}
        >
          <ArrowBackIcon sx={{ fontSize: 30, fontWeight: "bold" }} />
        </IconButton>

        <h1>Reported Content</h1>

        <h2>Reported Groups</h2>

        {groups.length > 0 ? (
          <table>
            <thead>
              <tr>
                <td>ID</td>
                <td>Name</td>
                <td>Reports</td>
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
                        loadGroupReports(group.id);
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
        ) : (
          <p>No Groups Reported</p>
        )}

        <h2>Reported Reviews</h2>

        {reviews.length > 0 ? (
          <table>
            <thead>
              <tr>
                <td>ID</td>
                <td>Reports</td>
                <td></td>
              </tr>
            </thead>
            <tbody>
              {reviews.map((review) => (
                <tr key={review.id}>
                  <td>{review.id}</td>
                  <td>{review.num_reports}</td>
                  <td>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => {
                        setReview(review);
                        loadReviewReports(review.id);
                        handleOpenReviewModal();
                      }}
                    >
                      View Reports
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No Reviews Reported</p>
        )}

        <h2>Reported Messages</h2>

        {messages.length > 0 ? (
          <table>
            <thead>
              <td>ID</td>
              <td>Reports</td>
              <td></td>
            </thead>
            <tbody>
              {messages.map((message) => (
                <tr key={message.id}>
                  <td>{message.id}</td>
                  <td>{message.num_reports}</td>
                  <td>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => {
                        setMessage(message);
                        loadMessageReports(message.id);
                        handleOpenMessageModal();
                      }}
                    >
                      View Reports
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No Messages Reported</p>
        )}

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

            <table>
              <thead>
                <tr>
                  <td>User ID</td>
                  <td>Reason</td>
                </tr>
              </thead>
              <tbody>
                {groupReports.map((report) => (
                  <tr key={report.user_id}>
                    <td>{report.user_id}</td>
                    <td>{report.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <Button
              variant="contained"
              color="error"
              onClick={() => {
                handleRemoveGroup();
                handleCloseGroupModal();
              }}
            >
              Remove Group
            </Button>
          </Box>
        </Modal>

        <Modal
          open={openReview}
          onClose={handleCloseReviewModal}
          aria-labelledby="modal-title"
        >
          <Box sx={modalStyle}>
            <IconButton
              onClick={handleCloseReviewModal}
              style={{ position: "absolute", top: 5, right: 5 }}
            >
              <CloseIcon sx={{ fontSize: 30, fontWeight: "bold" }} />
            </IconButton>

            <Typography id="modal-title" variant="h4" component="h2">
              {`Review submitted by ${
                review !== null ? review.username : "null"
              }`}
            </Typography>

            <table>
              <thead>
                <tr>
                  <td>User ID</td>
                  <td>Reason</td>
                </tr>
              </thead>
              <tbody>
                {reviewReports.map((report) => (
                  <tr key={report.user_id}>
                    <td>{report.user_id}</td>
                    <td>{report.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <Button
              variant="contained"
              color="error"
              onClick={() => {
                handleRemoveReview();
                handleCloseReviewModal();
              }}
            >
              Remove Review
            </Button>
          </Box>
        </Modal>

        <Modal
          open={openMessage}
          onClose={handleCloseMessageModal}
          aria-labelledby="modal-title"
        >
          <Box sx={modalStyle}>
            <IconButton
              onClick={handleCloseMessageModal}
              style={{ position: "absolute", top: 5, right: 5 }}
            >
              <CloseIcon sx={{ fontSize: 30, fontWeight: "bold" }} />
            </IconButton>

            <Typography id="modal-title" variant="h4" component="h2">
              {`Message written by ${
                message !== null ? message.user_id : "null"
              }`}
            </Typography>

            <table>
              <thead>
                <tr>
                  <td>User ID</td>
                  <td>Reason</td>
                </tr>
              </thead>
              <tbody>
                {messageReports.map((message) => (
                  <tr key={message.user_id}>
                    <td>{message.user_id}</td>
                    <td>{message.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <Button
              variant="contained"
              color="error"
              onClick={() => {
                handleRemoveMessage();
                handleCloseMessageModal();
              }}
            >
              Remove Message
            </Button>
          </Box>
        </Modal>
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

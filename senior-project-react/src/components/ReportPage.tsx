import axios from "axios";
import { useEffect, useState } from "react";
import {
  Button,
  IconButton,
  Modal,
  Typography,
  Box,
  Card,
  CardContent,
  CardMedia,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useThemeContext } from "./ThemeContext";
import "../AdminPage.css";
import CloseIcon from "@mui/icons-material/Close";
import { useNavigate } from "react-router-dom";
import config from "../config.js";

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
  text: string;
  image: string;
  rating: string;
  difficulty: string;
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
  user_id: number;
  username: string;
  num_reports: number;
  text: string;
}

interface MessageReport {
  user_id: number;
  message_id: number;
  reason: string;
}

interface Challenge {
  id: number;
  name: string;
  creator: string;
  difficulty: "1" | "2" | "3" | "4" | "5";
  theme: string;
  location: string;
  start_time: string;
  end_time: string;
  num_reports: number;
  image?: string;
}

interface ChallengeReport {
  user_id: number;
  challenge_id: number;
  reason: string;
}

// React component that lets the user see which groups have been reported
function Group({ group }: { group: UserGroup }) {
  return (
    <Card
      sx={{
        marginBottom: 2,
        border: "1px solid #ccc",
        borderRadius: 2,
        boxShadow: 2,
      }}
    >
      <CardContent>
        <Typography variant="h6">{group.name}</Typography>
        <Typography variant="body2" color="text.secondary">
          {group.description}
        </Typography>

        <a href={`/groups/${group.id}`}>{`Go to ${group.name}`}</a>

        {group.image != "NULL" && (
          <CardMedia
            component="img"
            height="200"
            image={`${config.serverUrl}/${group.image}`}
            alt="Group Image"
            sx={{
              objectFit: "contain",
              maxWidth: "100%",
              marginBottom: 2,
            }}
          />
        )}
      </CardContent>
    </Card>
  );
}

// React component that lets the user see which reviews have been reported
function Review({ review }: { review: Review }) {
  return (
    <Card
      sx={{
        marginBottom: 2,
        border: "1px solid #ccc",
        borderRadius: 2,
        boxShadow: 2,
      }}
    >
      <CardContent>
        <Typography variant="h6">{review.username}</Typography>
        <Typography variant="body2" color="text.secondary">
          {review.text}
        </Typography>
        {review.difficulty !== "0" && (
          <Typography variant="body2" color="text.secondary">
            Difficulty: {review.difficulty}
          </Typography>
        )}
        {review.rating !== "0" && (
          <Typography variant="body2" color="text.secondary">
            Rating: {review.rating}
          </Typography>
        )}
        {review.image != "NULL" && (
          <CardMedia
            component="img"
            height="200"
            image={`${config.serverUrl}/${review.image}`}
            alt="Review Image"
            sx={{
              objectFit: "contain",
              maxWidth: "100%",
              marginBottom: 2,
            }}
          />
        )}
      </CardContent>
    </Card>
  );
}

// React component that lets the user see which messages have been reported
function Message({ message }: { message: Message }) {
  return (
    <Card
      sx={{
        marginBottom: 2,
        border: "1px solid #ccc",
        borderRadius: 2,
        boxShadow: 2,
      }}
    >
      <CardContent>
        <Typography variant="h6">{message.username}</Typography>
        <Typography variant="body2" color="text.secondary">
          {message.text}
        </Typography>
      </CardContent>
    </Card>
  );
}

// React component that lets the user see which competitions (challenges) have been reported
function Challenge({ challenge }: { challenge: Challenge }) {
  return (
    <Card
      sx={{
        marginBottom: 2,
        border: "1px solid #ccc",
        borderRadius: 2,
        boxShadow: 2,
      }}
    >
      {challenge.image && (
        <CardMedia
          component="img"
          height="200"
          image={`${config.serverUrl}/${challenge.image}`}
          alt={challenge.name}
          sx={{ borderRadius: 2 }}
        />
      )}
      <CardContent>
        <Typography variant="h4" component="div" gutterBottom>
          {challenge.name}
        </Typography>
        <Box mb={2}>
          <Typography variant="body1">
            <strong>Difficulty:</strong> {challenge.difficulty}/5
          </Typography>
          <Typography variant="body1">
            <strong>Theme:</strong> {challenge.theme}
          </Typography>
          <Typography variant="body1">
            <strong>Location:</strong> {challenge.location}
          </Typography>
          <Typography variant="body1">
            <strong>Start Time:</strong> {challenge.start_time.toLocaleString()}
          </Typography>
          <Typography variant="body1">
            <strong>End Time:</strong> {challenge.end_time.toLocaleString()}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
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
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [challengeReports, setChallengeReports] = useState<ChallengeReport[]>(
    []
  );
  const [users, setUsers] = useState<User[]>([]);
  const [openGroup, setOpenGroup] = useState<boolean>(false);
  const handleOpenGroupModal = () => setOpenGroup(true);
  const handleCloseGroupModal = () => setOpenGroup(false);
  const [openReview, setOpenReview] = useState<boolean>(false);
  const handleOpenReviewModal = () => setOpenReview(true);
  const handleCloseReviewModal = () => setOpenReview(false);
  const [openMessage, setOpenMessage] = useState<boolean>(false);
  const handleOpenMessageModal = () => setOpenMessage(true);
  const handleCloseMessageModal = () => setOpenMessage(false);
  const [openChallenge, setOpenChallenge] = useState<boolean>(false);
  const handleOpenChallengeModal = () => setOpenChallenge(true);
  const handleCloseChallengeModal = () => setOpenChallenge(false);
  const navigate = useNavigate();
  const { mode } = useThemeContext();

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

  async function loadChallenges() {
    await axios
      .get(`${config.serverUrl}/challenges/reported_challenges`)
      .then((response) => {
        setChallenges(response.data);
      })
      .catch((error) => {
        console.error(
          "Could not fetch reported competitions (challenges)",
          error
        );
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

  async function loadChallengeReports(id: number) {
    await axios
      .get(`${config.serverUrl}/challenges/reports/${id}`)
      .then((response) => {
        setChallengeReports(response.data);
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

  async function setGroupReportsZero() {
    await axios
      .post(`${config.serverUrl}/groups/${group!.id}/set_group_reports_zero`)
      .then((response) => {
        console.log(response.data);
      })
      .catch((error) => {
        console.error("Could not set reports to zero", error);
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

    const newGroups = groups.filter((item) => item !== group);
    setGroups(newGroups);
  }

  function handleRemoveGroupReports() {
    deleteGroupReports();
    setGroupReportsZero();

    const newGroups = groups.filter((item) => item !== group);
    setGroups(newGroups);
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

  async function setReviewReportsZero() {
    await axios
      .post(`${config.serverUrl}/recipes/${review!.id}/set_reports_zero`)
      .then((response) => {
        console.log(response.data);
      })
      .catch((error) => {
        console.error("Could not set reports to zero", error);
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

    const newReviews = reviews.filter((item) => item !== review);
    setReviews(newReviews);
  }

  function handleRemoveReviewReports() {
    deleteReviewReports();
    setReviewReportsZero();

    const newReviews = reviews.filter((item) => item !== review);
    setReviews(newReviews);
  }

  async function deleteMessageReports() {
    await axios
      .delete(
        `${config.serverUrl}/groups/${message!.id}/delete_message_reports`
      )
      .then((response) => {
        console.log(response.data);
      })
      .catch((error) => {
        console.error("Could not delete reports", error);
      });
  }

  async function setMessageReportsZero() {
    await axios
      .post(
        `${config.serverUrl}/groups/${message!.id}/set_message_reports_zero`
      )
      .then((response) => {
        console.log(response.data);
      })
      .catch((error) => {
        console.error("Could not set reports to zero", error);
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

  function handleRemoveMessage() {
    deleteMessageReports();
    deleteMessage();

    const newMessages = messages.filter((item) => item !== message);
    setMessages(newMessages);
  }

  function handleRemoveMessageReports() {
    deleteMessageReports();
    setMessageReportsZero();

    const newMessages = messages.filter((item) => item !== message);
    setMessages(newMessages);
  }

  async function deleteChallengeReports() {
    await axios
      .delete(`${config.serverUrl}/challenges/${challenge!.id}/delete_reports`)
      .then((response) => {
        console.log(response.data);
      })
      .catch((error) => {
        console.error("Could not delete reports", error);
      });
  }

  async function setChallengeReportsZero() {
    await axios
      .post(`${config.serverUrl}/challenges/${challenge!.id}/set_reports_zero`)
      .then((response) => {
        console.log(response.data);
      })
      .catch((error) => {
        console.error("Could not set reports to zero", error);
      });
  }

  async function deleteChallenge() {
    await axios
      .delete(`${config.serverUrl}/challenges/${challenge!.id}/delete`)
      .then((response) => {
        console.log(response.data);
      })
      .catch((error) => {
        console.error("Could not delete competition (challenge)", error);
      });
  }

  async function handleRemoveChallenge() {
    deleteChallengeReports();
    deleteChallenge();

    const newChallenges = challenges.filter((item) => item !== challenge);
    setChallenges(newChallenges);
  }

  async function handleRemoveChallengeReports() {
    deleteChallengeReports();
    setChallengeReportsZero();

    const newChallenges = challenges.filter((item) => item !== challenge);
    setChallenges(newChallenges);
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

  const getUserById = (id: number) => {
    const user = users.find((user) => user.id === id);
    return user?.username;
  };

  // Checks to see if the current user is an admin and loads the reported groups, reviews, messages, and competitions (challenges)
  useEffect(() => {
    isAdmin();
    loadGroups();
    loadReviews();
    loadMessages();
    loadChallenges();
    loadUsers();
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

        {/* List each group that has been reported in a table */}
        {groups.length > 0 ? (
          <table>
            <thead>
              <tr>
                <td>Name</td>
                <td>Reports</td>
                <td></td>
              </tr>
            </thead>
            <tbody>
              {groups.map((group) => (
                <tr key={group.id}>
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

        {/* List each review that has been reported in a table */}
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

        {/* List each message that has been reported in a table */}
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

        <h2>Reported Competitions</h2>
        {/* List each competition (challenge) that has been reported in a table */}
        {challenges.length > 0 ? (
          <table>
            <thead>
              <td>Name</td>
              <td>Reports</td>
              <td></td>
            </thead>
            <tbody>
              {challenges.map((challenge) => (
                <tr key={challenge.id}>
                  <td>{challenge.name}</td>
                  <td>{challenge.num_reports}</td>
                  <td>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => {
                        setChallenge(challenge);
                        loadChallengeReports(challenge.id);
                        handleOpenChallengeModal();
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
          <p>No Competitions Reported</p>
        )}

        {/* Modal for seeing reports associated with specific group - gives the option
            to remove the group or dismiss the reports */}
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

            <Group group={group!} />

            <Typography id="modal-title" variant="h4" component="h2">
              {group !== null ? group.name : ""}
            </Typography>

            <table>
              <thead>
                <tr>
                  <td>Reported by</td>
                  <td>Reason</td>
                </tr>
              </thead>
              <tbody>
                {groupReports.map((report) => (
                  <tr key={report.user_id}>
                    <td>{getUserById(report.user_id)}</td>
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
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                handleRemoveGroupReports();
                handleCloseGroupModal();
              }}
            >
              Dismiss Report(s)
            </Button>
          </Box>
        </Modal>

        {/* Modal for seeing reports associated with specific review - gives the option
            to remove the review or dismiss the reports - also displays the review to 
            the user */}
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

            <Review review={review!} />

            <Typography id="modal-title" variant="h4" component="h2">
              {`Review submitted by ${
                review !== null ? review.username : "null"
              }`}
            </Typography>

            <table>
              <thead>
                <tr>
                  <td>Reported by</td>
                  <td>Reason</td>
                </tr>
              </thead>
              <tbody>
                {reviewReports.map((report) => (
                  <tr key={report.user_id}>
                    <td>{getUserById(report.user_id)}</td>
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
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                handleRemoveReviewReports();
                handleCloseReviewModal();
              }}
            >
              Dismiss Report(s)
            </Button>
          </Box>
        </Modal>

        {/* Modal for seeing reports associated with specific message - gives the option
            to remove the message or dismiss the reports - also displays the message to 
            the user */}
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

            <Message message={message!} />

            <Typography id="modal-title" variant="h4" component="h2">
              {`Message written by ${
                message !== null ? message.username : "null"
              }`}
            </Typography>

            <table>
              <thead>
                <tr>
                  <td>Reported by</td>
                  <td>Reason</td>
                </tr>
              </thead>
              <tbody>
                {messageReports.map((message) => (
                  <tr key={message.user_id}>
                    <td>{getUserById(message.user_id)}</td>
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
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                handleRemoveMessageReports();
                handleCloseMessageModal();
              }}
            >
              Dismiss Report(s)
            </Button>
          </Box>
        </Modal>

        {/* Modal for seeing reports associated with specific competition (challenge) - gives the option
            to remove the competition (challenge) or dismiss the reports - also displays the competition (challenge) to
            the user */}
        <Modal
          open={openChallenge}
          onClose={handleCloseChallengeModal}
          aria-labelledby="modal-title"
        >
          <Box sx={modalStyle}>
            <IconButton
              onClick={handleCloseMessageModal}
              style={{ position: "absolute", top: 5, right: 5 }}
            >
              <CloseIcon sx={{ fontSize: 30, fontWeight: "bold" }} />
            </IconButton>

            <Challenge challenge={challenge!} />

            <Typography id="modal-title" variant="h4" component="h2">
              {`Challenge created by ${
                challenge !== null ? challenge.creator : "null"
              }`}
            </Typography>

            <table>
              <thead>
                <tr>
                  <td>Reported by</td>
                  <td>Reason</td>
                </tr>
              </thead>
              <tbody>
                {challengeReports.map((report) => (
                  <tr key={report.challenge_id}>
                    <td>{getUserById(report.user_id)}</td>
                    <td>{report.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <Button
              variant="contained"
              color="error"
              onClick={() => {
                handleRemoveChallenge();
                handleCloseChallengeModal();
              }}
            >
              Remove Competition
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={() => {
                handleRemoveChallengeReports();
                handleCloseChallengeModal();
              }}
            >
              Dismiss Report(s)
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

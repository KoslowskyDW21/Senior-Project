import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Button,
  Typography,
  Grid2,
  TextField,
  Avatar,
  IconButton,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import config from "../config.js";

import Header from "./Header";
import Footer from "./Footer";

interface UserGroup {
  id: number;
  name: string;
  description: string;
  is_public: boolean;
  num_reports: number;
  image?: string;
}

const Group: React.FC<UserGroup> = ({ id, name, description, image }) => {
  const navigate = useNavigate();
  const handleGoToGroup = async () => {
    navigate(`/groups/${id}/`);
  };

  return (
    <div onClick={handleGoToGroup} style={{ cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center" }}>
      {/* Title with overflow handling */}
      <Typography
        variant="h6"
        sx={{
          width: "100%",                 // Make the title take up full width of the container
          whiteSpace: "nowrap",          // Prevent wrapping of the title
          overflow: "hidden",            // Hide overflowed text
          textOverflow: "ellipsis",      // Add "..." when the text is too long
          textAlign: "center",           // Center align the title text
          fontWeight: "bold",            // Optional: Make the title bold
        }}
      >
        {name}
      </Typography>

      {/* Description */}
      <Typography variant="body2" sx={{ textAlign: "center" }}>
        {description}
      </Typography>

      {/* Fixed size for image */}
      {image && (
        <Box
          sx={{
            width: "100%",        // Make the image container take up full width of its grid item
            height: 200,          // Fixed height
            overflow: "hidden",   // Prevent overflow if the image is larger than the container
            borderRadius: 2,      // Optional: rounded corners for the image
            boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.1)", // Optional: slight shadow for image
            marginTop: 1,         // Add a small margin between the title/description and the image
          }}
        >
          <img
            src={`${config.serverUrl}/${image}`}
            alt="group"
            style={{
              width: "100%",       // Make the image take full width of the container
              height: "100%",      // Make the image fill the container's height
              objectFit: "cover",  // Ensure the image covers the box without stretching
            }}
          />
        </Box>
      )}
    </div>
  );
};


const Groups: React.FC = () => {
  const [groups, setGroups] = useState<UserGroup[]>([]); // All public groups
  const [myGroups, setMyGroups] = useState<UserGroup[]>([]); // User's groups
  const [invitedGroups, setInvitedGroups] = useState<UserGroup[]>([]); // Groups user is invited to
  const [friends, setFriends] = useState<[]>([]); // For storing friends
  const [searchQuery, setSearchQuery] = useState<string>(""); 
  const [loading, setLoading] = useState<boolean>(false);
  const [noResultsFound, setNoResultsFound] = useState<boolean>(false);
  const [totalPagesAll, setTotalPagesAll] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState(1);

  const groupsPerPage = 8;
  const navigate = useNavigate();

  // Fetching all groups, my groups, and invited groups
  const fetchGroups = async (page: number, query: string) => {
    if (loading) return;

    setLoading(true);
    try {
      const response = await axios.get(`${config.serverUrl}/groups/`, {
        params: {
          search: query, // Pass the search query to the backend
          page: page,
          per_page: groupsPerPage,
        },
      });
      const data = response.data;

      console.log("Fetched groups:", data);  // Log the response data to verify the result

      // Append new groups to the existing groups list
      if (page === 1) {
        // For the first page, replace all groups (no append)
        setGroups(data.all_groups);
      } else {
        // For subsequent pages, append the new groups to the existing list
        setGroups((prevGroups) => [...prevGroups, ...data.all_groups]);
      }

      setMyGroups(data.my_groups); // User's groups
      setInvitedGroups(data.invited_groups); // Groups the user is invited to
      setTotalPagesAll(data.total_pages || 1); // Get total pages for pagination
      setNoResultsFound(data.all_groups.length === 0); // Check if no groups are found
    } catch (error) {
      console.error("Error fetching groups:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoToOtherProfile = (id: number) => {
    navigate(`/otherProfile/${id}/`);
  };

  // Fetch friends
  const fetchFriends = async () => {
    try {
      const response = await axios.post(`${config.serverUrl}/friends/get_friends/`, {}, { withCredentials: true });
      setFriends(response.data.friends); // Update the friends list state
    } catch (error) {
      console.log("Error fetching friends:", error);
    }
  };

  useEffect(() => {
    fetchGroups(1, ""); // Fetch groups when the component mounts
    fetchFriends(); // Fetch friends when the component mounts
  }, []);  // This will run once when the component mounts

  useEffect(() => {
    // When the searchQuery or currentPage changes, fetch the groups
    fetchGroups(currentPage, searchQuery);
  }, [searchQuery, currentPage]); // Trigger fetch when searchQuery or currentPage changes

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNoResultsFound(false);
    setCurrentPage(1); // Reset to page 1 when search query changes
    setTotalPagesAll(1);
    const query = event.target.value;
    setSearchQuery(query); // Update search query immediately

    // Update URL with the new search query
    if (query) {
      fetchGroups(1, query);  // Fetch the first page of groups with the new query
    } else {
      fetchGroups(1, ""); // If empty, fetch all groups
    }
  };

  const handleScroll = () => {
    if (loading || currentPage >= totalPagesAll) return;

    const container = document.getElementById("scroll-container");
    if (container) {
      const nearBottom =
        container.scrollHeight - container.scrollTop <= container.clientHeight + 10;
      if (nearBottom) {
        setCurrentPage((prev) => prev + 1); // Increment the page when reaching the bottom
      }
    }
  };

  useEffect(() => {
    const container = document.getElementById("scroll-container");
    if (container) container.addEventListener("scroll", handleScroll);

    return () => {
      if (container) container.removeEventListener("scroll", handleScroll);
    };
  }, [loading, currentPage, totalPagesAll]);

  return (
    <div>
      <Box id="scroll-container" sx={{ overflowY: "scroll", height: "90vh", mt: 0, width: "90vw", paddingRight: "13vw", paddingBottom: "4vw" }}>
        <Header title="Community" />
        <Container>
          {/* Friends Section */}
          <Box mt={10} mb={2} textAlign="center">
            <Typography variant="h4" gutterBottom>Friends</Typography>
          </Box>

          <Box display="flex" flexWrap="wrap" justifyContent="center" gap={2}>
          {friends.slice(0, 6).map((friend) => (
              <Box
                key={friend.id}
                sx={{
                  width: "100px",
                  minHeight: "100px",
                  border: "2px solid rgb(172, 169, 169)",
                  borderRadius: 2,
                  boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.1)",
                  transition: "all 0.3s ease",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  p: 1,
                  height: "100%",
                  "&:hover": {
                    borderColor: "#1976d2",
                    boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
                  },
                }}
                onClick={() => handleGoToOtherProfile(friend.id)}
              >
                {friend.profile_picture ? (
                  <Avatar
                    alt="Profile Picture"
                    src={`${config.serverUrl}/${friend.profile_picture}`}
                    sx={{ width: 70, height: 70, border: "1px solid #000" }}
                  />
                ) : (
                  <Avatar
                    sx={{ width: 70, height: 70, backgroundColor: "gray" }}
                  >
                    <PersonIcon sx={{ color: "white" }} />
                  </Avatar>
                )}
                <Typography variant="body2" mt={1}>
                  {friend.username}
                </Typography>
              </Box>
            ))}
            <Box onClick={() => navigate("/friends/")}>
              <IconButton>
                <AddCircleIcon sx={{ fontSize: 60, color: "#1976d2" }} />
              </IconButton>
              <Typography variant="body1" sx={{ color: "#1976d2" }}>More Friends</Typography>
            </Box>
          </Box>

          {/* Groups Section */}
          <Box mt={10} textAlign="center">
            <Box mt={4} mb={2} textAlign="center">
              <Typography variant="h4" gutterBottom>Groups</Typography>
            </Box>
            <Button variant="contained" color="primary"  onClick={() => navigate("/groups/create/")}  sx={{ marginBottom: 2 }}>
              Create a Group
            </Button>
            <TextField
              label="Search for groups"
              variant="outlined"
              fullWidth
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </Box>

          {/* Display no results message */}
          {noResultsFound && !loading && (
            <Box textAlign="center" mt={4}>
              <Typography variant="body2" color="textSecondary">No results found</Typography>
            </Box>
          )}

          {/* My Groups */}
          {myGroups.length > 0 && (
            <Box mt={4}>
              <Typography variant="h5" gutterBottom>My Groups</Typography>
              <Grid2 container spacing={2} columns={12}>
                {myGroups.map((group) => (
                  <Grid2 size={{ xs: 12, sm: 6, md: 4 }} key={group.id}>
                    <Group {...group} />
                  </Grid2>
                ))}
              </Grid2>
            </Box>
          )}

          {/* Invited Groups */}
          {invitedGroups.length > 0 && (
            <Box mt={4}>
              <Typography variant="h5" gutterBottom>Invited Groups</Typography>
              <Grid2 container spacing={2} columns={12}>
                {invitedGroups.map((group) => (
                  <Grid2 size={{ xs: 12, sm: 6, md: 4 }} key={group.id}>
                    <Group {...group} />
                  </Grid2>
                ))}
              </Grid2>
            </Box>
          )}

          {/* All Groups */}
          <Box mt={4}>
            <Typography variant="h5" gutterBottom>All Groups</Typography>
            <Grid2 container spacing={2} columns={12}>
              {groups.map((group) => (
                <Grid2 size={{ xs: 12, sm: 6, md: 4 }} key={group.id}>
                  <Group {...group} />
                </Grid2>
              ))}
            </Grid2>
          </Box>

          {loading && (
            <Box textAlign="center" mt={4}>
              <Typography variant="body2" color="textSecondary">Loading...</Typography>
            </Box>
          )}
        </Container>

        <Footer />
      </Box>
    </div>
  );
};

export default Groups;

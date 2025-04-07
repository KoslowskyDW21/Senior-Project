import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { Button, Typography, Box, Container, TextField, useMediaQuery, Grid2, CircularProgress } from "@mui/material";
import Header from "./Header";
import Footer from "./Footer";
import Challenge from "./Challenge";
import config from "../config.js";

interface ChallengeData {
  id: number;
  name: string;
  creator: number;
  image?: string;
  difficulty: "1" | "2" | "3" | "4" | "5";
  theme: string;
  location: string;
  start_time: Date;
  end_time: Date;
  is_complete: boolean;
  num_reports: number;
}

const Challenges: React.FC = () => {
  const [challenges, setChallenges] = useState<ChallengeData[]>([]);
  const [joinedChallenges, setJoinedChallenges] = useState<ChallengeData[]>([]);
  const [invitedChallenges, setInvitedChallenges] = useState<ChallengeData[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [noResultsFound, setNoResultsFound] = useState(false);
  const [totalPagesAll, setTotalPagesAll] = useState<number>(1);

  const navigate = useNavigate();
  const location = useLocation();

  const isSmallScreen = useMediaQuery("(max-width:600px)");
  const isMediumScreen = useMediaQuery("(min-width:600px) and (max-width:900px)");

  const challengesPerPage = 8;

  // Fetch challenges function
  const fetchChallenges = async (page: number, query: string) => {
    if (loading || page > totalPagesAll) return;
    setLoading(true);

    try {
      const response = await axios.get(`${config.serverUrl}/challenges/`, {
        params: { page, per_page: challengesPerPage, search: query },
      });
      const data = response.data;

      if (page === 1) {
        setChallenges(data.all_challenges.challenges);
      } else {
        setChallenges((prev) => [...prev, ...data.all_challenges.challenges]);
      }

      setJoinedChallenges(data.joined_challenges.challenges);
      setInvitedChallenges(data.invited_challenges.challenges);
      setTotalPagesAll(data.all_challenges.total_pages);

      // Set noResultsFound flag based on the result
      setNoResultsFound(data.all_challenges.challenges.length === 0);
    } catch (error) {
      console.error("Error fetching challenges:", error);
    } finally {
      setLoading(false);
    }
  };

  // This useEffect listens to searchQuery and currentPage changes
  useEffect(() => {
    if (searchQuery === "" && currentPage === 1) {
      setChallenges([]);
    }

    // Fetch challenges whenever searchQuery or currentPage changes
    fetchChallenges(currentPage, searchQuery);
  }, [currentPage, searchQuery]);

  // Handle search query change
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNoResultsFound(false);
    setChallenges([])
    setCurrentPage(1);
    console.log("Search query changing:", event.target.value);
    setTotalPagesAll(1)
    const query = event.target.value;
    setSearchQuery(query); // Update search query immediately

    // Update URL with the new search query
    if (query) {
      fetchChallenges(1, query)
    } else {
      fetchChallenges(1, "")
    }

    
  };

  // Scroll handler to load next page
  const handleScroll = () => {
    if (loading || currentPage >= totalPagesAll) return;

    const container = document.getElementById("scroll-container");
    if (container) {
      const nearBottom =
        container.scrollHeight - container.scrollTop <= container.clientHeight + 10;
      if (nearBottom) {
        setCurrentPage((prev) => prev + 1);
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
      <Box
        id="scroll-container"
        sx={{
          overflowY: "scroll",
          height: "90vh",
          mt: 0,
          width: "90vw",
          paddingRight: "8vw",
        }}
      >
        <Header title="Competitions" />
        <Box mt={10} textAlign="center" display="flex" justifyContent="center">
          <TextField
            label="Search for competitions"
            variant="outlined"
            value={searchQuery}
            onChange={handleSearchChange} // Ensure this is being called every time
            sx={{ width: "1200px" }}
          />
        </Box>
        <main role="main">
          <Container>
            <Box mt={4} mb={2} textAlign="center">
              <Button variant="contained" color="primary" onClick={() => navigate("/past-challenges")}>
                View Past Competitions
              </Button>
            </Box>

            <Box mt={4} mb={2} textAlign="center">
              <Button variant="contained" color="primary" onClick={() => navigate(`/challenges/create`)}>
                Create a Competition
              </Button>
            </Box>

            {invitedChallenges.length > 0 && (
              <Box mt={4}>
                <Typography variant="h5" gutterBottom>
                  Invited Competitions
                </Typography>
                <Box>
                  <Grid2 container spacing={2} columns={isSmallScreen ? 1 : isMediumScreen ? 2 : 4}>
                    {invitedChallenges.map((challenge) => (
                      <Grid2 key={challenge.id}>
                        <Challenge {...challenge} />
                      </Grid2>
                    ))}
                  </Grid2>
                </Box>
              </Box>
            )}

            {joinedChallenges.length > 0 && (
              <Box mt={4}>
                <Typography variant="h5" gutterBottom>
                  Joined Competitions
                </Typography>
                <Box>
                  <Grid2 container spacing={2} columns={isSmallScreen ? 1 : isMediumScreen ? 2 : 4}>
                    {joinedChallenges.map((challenge) => (
                      <Grid2 key={challenge.id}>
                        <Challenge {...challenge} />
                      </Grid2>
                    ))}
                  </Grid2>
                </Box>
              </Box>
            )}

            <Box mt={4}>
              <Typography variant="h5" gutterBottom>
                All Competitions
              </Typography>
              {noResultsFound ? (
                <Typography variant="h6" color="textSecondary">
                  No competitions found for this search.
                </Typography>
              ) : (
                <Grid2 container spacing={2} columns={isSmallScreen ? 1 : isMediumScreen ? 2 : 4}>
                  {challenges.map((challenge) => (
                    <Grid2 key={challenge.id}>
                      <Challenge {...challenge} />
                    </Grid2>
                  ))}
                </Grid2>
              )}
            </Box>
          </Container>

          {loading && currentPage === 1 && (
            <Box display="flex" justifyContent="center" mt={4}>
              <CircularProgress />
            </Box>
          )}

          <Footer />
        </main>
      </Box>
    </div>
  );
};

export default Challenges;

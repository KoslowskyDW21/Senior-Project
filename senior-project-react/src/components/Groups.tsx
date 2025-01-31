import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Grid,
  Box,
  Container,
} from "@mui/material";

interface UserGroup {
  id: number;
  name: string;
  description: string;
  is_public: boolean;
  num_reports: number;
  image?: string;
}

const Groups: React.FC = () => {
  const [groups, setGroups] = useState<UserGroup[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const navigate = useNavigate();

  const fetchGroups = async (page: number) => {
    try {
      const response = await axios.get(`http://127.0.0.1:5000/groups`, {
        params: { page, per_page: 10 },
      });
      if (response.status === 200) {
        setGroups((prevGroups) => [...prevGroups, ...response.data]);
      }
    } catch (error) {
      console.error("Error fetching groups:", error);
    }
  };

  const loadMoreGroups = () => {
    setLoading(true);
    fetchGroups(page).then(() => {
      setPage((prevPage) => prevPage + 1);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadMoreGroups();
  }, []);

  return (
    <Container>
      <Box mt={4} mb={2} textAlign="center">
        <Typography variant="h4" gutterBottom>
          User Groups
        </Typography>
      </Box>
      <Grid container spacing={2}>
        {groups.map((group) => (
          <Grid item xs={12} sm={6} md={4} key={group.id}>
            <Card onClick={() => navigate(`/groups/${group.id}`)} sx={{ cursor: "pointer" }}>
              {group.image && (
                <CardMedia
                  component="img"
                  height="140"
                  image={`http://127.0.0.1:5000/${group.image}`}
                  alt={group.name}
                />
              )}
              <CardContent>
                <Typography variant="h6" component="div" gutterBottom>
                  {group.name}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {group.description}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {group.is_public ? "Public" : "Private"}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Reports: {group.num_reports}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      {loading && (
        <Box textAlign="center" mt={4}>
          <Typography variant="body2" color="textSecondary">
            Loading...
          </Typography>
        </Box>
      )}
    </Container>
  );
};

export default Groups;
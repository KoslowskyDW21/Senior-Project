import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Container,
  IconButton,
} from "@mui/material";

interface UserGroup {
  id: number;
  name: string;
  creator: number;
  image: string;
  description: string;
  is_public: boolean;
  num_reports: number;
}
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const GroupDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [group, setGroup] = useState<UserGroup | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchGroup = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:5000/groups/${id}`);
        if (response.status === 200) {
          setGroup(response.data);
        }
      } catch (error) {
        console.error("Error fetching group details:", error);
      }
    };

    fetchGroup();
  }, [id]);

  if (!group) {
    return (
      <Container>
        <Typography variant="h5" textAlign="center" mt={4}>
          Loading...
        </Typography>
      </Container>
    );
  }

  return (
    <Container>
      <IconButton
        onClick={() => navigate(-1)}
        style={{ position: "absolute", top: 30, left: 30 }} 
      >
        <ArrowBackIcon sx={{ fontSize: 30, fontWeight: 'bold' }} />
      </IconButton>
      <Box mt={4} mb={2} textAlign="center">
        <Typography variant="h4" gutterBottom>
          {group.name}
        </Typography>
      </Box>
      <Card>
        <CardContent>
          <Typography variant="h6" component="div" gutterBottom>
            Description
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
    </Container>
  );
};

export default GroupDetails;
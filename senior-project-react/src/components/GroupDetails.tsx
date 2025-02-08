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
  Button,
} from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from "react-router-dom";

interface UserGroup {
  id: number;
  name: string;
  creator: number;
  image: string;
  description: string;
  is_public: boolean;
}

interface GroupMember {
  user_id: number;
  username: string;
}

const GroupDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [group, setGroup] = useState<UserGroup | null>(null);
  const [isMember, setIsMember] = useState<boolean>(false);
  const [members, setMembers] = useState<GroupMember[]>([]);
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

    const checkMembership = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:5000/groups/${id}/is_member`);
        setIsMember(response.data.is_member);
      } catch (error) {
        console.error("Error checking membership:", error);
      }
    };

    const fetchMembers = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:5000/groups/${id}/members`);
        setMembers(response.data);
      } catch (error) {
        console.error("Error fetching group members:", error);
      }
    };

    fetchGroup();
    checkMembership();
    fetchMembers();
  }, [id]);

  const handleJoinGroup = async () => {
    try {
      await axios.post(`http://127.0.0.1:5000/groups/${id}/join`);
      setIsMember(true);
      fetchMembers();
    } catch (error) {
      console.error("Error joining group:", error);
    }
  };

  const handleLeaveGroup = async () => {
    try {
      await axios.post(`http://127.0.0.1:5000/groups/${id}/leave`);
      setIsMember(false);
      fetchMembers();
    } catch (error) {
      console.error("Error leaving group:", error);
    }
  };

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
        {group.image && (
          <CardMedia
            component="img"
            height="400"
            image={`http://127.0.0.1:5000/${group.image}`}
            alt={group.name}
          />
        )}
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
          <Box textAlign="center" mt={4}>
            {isMember ? (
              <Button
                variant="contained"
                color="secondary"
                onClick={handleLeaveGroup}
              >
                Leave Group
              </Button>
            ) : (
              <Button
                variant="contained"
                color="primary"
                onClick={handleJoinGroup}
              >
                Join Group
              </Button>
            )}
          </Box>
          <Box mt={4}>
            <Typography variant="h5" gutterBottom>
              Members
            </Typography>
            <ul>
              {members.map((member) => (
                <li key={member.user_id}>{member.username}</li>
              ))}
            </ul>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default GroupDetails;
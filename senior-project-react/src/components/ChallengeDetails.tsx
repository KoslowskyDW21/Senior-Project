import React from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

interface Challenge {
  id: number;
  name: string;
  creator: number;
  image?: string;
  difficulty: "1" | "2" | "3" | "4" | "5";
  theme: string;
  location: string;
  start_time: string;
  end_time: string;
  is_complete: boolean;
  num_reports: number;
}

const ChallengeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [challenge, setChallenge] = React.useState<Challenge | null>(null);

  React.useEffect(() => {
    const fetchChallenge = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:5000/challenges/${id}`);
        setChallenge(response.data);
      } catch (error) {
        console.error("Error fetching challenge details:", error);
      }
    };
    fetchChallenge();
  }, [id]);

  if (!challenge) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>{challenge.name}</h1>
      <p>Creator: {challenge.creator}</p>
      <p>Difficulty: {challenge.difficulty}</p>
      <p>Theme: {challenge.theme}</p>
      <p>Location: {challenge.location}</p>
      <p>Start Time: {new Date(challenge.start_time).toLocaleString()}</p>
      <p>End Time: {new Date(challenge.end_time).toLocaleString()}</p>
      <p>Completed: {challenge.is_complete ? "Yes" : "No"}</p>
      <p>Number of Reports: {challenge.num_reports}</p>
      {challenge.image && <img src={challenge.image} alt={challenge.name} style={{ maxWidth: "400px" }} />}
    </div>
  );
};

export default ChallengeDetail;

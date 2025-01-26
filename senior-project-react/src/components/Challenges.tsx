import React from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

interface UserId {
  id: number;
}

interface Challenge {
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
  const [challenges, setChallenges] = React.useState<Challenge[]>([]);
  const [myChallenges, setMyChallenges] = React.useState<Challenge[]>([]);
  const navigate = useNavigate();

  const getResponse = async () => {
    try {
      // Fetch all challenges
      const response = await axios.get("http://127.0.0.1:5000/challenges/");
      const data: Challenge[] = response.data;
      setChallenges(data);

      // Fetch current user
      const userResponse: UserId = await axios.get("http://127.0.0.1:5000/challenges/current_user_id");
      const currentUserId = userResponse.data;

      // Filter challenges created by the current user
      const userChallenges = data.filter(challenge => challenge.creator === currentUserId);
      setMyChallenges(userChallenges);

      // Filter out the current user's challenges from the main list
      const otherChallenges = data.filter(challenge => challenge.creator !== currentUserId);
      setChallenges(otherChallenges);
    } catch (error) {
      console.error("Error fetching challenges:", error);
    }
  };

  React.useEffect(() => {
    getResponse();
  }, []);

  return (
    <div>
      <button onClick={() => navigate(`/challenges/create`)}>
        Create a Challenge
      </button>
      <h1>Challenges</h1>
      {myChallenges.length > 0 && (
        <div>
          <h2>My Challenges</h2>
          <ul>
            {myChallenges.map((challenge) => (
              <li key={challenge.id}>
                <h3>{challenge.name}</h3>
                <button onClick={() => navigate(`/challenges/${challenge.id}`)}>
                  View Details
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      <h2>All Challenges</h2>
      <ul>
        {challenges.map((challenge) => (
          <li key={challenge.id}>
            <h3>{challenge.name}</h3>
            <button onClick={() => navigate(`/challenges/${challenge.id}`)}>
              View Details
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Challenges;
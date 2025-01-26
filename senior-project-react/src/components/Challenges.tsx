import React from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

interface Challenges {
    challenges: Challenge[];
}

interface Challenge {
    id: number;
    name: string;
    creator: number;
    image?: string;
    difficulty: '1' | '2' | '3' | '4' | '5';
    theme: string;
    location: string;
    start_time: Date;
    end_time: Date;
    is_complete: boolean;
    num_reports: number;
  }
    

  const Challenges: React.FC = () => {
    const [challenges, setChallenges] = React.useState<Challenge[]>([]);
    const navigate = useNavigate();
  
    const getResponse = async () => {
      try {
        const response = await axios.post("http://127.0.0.1:5000/challenges/");
        const data: Challenge[] = response.data;
        setChallenges(data);
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
        <ul>
        {challenges.map((challenge) => (
          <li key={challenge.id}>
            <h2>{challenge.name}</h2>
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
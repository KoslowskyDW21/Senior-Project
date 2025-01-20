import React from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

interface Achievements {
        achievements: Achievement[];
}

interface Achievement{
    id: number;
    title: string;
    image?: string;
    isComplete: boolean;
    isVisible: boolean;

}
const Achievements: React.FC = () => {
    const [achievements, setAchievements] = React.useState<Achievement[]>([]);
    const navigate = useNavigate();
  
    const getResponse = async () => {
      try {
        const response = await axios.post("http://127.0.0.1:5000/challenges/");
        const data: Achievement[] = response.data;
        setAchievements(data);
      } catch (error) {
        console.error("Error fetching achievements:", error);
      }
    };
  
    React.useEffect(() => {
      getResponse();
    }, []);
  
    return (
      <div>
        <h1>Achievements</h1>
        <ul>
        {achievements.map((achievement) => (
          <li key={achievement.id}>
            <h2>{achievement.title}</h2>
            <button onClick={() => navigate(`/achievement/${achievement.id}`)}>
              View Details
            </button>
            </li>
          ))}
        </ul>
      </div>
    );
  };

export default Achievements;
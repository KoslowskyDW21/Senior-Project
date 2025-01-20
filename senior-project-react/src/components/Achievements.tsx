import React from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

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

/*const achievements = [{
    id: 1,
    title: "Getting Started",
    image: 'https://st.depositphotos.com/1570716/1697/i/950/depositphotos_16978587-stock-photo-male-chef-cooking.jpg',
    isComplete: true,
    isVisible: true

},
{
    id: 2,
    title: "Getting Started 2",
    image: 'https://st.depositphotos.com/1570716/1697/i/950/depositphotos_16978587-stock-photo-male-chef-cooking.jpg',
    isComplete: true,
    isVisible: true

}
];*/

const Achievements: React.FC = () => {
    const [achievements, setAchievements] = React.useState<Achievement[]>([]);
    const navigate = useNavigate();
  
    const getResponse = async () => {
      try {
        const response = await axios.post(`http://127.0.0.1:5000/achievements/`);
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
        {achievements.map((achievement) => (
          <div key={achievement.id}>
            <button><img src={achievement.image} width = "100" onClick={() => navigate(`/achievements/${achievement.id}`)} /></button>
            <p> {achievement.title}</p>
            
          </div> 
          ))}
      </div>
    );
  };

export default Achievements;
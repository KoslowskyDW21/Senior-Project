import React from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

interface Achievement{
    id: number;
    title: string;
    image?: string;
    isComplete: boolean;
    isVisible: boolean;
    description: string;

}


const AchievementSpecific: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [achievement, setAchievement] = React.useState<Achievement | null>(null);
    React.useEffect(() => {
        const fetchAchievement = async () => {
            try {
                const response = await axios.get(`http://127.0.0.1:5000/achievements/${id}`);
                setAchievement(response.data);
              } catch (error) {
                console.error("Error fetching achievement details:", error);
              }
            };
            fetchAchievement();
            
          }, [id]);
    if(!achievement){
        return 
    }
    return (
        <div>
        <h1>{achievement.title}</h1>   
        <button><img src= {achievement.image}/></button> 
        <p>{achievement.description}</p>
        <p>Completed: {achievement.isComplete.toString()}</p>
        </div>

    );

};
export default AchievementSpecific;


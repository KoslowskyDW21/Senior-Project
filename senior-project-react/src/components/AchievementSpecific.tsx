import React from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

interface Achievement{
    id: number;
    title: string;
    image?: string;
    isComplete: boolean;
    isVisible: boolean;

}

const achievements = [{
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
];

const AchievementSpecific: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const getResponse = async () => {
        try {
          const response = await axios.post(`http://127.0.0.1:5000/achievements/${id}`);
        } catch (error) {
          console.error("Error fetching achievements:", error);
        }
      };
       React.useEffect(() => {
            getResponse();
          }, [id]);
    
    const theA  = achievements[Number(id)];
    const isC = String(theA.isComplete)
    return (
        <div>
        <h1>{theA.title}</h1>   
        <button><img src= {theA.image}/></button> 
        <p>Completed: {isC}</p>
        </div>

    );

};
export default AchievementSpecific;


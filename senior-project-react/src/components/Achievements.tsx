import React from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import Modal from '@mui/material/Modal';
import Button from '@mui/material/Button';
import { Avatar } from "@mui/material";
import Box from '@mui/material/Box';
import Typography from "@mui/material/Typography";

interface Achievements {
        achievements: Achievement[];
}

interface Achievement{
    id: number;
    title: string;
    image?: string;
    isVisible: boolean;
    description: string;

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
const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};
  

const Achievements: React.FC = () => {
    const [achievements, setAchievements] = React.useState<Achievement[]>([]);
    const navigate = useNavigate();

    const [open, setOpen] = React.useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
  
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

    //handleOpenModal(achievement):

  
    return (
      <div>
        <h1>Achievements</h1>
        {achievements.map((achievement) => (
          <div key={achievement.id}>
            <Button 
            variant ="contained" 
            color = "secondary"
            startIcon ={<Avatar src = {achievement.image}/>}
            onClick = {handleOpen}></Button> 
            <Modal
              open={open}
              onClose={handleClose}
              aria-labelledby="modal-modal-title"
              aria-describedby="modal-modal-description"
            >
            <Box sx={style}>
              <Typography id="modal-modal-title" variant="h6" component="h2">
               {achievement.title}
              </Typography>
              <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                {achievement.description}
              </Typography>
             </Box>
            </Modal>
            <p> {achievement.title}</p>
            <p>{achievement.description}</p>
          </div> 
          ))}
      </div>

    );
  };

export default Achievements;
import { useTheme } from "@mui/material/styles";
import { useNavigate } from "react-router-dom"; // React Router for nav
import { Button } from "@mui/material"; //matui components

const Footer = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "space-around",
        padding: "10px",
        backgroundColor: theme.palette.background.default,
        boxShadow: "0px -2px 5px rgba(0, 0, 0, 0.1)",
        zIndex: 1000,
      }}
    >
      <Button variant="outlined" color="primary" sx={{ flex: 1 }}>
        Recipes
      </Button>
      <Button
        onClick={() => navigate("/challenges")}
        variant="contained"
        color="primary"
        sx={{ flex: 1 }}
      >
        Challenges
      </Button>
      <Button
        onClick={() => navigate("/groups")}
        variant="contained"
        color="primary"
        sx={{ flex: 1 }}
      >
        Community
      </Button>
    </div>
  );
};

export default Footer;

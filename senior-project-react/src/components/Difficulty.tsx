import React from "react";
import { Box } from "@mui/material";

interface DifficultyProps {
  difficulty: "1" | "2" | "3" | "4" | "5";
}

const Difficulty: React.FC<DifficultyProps> = ({ difficulty }) => {
  const diamondStyle = {
    width: 24,
    height: 24,
    backgroundColor: "black",
    transform: "rotate(45deg)",
    marginRight: 2,
  };

  const renderDiamonds = (num: number) => {
    const diamonds = [];
    for (let i = 0; i < 5; i++) {
      diamonds.push(
        <Box
          key={i}
          sx={{
            ...diamondStyle,
            opacity: i < num ? 1 : 0.1,
          }}
        />
      );
    }
    return diamonds;
  };

  return (
    <Box sx={{ display: "flex", justifyContent: "center", padding: "2px" }}>
      {renderDiamonds(parseInt(difficulty))}
    </Box>
  );
};

export default Difficulty;
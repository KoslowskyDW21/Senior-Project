import React, { useState } from "react";
import { Button, Container, TextField } from "@mui/material";

interface CreateRecipeListResponse {
    message: string;
    recipe_list_id: number;
}

const CreateRecipeList: React.FC = () => {
    const [ name, setName ] = useState("");
    const [ message, setMessage ] = useState("");

    const handleCreateRecipeList = async () => {
        // TODO: implement
    }

    return (
        <Container>
            <h2>Create a New RecipeList</h2>
            <TextField
                label="Name"
                variant="outlined"
                fullWidth
                value={name}
                onChange={(e) => setName(e.target.value)}
                margin="normal"
            />
            <Button
                onClick={handleCreateRecipeList}
                variant="contained"
                color="primary"
                fullWidth
            >
                Create RecipeList
            </Button>
            {message && <p>{message}</p>}
        </Container>
    );
};

export default CreateRecipeList;
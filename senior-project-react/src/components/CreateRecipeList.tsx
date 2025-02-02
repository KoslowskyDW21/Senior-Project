import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Container, TextField } from "@mui/material";
import axios, { AxiosError } from "axios";

interface CreateRecipeListResponse {
    message: string;
    recipe_list_id: number;
}

const CreateRecipeList: React.FC = () => {
    const [ name, setName ] = useState("");
    const [ message, setMessage ] = useState("");
    const navigate = useNavigate();

    const handleCreateRecipeList = async () => {
        console.log(`Trying to create a recipe list with the name ${name}`);
        const formData = new FormData();
        formData.append("name", name);
        try {
            const response = await axios.post(
                "http://127.0.0.1:5000/recipe_lists/createlist",
                formData,
                { headers: {"Content-Type": "multipart/form-data"} }
            );
            const data: CreateRecipeListResponse = response.data;
            setMessage(data.message);
            console.log(data.message);
        } catch (error) {
            const axiosError = error as AxiosError;
            if (axiosError.response && axiosError.response.data) {
                const errorData = axiosError.response.data as CreateRecipeListResponse;
                setMessage(errorData.message);
            } else {
                setMessage("An unknown error ocurred");
            }
        }
        navigate(`/recipe-lists`);
    }

    const handleGoToRecipeLists = async () => {
        console.log("Navigating to recipe lists page");
        navigate(`/recipe-lists`);
    }

    return (
        <Container>
            <h2>Create a New Recipe List</h2>
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
                Create Recipe List
            </Button>
            <br />
            <br />
            <Button
                onClick={handleGoToRecipeLists}
                variant="outlined"
            >
                Cancel
            </Button>
            {message && <p>{message}</p>}
        </Container>
    );
};

export default CreateRecipeList;
import React from "react";
import axios, { AxiosError } from "axios";

interface LoadResponse {
    message: string;
  }

const Challenges: React.FC = () => {
    const [message, setMessage] = React.useState<string>("");

    const getResponse = async () => {
        const response = await axios.post(
            "http://127.0.0.1:5000/challenges/"
        );
        const data: LoadResponse = response.data;
        setMessage(data.message);
    }

    React.useEffect(() => {
        getResponse();
    }, []);

    return (
        <>
            <h1>{message}</h1>
        </>
    )
}

export default Challenges;
import axios from "axios";
import React from "react";

interface ProfileResponse {
    id: string; // could have some problems here
}

const Profile: React.FC = () => {
    const [id, setId] = React.useState<String>();

    const getResponse = async () => {
        const response = await axios.post(
            "http://127.0.0.1:5000/profile/2" //TODO: refactor to allow the changing of the user id
        );
        const data: ProfileResponse = response.data;
        setId(data.id);
    }

React.useEffect(() => {
    getResponse();
}, []);

    return (
        <>
            <h1>This is a profile page!!</h1> {/* TODO: replace with actual account information */}
            <h2>This profile belongs to the user with id={id}</h2>
        </>
    )
}

export default Profile;
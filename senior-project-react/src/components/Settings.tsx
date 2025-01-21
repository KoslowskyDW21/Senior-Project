import axios, { AxiosError } from "axios";
import { useState } from "react";
import React from "react";

namespace SettingsPage {
    export interface User {
        id: number;
        fname: string;
        lname: string;
        profile_picture: string;
        colonial_floor: string;
        colonial_side: string;
    }
}



export default function Settings() {
    const [user, setUser] = useState({
        id:null,
        fname:null,
        lname:null,
        profile_picture:null,
        colonial_floor:null,
        colonial_side:null
    });

    async function loadUser() {
        try {
            const response = await axios.post("http://127.0.0.1:5000/settings/");
            setUser(response.data);
        } catch (error) {
    
        }
    }

    React.useEffect(() => { loadUser(); }, []);

    return (
        <>
            <h1>Settings Page</h1>
            <p>Name: {user.fname} {user.lname}</p>
            <p>Colonial Floor: {user.colonial_floor}</p>
            <p>Colonial Side: {user.colonial_side}</p>
        </>
    );
}
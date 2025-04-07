import { Navigate, Outlet } from "react-router-dom";
import { useMsal } from "@azure/msal-react";
import { useEffect, useState } from "react";
import axios from "axios";
import config from "../config";

const Unregistered = () => {
  const [isRegistered, setIsRegistered] = useState(false);
  const [user, setUser] = useState({
    id: null,
  });

  async function loadUser() {
    await axios
      .get(`${config.serverUrl}/settings/`)
      .then((response) => {
        setUser(response.data);
        console.log("User response:", response.data);
      })
      .catch((error) => {
        console.log("Could not fetch user: ", error);
      });
  }

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (user.id === null) {
      console.log("user not found");
      setIsRegistered(false);
    } else {
      console.log("user found");
      setIsRegistered(true);
    }
  }, [user]);

  return !isRegistered ? <Outlet /> : <Navigate to="/" replace />;
};

export default Unregistered;

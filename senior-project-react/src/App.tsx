import { useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { RegistrationProvider } from "./components/RegistrationContext";
import Login from "./components/Login";
import RegistrationOne from "./components/RegistrationOne";
import RegistrationTwo from "./components/RegistrationTwo";
import Recipes from "./components/Recipes";
import Profile from "./components/Profile"
import axios from "axios";
import "./App.css";
import Challenges from "./components/Challenges";

function App() {
  // EXAMPLE FOR RETRIEVING DATA FROM FLASK
  const fetchAPI = async () => {
    const response = await axios.get("http://127.0.0.1:5000");
    console.log(response.data);
  };

  useEffect(() => {
    fetchAPI();
  }, []);

  return (
    <Router>
      <RegistrationProvider>
        <Routes>
          {/* Default route (login page) */}
          <Route path="/" element={<Login />} />

          {/* Registration pages */}
          <Route path="/registration-one" element={<RegistrationOne />} />
          <Route path="/registration-two" element={<RegistrationTwo />} />

          {/* Recipes page */}
          <Route path="/recipes" element={<Recipes />} />

          {/* profile */}
          <Route path="/profile" element={<Profile />} />

          {/* challenges */}
          <Route path="/challenges" element={<Challenges />} />
        </Routes>
      </RegistrationProvider>
    </Router>
  );
}

export default App;

import { useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { RegistrationProvider } from "./components/RegistrationContext";
import Login from "./components/Login";
import RegistrationOne from "./components/RegistrationOne";
import RegistrationTwo from "./components/RegistrationTwo";
import Recipe from "./components/Recipe";
import Recipes from "./components/Recipes";
import Profile from "./components/Profile"
import Settings from "./components/Settings";
import axios from "axios";
import "./App.css";
import Challenges from "./components/Challenges";
import ChallengeDetail from "./components/ChallengeDetails";
import Achievements from "./components/Achievements";
import AchievementSpecific from "./components/AchievementSpecific";

function App() {
  // this allows cookies to be sent with all requests in the app
  useEffect(() => {
    axios.defaults.withCredentials = true;
  }, []);

  // EXAMPLE FOR RETRIEVING DATA FROM FLASK
  // const fetchAPI = async () => {
  //   const response = await axios.get("http://127.0.0.1:5000");
  //   console.log(response.data);
  // };

  // useEffect(() => {
  //   fetchAPI();
  // }, []);

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
          <Route path="/recipes/:id" element={<Recipe />} />

          {/* profile */}
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/:id" element={<Profile />} />

          {/* challenges */}
          <Route path="/challenges" element={<Challenges />} />
          <Route path="/challenges/:id" element={<ChallengeDetail />} />

          {/*achievements*/}
          <Route path="/achievements" element ={<Achievements />} />
          <Route path="/achievements/:id" element={<AchievementSpecific />} />

          {/* settings */}
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </RegistrationProvider>
    </Router>
  );
}

export default App;

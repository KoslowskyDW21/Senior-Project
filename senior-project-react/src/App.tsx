import { useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./components/Login";
import Recipes from "./components/Recipes";
import Profile from "./components/Profile"
import axios from "axios";
import "./App.css";

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
      <Routes>
        {/* Default route (login page) */}
        <Route path="/" element={<Login />} />{" "}
        <Route path="/recipes" element={<Recipes />} />
        {/* Profile route */}
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </Router>
  );
}

export default App;

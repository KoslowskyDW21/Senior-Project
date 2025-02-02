import { useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { RegistrationProvider } from "./components/RegistrationContext";
import Login from "./components/Login";
import RegistrationOne from "./components/RegistrationOne";
import RegistrationTwo from "./components/RegistrationTwo";
import RegistrationThree from "./components/RegistrationThree";
import IndividualRecipe from "./components/Recipe";
import { MsalProvider } from "@azure/msal-react";
import { msalConfig } from "./authConfig";
import Recipes from "./components/Recipes";
import RecipeList from "./components/RecipeList";
import RecipeLists from "./components/RecipeLists";
import Profile from "./components/Profile";
import Settings from "./components/Settings";
import axios from "axios";
import "./App.css";
import Challenges from "./components/Challenges";
import ChallengeDetail from "./components/ChallengeDetails";
import Achievements from "./components/Achievements";
import AchievementSpecific from "./components/AchievementSpecific";
import CompletedRecipe from "./components/CompletedRecipe";
import CreateChallenge from "./components/CreateChallenge";
import DeletedAccount from "./components/DeletedAccount";
import AdminPage from "./components/AdminPage";
import Groups from "./components/Groups";
import GroupDetails from "./components/GroupDetails";
import CreateRecipeList from "./components/CreateRecipeList";
import { PublicClientApplication } from "@azure/msal-browser";
import ProtectedRoute from "./components/ProtectedRoute";

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

  const msalInstance = new PublicClientApplication(msalConfig);

  return (
    <MsalProvider instance={msalInstance}>
      <Router>
        <RegistrationProvider>
          <Routes>
            {/* Default route (login page) */}
            <Route path="/" element={<Login />} />

            {/* Protected Routes for Authenticated Users */}
            <Route element={<ProtectedRoute />}>
              {/* Registration pages */}
              <Route path="/registration-one" element={<RegistrationOne />} />
              <Route path="/registration-two" element={<RegistrationTwo />} />
              <Route
                path="/registration-three"
                element={<RegistrationThree />}
              />

          {/* recipes */}
          <Route path="/recipes" element={<Recipes />} />
          <Route path="/recipes/:id" element={<IndividualRecipe />} />
          <Route path="/recipes/completed/:id" element={<CompletedRecipe />} />

          {/* recipelists */}
          <Route path="/recipe-lists" element={<RecipeLists />} />
          <Route path="/recipe-lists/:id" element={<RecipeList />} />
          <Route path="/recipe-lists/create" element={<CreateRecipeList />} />

              {/* profile */}
              <Route path="/profile" element={<Profile />} />
              <Route path="/profile/:id" element={<Profile />} />

              {/* challenges */}
              <Route path="/challenges" element={<Challenges />} />
              <Route path="/challenges/:id" element={<ChallengeDetail />} />
              <Route path="/challenges/create" element={<CreateChallenge />} />

              {/*achievements*/}
              <Route path="/achievements" element={<Achievements />} />
              <Route
                path="/achievements/:id"
                element={<AchievementSpecific />}
              />

              {/* settings */}
              <Route path="/settings" element={<Settings />} />
              <Route path="/deleted_account" element={<DeletedAccount />} />

          {/* groups */}
          <Route path="/groups" element={<Groups />} />
          <Route path="/groups/:id" element={<GroupDetails />} />

              {/* admin */}
              <Route path="/admin" element={<AdminPage />} />
            </Route>
            {/* Redirect unknown routes to login */}
            <Route path="/" element={<Login />} />
          </Routes>
        </RegistrationProvider>
      </Router>
    </MsalProvider>
  );
}

export default App;

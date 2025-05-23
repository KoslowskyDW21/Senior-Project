import { useEffect, useState, useMemo } from "react";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { lightTheme, darkTheme } from "./theme";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { RegistrationProvider } from "./components/RegistrationContext";
import config from "./config.js";
import Login from "./components/Login";
import RegistrationOne from "./components/RegistrationOne";
import RegistrationTwo from "./components/RegistrationTwo";
import RegistrationThree from "./components/RegistrationThree";
import RegistrationFour from "./components/RegistrationFour";
import IndividualRecipe from "./components/Recipe";
import { MsalProvider } from "@azure/msal-react";
import { msalConfig } from "./authConfig";
import Recipes from "./components/Recipes";
import RecipeList from "./components/RecipeList";
import RecipeLists from "./components/RecipeLists";
import ShoppingList from "./components/ShoppingList";
import Profile from "./components/Profile";
import OtherProfile from "./components/otherProfile";
import Settings from "./components/Settings";
import axios from "axios";
import "./App.css";
import Challenges from "./components/Challenges";
import ChallengeDetail from "./components/ChallengeDetails";
import ChallengeVoting from "./components/ChallengeVoting";
import Achievements from "./components/Achievements";
import AchievementSpecific from "./components/AchievementSpecific";
import CompletedRecipe from "./components/CompletedRecipe";
import CreateChallenge from "./components/CreateChallenge";
import ChallengeResults from "./components/ChallengeResults";
import PastChallenges from "./components/PastChallenges";
import DeletedAccount from "./components/DeletedAccount";
import AdminPage from "./components/AdminPage";
import Groups from "./components/Groups";
import GroupDetails from "./components/GroupDetails";
import CreateGroup from "./components/CreateGroup";
import GroupMessages from "./components/GroupMessages";
import CreateRecipeList from "./components/CreateRecipeList";
import Banned from "./components/Banned";
import Friends from "./components/Friends";
import ReportPage from "./components/ReportPage";
import { PublicClientApplication } from "@azure/msal-browser";
import ProtectedRoute from "./components/ProtectedRoute";
import Unregistered from "./components/Unregistered";
import useIdTokenRefresher from "./hooks/refresh";
import {
  useThemeContext,
  ThemeContextProvider,
} from "./components/ThemeContext";

const msalInstance = new PublicClientApplication(msalConfig);

function App() {
  // State to indicate if MSAL instance is initialized
  const [isMsalInitialized, setIsMsalInitialized] = useState(false);

  useEffect(() => {
    // Initialize MSAL instance
    msalInstance
      .initialize()
      .then(() => {
        setIsMsalInitialized(true);
      })
      .catch((error) => {
        console.error("MSAL initialization failed:", error);
      });

    // Allow cookies to be sent with all requests in the app
    axios.defaults.withCredentials = true;
  }, []);

  useIdTokenRefresher();

  if (!isMsalInitialized) {
    return <div>Loading...</div>;
  }

  return (
    <MsalProvider instance={msalInstance}>
      <ThemeContextProvider>
        <AppContent />
      </ThemeContextProvider>
    </MsalProvider>
  );
}

function AppContent() {
  const { isDarkMode } = useThemeContext();
  const theme = useMemo(
    () => (isDarkMode ? darkTheme : lightTheme),
    [isDarkMode]
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <RegistrationProvider>
          <Routes>
            {/* Default route (login page) */}
            <Route path="/" element={<Login />} />
            {/* Registration pages */}
            <Route element={<Unregistered />}>
              <Route path="/registration-one" element={<RegistrationOne />} />
              <Route path="/registration-two" element={<RegistrationTwo />} />
              <Route
                path="/registration-three"
                element={<RegistrationThree />}
              />
              <Route path="/registration-four" element={<RegistrationFour />} />
            </Route>
            {/* Protected Routes for Authenticated Users */}
            <Route element={<ProtectedRoute />}>
              {/* recipes */}
              <Route path="/recipes" element={<Recipes />} />
              <Route path="/recipes/:id" element={<IndividualRecipe />} />
              <Route
                path="/recipes/completed/:id"
                element={<CompletedRecipe />}
              />

              {/* recipelists */}
              <Route path="/recipe-lists" element={<RecipeLists />} />
              <Route path="/recipe-lists/:id" element={<RecipeList />} />
              <Route
                path="/recipe-lists/create"
                element={<CreateRecipeList />}
              />

              {/* shoppinglist */}
              <Route path="/shopping-list" element={<ShoppingList />} />

              {/* profile */}
              <Route path="/profile" element={<Profile />} />
              <Route path="/profile/:id" element={<Profile />} />
              <Route path="/otherProfile/:id" element={<OtherProfile />} />

              {/* challenges */}
              <Route path="/challenges" element={<Challenges />} />
              <Route path="/challenges/:id" element={<ChallengeDetail />} />
              <Route path="/challenges/create" element={<CreateChallenge />} />
              <Route
                path="/challenges/:id/vote"
                element={<ChallengeVoting />}
              />
              <Route path="/past-challenges" element={<PastChallenges />} />
              <Route
                path="/challenges/:id/vote_results"
                element={<ChallengeResults />}
              />

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
              <Route path="/groups/create" element={<CreateGroup />} />
              <Route path="/groups/:id/messages" element={<GroupMessages />} />

              {/* friends */}
              <Route path="/friends" element={<Friends />} />

              {/* admin */}
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/reported_content" element={<ReportPage />} />

              {/* banned */}
              <Route path="/banned" element={<Banned />} />
            </Route>
            {/* Redirect unknown routes to login */}
            <Route path="*" element={<Login />} />
          </Routes>
        </RegistrationProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;

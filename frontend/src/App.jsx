/**
 * App Component
 * Main application router and layout
 */

import { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useAuth } from "./hooks/useAuth";

// Pages
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import DashboardPage from "./pages/DashboardPage";
import CaloriesPage from "./pages/CaloriesPage";
import ActivitiesPage from "./pages/ActivitiesPage";
import GoalsPage from "./pages/GoalsPage";
import InsightsPage from "./pages/InsightsPage";
import ChatbotPage from "./pages/ChatbotPage";
import ProfilePage from "./pages/ProfilePage";
import NotFoundPage from "./pages/NotFoundPage";

// Components
import { AuthGuard } from "./components/common/AuthGuard";
import { ErrorBanner } from "./components/common/ErrorBanner";

// Styles
import "./styles/globals.css";
import "./styles/variables.css";
import "./styles/animations.css";

function App() {
  const { token, checkSession, sessionChecked } = useAuth();

  // Check session on app load only once
  useEffect(() => {
    if (!sessionChecked && token) {
      checkSession();
    }
  }, [token, sessionChecked, checkSession]);

  return (
    <Router>
      {/* Global Error Banner */}
      <ErrorBanner />

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route
          path="/login"
          element={token ? <Navigate to="/dashboard" /> : <LoginPage />}
        />
        <Route
          path="/signup"
          element={token ? <Navigate to="/dashboard" /> : <SignupPage />}
        />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <AuthGuard>
              <DashboardPage />
            </AuthGuard>
          }
        />
        <Route
          path="/calories"
          element={
            <AuthGuard>
              <CaloriesPage />
            </AuthGuard>
          }
        />
        <Route
          path="/activities"
          element={
            <AuthGuard>
              <ActivitiesPage />
            </AuthGuard>
          }
        />
        <Route
          path="/goals"
          element={
            <AuthGuard>
              <GoalsPage />
            </AuthGuard>
          }
        />
        <Route
          path="/insights"
          element={
            <AuthGuard>
              <InsightsPage />
            </AuthGuard>
          }
        />
        <Route
          path="/chatbot"
          element={
            <AuthGuard>
              <ChatbotPage />
            </AuthGuard>
          }
        />
        <Route
          path="/profile"
          element={
            <AuthGuard>
              <ProfilePage />
            </AuthGuard>
          }
        />

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

export default App;

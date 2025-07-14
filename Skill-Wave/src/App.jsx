import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import { auth } from "../src/Firebase";
import { FirebaseProvider } from "../src/Firebase";

import DashboardLayout from "./Teacher/TComponents/Layouts/Dashboard-Layout";
import LoginPage from "./Teacher/TPages/Login";
import Dashboard from "./Teacher/TPages/Dashboard";
import Videos from "./Teacher/TPages/Videos";

import HostEvent from "./Teacher/TPages/HostEvent";
// import Events from "./Teacher/TPages/Events";
import VideoPlayer from "./Teacher/TPages/VideoPlayer";
import Challenges from "./Teacher/TPages/Challenges";
import UploadChallenge from "./Teacher/TPages/UploadChallenge";
import UploadVideo from "./Teacher/TPages/UploadVideo";

import LHome from "./Landing/LHome";

import VideosPage from "./Learner/LPages/VideosPage";
import DashboardLayout1 from "./Learner/LComponents/Layouts/DashboardLayout";
import VideoPlayerPage from "./Learner/LPages/VideoPlayerPage";
import ChallengesPage from "./Learner/LPages/ChallengesPage";
//import SkillCodeZ from "./Learner/Pages/SkillCodeZ";
import PreferencesPage from "./Learner/LPages/PreferencesPage";
import AISummarizePage from "./Learner/LPages/AISummarizePage";
import RoadmapPage from "./Learner/LPages/RoadmapPage";
import EventsPage from "./Learner/LPages/EventsPage";
import MainCodeEditor from "./CodeEditor/MainCodeEditor";


import LAbout from "./Landing/LAbout";
import LContact from "./Landing/LContact";

import Admin from "./Admin/admin/Admin";
import AdminDashboard from "./Admin/admin/components/Dashboard";
import AdmiUserManagement from "./Admin/admin/components/UserManagement";
import ContentManagement from "./Admin/admin/components/ContentManagement";
import Settings from "./Admin/admin/components/Settings";
import Analytics from "./Admin/admin/components/Analytics";
import Support from "./Admin/admin/components/Support";
import Profile from "./Admin/admin/components/Profile";
import UserManagement from "./Admin/admin/components/UserManagement";
import { AddUserForm } from "./Admin/components/users/AddUserForm";
import ChatBot from "./chatbot/ChatBot";


const ProtectedRoute = ({ children, allowedRoles = [], layout: Layout }) => {
  const [user, setUser] = useState(null);

  const [loading, setLoading] = useState(true);



  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((authUser) => {
      if (authUser) {
        const userData = JSON.parse(localStorage.getItem("userData")) || {};
        setUser({
          ...authUser,
          role: userData.role || "learner",
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return (
      <Navigate
        to={user.role === "teacher" ? "/teacher/dashboard" : "/learner/videos"}
        replace
      />
    );
  }

  return <Layout>{children}</Layout>;
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setIsAuthenticated(user !== null);
    });
    return () => unsubscribe();
  }, []);

  if (isAuthenticated === null) return <div>Loading...</div>;

  return (
    <FirebaseProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route
            path="/home"
            element={
              isAuthenticated ? (
                <Navigate
                  to={
                    JSON.parse(localStorage.getItem("userData"))?.role ===
                      "admin"
                      ? "/admin/dashboard"
                      : JSON.parse(localStorage.getItem("userData"))?.role ===
                        "teacher"
                        ? "/teacher/dashboard"
                        : JSON.parse(localStorage.getItem("userData"))?.role ===
                          "learner"
                          ? "/learner/videos"
                          : "/home"
                  }
                  replace
                />
              ) : (
                <LHome />
              )
            }
          />
          <Route path="/home/about" element={<LAbout />} />
          <Route path="/home/contact" element={<LContact />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Teacher Protected Routes */}
          <Route
            element={
              <ProtectedRoute
                allowedRoles={["teacher"]}
                layout={DashboardLayout}
              >
                <Outlet />
              </ProtectedRoute>
            }
          >
            <Route path="/teacher/dashboard" element={<Dashboard />} />
            <Route path="/teacher/videos" element={<Videos />} />
            <Route path="/teacher/videos/:id" element={<VideoPlayer />} />

            <Route path="/teacher/upload-video" element={<UploadVideo />} />
            <Route path="/teacher/challenges" element={<Challenges />} />
            <Route
              path="/teacher/upload-challenge"
              element={<UploadChallenge />}
            />
            <Route path="/teacher/events" element={<EventsPage />} />
            <Route path="/teacher/host-event" element={<HostEvent />} />
          </Route>

          {/* Learner Protected Routes */}
          <Route
            element={
              <ProtectedRoute
                allowedRoles={["learner"]}
                layout={DashboardLayout1}
              >
                <Outlet />
              </ProtectedRoute>
            }
          >
            <Route path="/learner/videos" element={<VideosPage />} />
            <Route path="/learner/videos/:id" element={<VideoPlayerPage />} />
            <Route path="/learner/challenges" element={<ChallengesPage />} />

            <Route path="/learner/code-editor" element={<MainCodeEditor />} />
            {/* <Route path="learner/challenges/solve-challenge/:id" element={<SkillCodeZ />} /> */}
            <Route path="/learner/preferences" element={<PreferencesPage />} />
            <Route path="/learner/events" element={<EventsPage />} />
            <Route path="/learner/ai-summarize" element={<AISummarizePage />} />
            <Route path="/learner/roadmap" element={<RoadmapPage />} />
            <Route path="learner/chatbot" element={<ChatBot />} />
          </Route>

          {/* Admin Protected Routes */}
          <Route
            element={
              <ProtectedRoute allowedRoles={["admin"]} layout={Admin}>
                <Outlet />
              </ProtectedRoute>
            }
          >
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<UserManagement />} />
            <Route path="/admin/users/add" element={<AddUserForm />} />
            <Route path="/admin/content" element={<ContentManagement />} />
            <Route path="/admin/settings" element={<Settings />} />
            <Route path="/admin/analytics" element={<Analytics />} />
            <Route path="/admin/support" element={<Support />} />
            <Route path="/admin/profile" element={<Profile />} />
            <Route path="/admin/videos/:id" element={<VideoPlayer />} />
            <Route path="/admin/edit-video" element={<UploadVideo isAdminEdit={true} />} />
            <Route path="/admin/edit-challenge" element={<UploadChallenge isAdminEdit={true} />} />
            <Route path="/admin/edit-event" element={<HostEvent isAdminEdit={true} />} />
          </Route>

          {/* Default Redirects */}
          <Route
            path="/"
            element={
              <Navigate
                to={
                  isAuthenticated
                    ? JSON.parse(localStorage.getItem("userData"))?.role ===
                      "teacher"
                      ? "/teacher/dashboard"
                      : "/learner/videos"
                    : "/home"
                }
                replace
              />
            }
          />

          <Route
            path="*"
            element={
              <Navigate
                to={
                  isAuthenticated
                    ? JSON.parse(localStorage.getItem("userData"))?.role ===
                      "teacher"
                      ? "/teacher/dashboard"
                      : "/learner/videos"
                    : "/home"
                }
                replace
              />
            }
          />
        </Routes>
      </Router>
    </FirebaseProvider>
  );
}

export default App;

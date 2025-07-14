import React from "react";
import { Routes, Route } from "react-router-dom";
import Admin from "./Admin";
import Dashboard from "./components/Dashboard";
import UserManagement from "./components/UserManagement";
import ContentManagement from "./components/ContentManagement";
import Settings from "./components/Settings";
import Analytics from "./components/Analytics";
import Support from "./components/Support";
import Profile from "./components/Profile";
import VideoPlayer from "../../Teacher/TPages/VideoPlayer";

// This file contains all admin-related routes
// Copy these routes into your main App.jsx
const AdminRoutes = () => {
  return (
    <Routes>
      <Route path="/admin" element={<Admin />}>
        <Route index element={<Dashboard />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="content" element={<ContentManagement />} />
        <Route path="settings" element={<Settings />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="support" element={<Support />} />
        <Route path="profile" element={<Profile />} />
        <Route path="videos/:id" element={<VideoPlayer />} />
        <Route path="editContent" element={<VideoPlayer />} />
      </Route>
    </Routes>
  );
};

export default AdminRoutes;

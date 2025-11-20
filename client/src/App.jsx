import React, { useState } from "react";
import axios from "axios";
import "./styles/App.css";

import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import SearchAnime from "./pages/SearchAnime";
import Profile from "./pages/Profile";
import GoogleSuccess from "./pages/GoogleSuccess";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />

        <Routes>
          <Route path="/" element={<SearchAnime />} />

          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          <Route path="/google-success" element={<GoogleSuccess />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

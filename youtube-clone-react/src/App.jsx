import React, { useState } from "react";
import { Route, Routes } from "react-router-dom";
import Navbar from "./Components/Navbar/Navbar";
import Home from "./Pages/Home/Home";
import Video from "./Pages/Video/Video";
import AuthPage from "./Pages/AuthPage";
import ProfilePage from "./Pages/ProfilePage";
import { AuthProvider } from "./Components/AuthProvider";
import PrivateRoute from "./PrivatedRoute";
import SearchPage from "./Pages/SearchPage";

export const apiUrl = import.meta.env.VITE_API_URL;

const App = () => {
  const [sidebar, setSidebar] = useState(true);

  return (
    <AuthProvider>
      <Navbar setSidebar={setSidebar} />
      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route path="/login" element={<AuthPage />} />

        {/* 🔐 Protected Routes */}
        <Route
          path="/home"
          element={
            <PrivateRoute>
              <Home sidebar={sidebar} />
            </PrivateRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <ProfilePage />
            </PrivateRoute>
          }
        />
        <Route
          path="/home/video/:categoryId/:videoId"
          element={
            <PrivateRoute>
              <Video />
            </PrivateRoute>
          }
        />
        <Route path="/search/:query" element={<SearchPage />} />
      </Routes>
    </AuthProvider>
    
  );
};

export default App;

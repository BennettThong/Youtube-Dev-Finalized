// src/App.jsx

import React, { useState } from "react";
import { Route, Routes, useLocation } from "react-router-dom";

import Navbar from "./Components/Navbar/Navbar";
import Home from "./Pages/Home/Home";
import Video from "./Pages/Video/Video";
import AuthPage from "./Pages/AuthPage";
import ProfilePage from "./Pages/ProfilePage";
import PrivateRoute from "./PrivatedRoute";
import SearchPage from "./Pages/SearchPage";

export const apiUrl = import.meta.env.VITE_API_URL;

const App = () => {
  const [sidebar, setSidebar] = useState(true);
  const location = useLocation();

  const hideNavbar =
    location.pathname === "/" || location.pathname === "/login";

  return (
    <>
      {!hideNavbar && <Navbar setSidebar={setSidebar} />}

      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route path="/login" element={<AuthPage />} />

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

        <Route
          path="/search/:query"
          element={
            <PrivateRoute>
              <SearchPage />
            </PrivateRoute>
          }
        />
      </Routes>
    </>
  );
};

export default App;
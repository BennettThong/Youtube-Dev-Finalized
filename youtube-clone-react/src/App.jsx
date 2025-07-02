import React, { useState } from "react";
import { Route, Routes } from "react-router-dom"; // Import BrowserRouter
import Navbar from "./Components/Navbar/Navbar";
import Home from "./Pages/Home/Home";
import Video from "./Pages/Video/Video";
import useLocalStorage from "use-local-storage";
import AuthPage from "./Pages/AuthPage";
import ProfilePage from "./Pages/ProfilePage";
import { AuthProvider } from "./Components/AuthProvider";

export const apiUrl = import.meta.env.VITE_API_URL;



const App = () => {
  const [token, setToken] = useLocalStorage("token", null);
  const [sidebar, setSidebar] = useState(true);

  return (
    <AuthProvider>

      <Navbar setSidebar={setSidebar} />
      <Routes>
        <Route path="/" element={<AuthPage />} />

        <Route path="/home" element={<Home sidebar={sidebar} />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="home/video/:categoryId/:videoId" element={<Video />} />
      </Routes>

    </AuthProvider>
  );
};

export default App;


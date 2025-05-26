import React, { useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom"; // Import BrowserRouter
import Navbar from "./Components/Navbar/Navbar";
import Home from "./Pages/Home/Home";
import Video from "./Pages/Video/Video";
import useLocalStorage from "use-local-storage";
import AuthPage from "./Pages/AuthPage";
import ProfilePage from "./Pages/ProfilePage";
import { AuthProvider } from "./Components/AuthProvider";
import store from "./store";
import { Provider } from "react-redux";

const App = () => {
  const [token, setToken] = useLocalStorage("token", null);
  const [sidebar, setSidebar] = useState(true);

  return (
    <AuthProvider>
      <Provider store={store}>
          <Navbar setSidebar={setSidebar} />
          <Routes>
            <Route path="/" element={<Home sidebar={sidebar} />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/login" element={<AuthPage />} />
            <Route path="/video/:categoryId/:videoId" element={<Video />} />
          </Routes>
      </Provider>
    </AuthProvider>
  );
};

export default App;


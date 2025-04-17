import React, { useState } from "react";
import Navbar from "./Components/Navbar/Navbar";
import { Route, Routes } from "react-router-dom";
import Home from "./Pages/Home/Home";
import Video from "./Pages/Video/Video";
import { AuthContext } from "./AuthContext";
import RequireAuth from "./Components/Authorization/RequireAuth";
import useLocalStorage from "use-local-storage";
import Login from "./Pages/Login";

const App = () => {
  const [token, setToken] = useLocalStorage("token", null);
  const authContextValue = { token, setToken };
  const [sidebar, setSidebar] = useState(true);

  return (
    <AuthContext.Provider value={authContextValue}>
      <Navbar setSidebar={setSidebar} />
      <Routes>
        <Route
          path="/"
          element={
            <RequireAuth>
              <Home sidebar={sidebar} />
            </RequireAuth>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route
          path="/video/:categoryId/:videoId"
          element={
            <RequireAuth>
              <Video />
            </RequireAuth>
          }
        />
      </Routes>
    </AuthContext.Provider>
  );
};

export default App;
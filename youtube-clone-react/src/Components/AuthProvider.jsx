import { createContext, useEffect, useState } from "react";
import { auth } from "../firebase.js";
import { jwtDecode } from "jwt-decode";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [authSource, setAuthSource] = useState(null); // "firebase" | "jwt" | null
  const [profileImage, setProfileImage] = useState(localStorage.getItem("profileImage") || "");
  const [loading, setLoading] = useState(true);

  // ✅ Manual reset function to clear auth state (useful in logout)
  const resetAuth = () => {
    setCurrentUser(null);
    setAuthSource(null);
    localStorage.removeItem("backendAuthToken");
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        setCurrentUser(firebaseUser);
        setAuthSource("firebase");
      } else {
        const token = localStorage.getItem("backendAuthToken");

        // ✅ Check for valid JWT format before decoding
        if (token && token !== "null" && token.split(".").length === 3) {
          try {
            const decoded = jwtDecode(token);
            setCurrentUser(decoded);
            setAuthSource("jwt");
          } catch (err) {
            console.warn("⚠️ Failed to decode JWT:", err.message);
            localStorage.removeItem("backendAuthToken");
            setCurrentUser(null);
            setAuthSource(null);
          }
        } else {
          if (token) {
            console.warn("⚠️ Invalid token format, clearing backendAuthToken");
            localStorage.removeItem("backendAuthToken");
          }
          setCurrentUser(null);
          setAuthSource(null);
        }
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        authSource,
        profileImage,
        setProfileImage,
        resetAuth, // ✅ exposed to be used in ProfilePage or anywhere else
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
}

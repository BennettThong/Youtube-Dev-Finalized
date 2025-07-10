import { createContext, useEffect, useState } from "react";
import { auth } from "../firebase.js";
import { jwtDecode } from "jwt-decode";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [authSource, setAuthSource] = useState(null); // "firebase" | "jwt" | null
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        // ✅ Firebase login
        setCurrentUser(firebaseUser);
        setAuthSource("firebase");
        setLoading(false);
      } else {
        // ✅ Fallback to backend JWT
        const token = localStorage.getItem("backendAuthToken");

        if (token) {
          try {
            // ✅ Validate token structure: must be 3-part JWT
            if (token.split(".").length !== 3) {
              throw new Error("Invalid JWT format");
            }

            const decoded = jwtDecode(token);
            setCurrentUser(decoded);
            setAuthSource("jwt");
          } catch (err) {
            console.warn("⚠️ Invalid token, clearing backendAuthToken:", err.message);
            localStorage.removeItem("backendAuthToken");
            setCurrentUser(null);
            setAuthSource(null);
          }
        } else {
          setCurrentUser(null);
          setAuthSource(null);
        }

        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, authSource }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

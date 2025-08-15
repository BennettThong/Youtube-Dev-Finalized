import { createContext, useEffect, useState } from "react";
import { auth } from "../firebase.js";
import { onAuthStateChanged } from "firebase/auth";
import { jwtDecode } from "jwt-decode";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [authSource, setAuthSource] = useState(null); // "firebase" | "jwt" | null
  const [profileImage, setProfileImage] = useState(
    typeof window !== "undefined" ? localStorage.getItem("profileImage") || "" : ""
  );
  const [loading, setLoading] = useState(true);

  const fallbackAvatar =
    "https://ui-avatars.com/api/?name=Bennett+Thong";

  // ✅ Manual reset for logout (do NOT clear profileImage to keep last avatar while logged out)
  const resetAuth = () => {
    setCurrentUser(null);
    setAuthSource(null);
    localStorage.removeItem("backendAuthToken");
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          // Ensure we have the freshest profile (e.g., after upload)
          try {
            await firebaseUser.reload();
          } catch (_) {}

          setCurrentUser(firebaseUser);
          setAuthSource("firebase");

          // Prefer your uploaded Auth photoURL, then cached, then Google provider, then fallback
          const url =
            firebaseUser.photoURL ||
            localStorage.getItem("profileImage") ||
            firebaseUser.providerData?.[0]?.photoURL ||
            fallbackAvatar;

          setProfileImage(url);
          localStorage.setItem("profileImage", url);
        } else {
          // Not signed into Firebase → maybe backend JWT is present
          const token = localStorage.getItem("backendAuthToken");

          if (token && token !== "null" && token.split(".").length === 3) {
            try {
              const decoded = jwtDecode(token);
              setCurrentUser(decoded);
              setAuthSource("jwt");
            } catch {
              localStorage.removeItem("backendAuthToken");
              setCurrentUser(null);
              setAuthSource(null);
            }
          } else {
            setCurrentUser(null);
            setAuthSource(null);
          }

          // Keep showing last known avatar while logged out
          const last = localStorage.getItem("profileImage");
          setProfileImage(last || fallbackAvatar);
        }
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        authSource,
        profileImage,     // ← use this in your navbar small icon
        setProfileImage,  // you can still update it after uploads
        resetAuth,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
}

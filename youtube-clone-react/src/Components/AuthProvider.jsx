// src/Components/AuthProvider.jsx

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { auth } from "../firebase.js";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { jwtDecode } from "jwt-decode";


export const AuthContext = createContext(null);

const fallbackAvatar = "https://ui-avatars.com/api/?name=Bennett+Thong";

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authSource, setAuthSource] = useState(null); // "firebase" | "jwt" | null
  const [profileImage, setProfileImage] = useState(() => {
    if (typeof window === "undefined") return fallbackAvatar;

    return localStorage.getItem("profileImage") || fallbackAvatar;
  });

  const resetAuth = ({ clearAvatar = true } = {}) => {
    setCurrentUser(null);
    setAuthSource(null);

    localStorage.removeItem("backendAuthToken");

    if (clearAvatar) {
      localStorage.removeItem("profileImage");
      setProfileImage(fallbackAvatar);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setAuthLoading(true);

      try {
        if (firebaseUser) {
          try {
            await firebaseUser.reload();
          } catch (error) {
            console.warn("Firebase user reload failed:", error);
          }

          const token = await firebaseUser.getIdToken();
          localStorage.setItem("backendAuthToken", token);

          setCurrentUser(firebaseUser);
          setAuthSource("firebase");

          const url =
            firebaseUser.photoURL ||
            firebaseUser.providerData?.[0]?.photoURL ||
            localStorage.getItem("profileImage") ||
            fallbackAvatar;

          setProfileImage(url);
          localStorage.setItem("profileImage", url);

          return;
        }

        const token = localStorage.getItem("backendAuthToken");

        if (token && token !== "null" && token.split(".").length === 3) {
          try {
            const decoded = jwtDecode(token);

            setCurrentUser(decoded);
            setAuthSource("jwt");

            const decodedAvatar =
              decoded?.photoURL || decoded?.avatarUrl || fallbackAvatar;

            setProfileImage(decodedAvatar);

            if (decodedAvatar !== fallbackAvatar) {
              localStorage.setItem("profileImage", decodedAvatar);
            }

            return;
          } catch (error) {
            console.warn("Invalid backend token:", error);
            resetAuth({ clearAvatar: true });
            return;
          }
        }

        resetAuth({ clearAvatar: true });
      } finally {
        setAuthLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const signOutFirebase = async () => {
    setAuthLoading(true);

    try {
      await signOut(auth);
    } finally {
      resetAuth({ clearAvatar: true });
      setAuthLoading(false);
    }
  };

  const value = useMemo(
    () => ({
      currentUser,
      authLoading,
      authSource,
      profileImage,
      setProfileImage,
      resetAuth,
      signOutFirebase,
      isAuthenticated: !!currentUser,
    }),
    [currentUser, authLoading, authSource, profileImage]
  );

  if (authLoading) {
    return <p>Loading...</p>;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
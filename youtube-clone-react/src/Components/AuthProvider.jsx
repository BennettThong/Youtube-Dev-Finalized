import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { auth } from "../firebase.js";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { jwtDecode } from "jwt-decode";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [authSource, setAuthSource] = useState(null); // "firebase" | "jwt" | null
  const [profileImage, setProfileImage] = useState(
    typeof window !== "undefined" ? localStorage.getItem("profileImage") || "" : ""
  );
  const [loading, setLoading] = useState(true);

  // Change this if you want a different default avatar
  const fallbackAvatar = "https://ui-avatars.com/api/?name=Bennett+Thong";

  // ✅ Explicit, immediate cleanup for logout
  const resetAuth = ({ clearAvatar = true } = {}) => {
    setCurrentUser(null);
    setAuthSource(null);
    localStorage.removeItem("backendAuthToken");
    if (clearAvatar) {
      localStorage.removeItem("profileImage");
      setProfileImage(fallbackAvatar); // instant UI swap to default
    }
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          // Keep profile fresh after uploads
          try { await firebaseUser.reload(); } catch {}

          setCurrentUser(firebaseUser);
          setAuthSource("firebase");

          const url =
            firebaseUser.photoURL ||
            localStorage.getItem("profileImage") ||
            firebaseUser.providerData?.[0]?.photoURL ||
            fallbackAvatar;

          setProfileImage(url);
          localStorage.setItem("profileImage", url);
        } else {
          // Not signed into Firebase → try backend JWT, else clear to fallback
          const token = localStorage.getItem("backendAuthToken");
          if (token && token !== "null" && token.split(".").length === 3) {
            try {
              const decoded = jwtDecode(token);
              setCurrentUser(decoded);
              setAuthSource("jwt");

              // Use avatar from JWT if present; otherwise fallback
              const decodedAvatar =
                (decoded && (decoded.photoURL || decoded.avatarUrl)) || null;
              if (decodedAvatar) {
                setProfileImage(decodedAvatar);
                localStorage.setItem("profileImage", decodedAvatar);
              } else {
                setProfileImage(fallbackAvatar);
              }
            } catch {
              localStorage.removeItem("backendAuthToken");
              setCurrentUser(null);
              setAuthSource(null);
              setProfileImage(fallbackAvatar);
            }
          } else {
            setCurrentUser(null);
            setAuthSource(null);
            setProfileImage(fallbackAvatar); // ← don't keep last avatar while logged out
          }
        }
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, []);

  // Helper to use in buttons: signs out from Firebase, then hard-resets UI
  const signOutFirebase = async () => {
    try {
      await signOut(auth);
    } finally {
      resetAuth({ clearAvatar: true });
    }
  };

  const value = useMemo(
    () => ({
      currentUser,
      authSource,
      profileImage,     // ← read this in your navbar
      setProfileImage,  // ← update after successful upload
      resetAuth,
      signOutFirebase,
    }),
    [currentUser, authSource, profileImage]
  );

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

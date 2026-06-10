import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "./Components/AuthProvider";

export default function PrivateRoute({ children }) {
  const { currentUser, authLoading } = useContext(AuthContext);

  // Wait until Firebase/JWT auth check is finished
  if (authLoading) {
    return null;
    // or return <div>Loading...</div>;
  }

  // Only redirect after auth check is complete
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  } 

  return children;
}
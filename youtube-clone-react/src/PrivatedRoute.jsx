import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "./Components/AuthProvider";

export default function PrivateRoute({ children }) {
  const { currentUser } = useContext(AuthContext);

  if (currentUser === null) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

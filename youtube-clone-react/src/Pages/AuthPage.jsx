// src/Pages/AuthPage.jsx

import { Button, Col, Image, Row } from "react-bootstrap";
import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../Components/AuthProvider";
import { GoogleAuthProvider, getAuth, signInWithPopup } from "firebase/auth";

export default function AuthPage() {
  const loginImage =
    "https://i.postimg.cc/76XCk3Gk/original-0096017bd6b73372156147b678984ec5.webp";

  const auth = getAuth();
  const provider = new GoogleAuthProvider();
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);

  useEffect(() => {
    if (currentUser) {
      navigate("/home");
    }
  }, [currentUser, navigate]);

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const token = await result.user.getIdToken();
      localStorage.setItem("backendAuthToken", token);
      navigate("/home");
    } catch (error) {
      console.error("Google login failed:", error.message);
      alert("Google login failed");
    }
  };

  return (
    <Row>
      <Col sm={6}>
        <Image src={loginImage} fluid />
      </Col>

      <Col sm={6} className="p-4">
        <i className="bi bi-youtube" style={{ fontSize: 50, color: "red" }} />

        <p className="mt-5" style={{ fontSize: 64 }}>
          Happening Now
        </p>

        <h2 className="my-5" style={{ fontSize: 31 }}>
          Join Youtube today.
        </h2>

        <Col sm={5} className="d-grid gap-2">
          <Button
            className="rounded-pill"
            variant="outline-dark"
            onClick={handleGoogleLogin}
          >
            <i className="bi bi-google" /> Sign in with Google
          </Button>
        </Col>
      </Col>
    </Row>
  );
}

import { Button, Col, Image, Row, Modal, Form } from "react-bootstrap";
import { useContext, useEffect, useState } from "react";
import axios from "axios";
import useLocalStorage from "use-local-storage";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { AuthContext } from "../Components/AuthProvider";
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  getAuth,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";

const apiUrl = import.meta.env.VITE_API_URL; // ✅ dynamic backend URL

export default function AuthPage() {
  const loginImage =
    "https://i.postimg.cc/76XCk3Gk/original-0096017bd6b73372156147b678984ec5.webp";

  const [modalShow, setModalShow] = useState(null); // null | "Login" | "SignUp"
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [authToken, setAuthToken] = useLocalStorage("authToken", "");
  const auth = getAuth();
  const provider = new GoogleAuthProvider();
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);

  useEffect(() => {
    if (authToken) {
      navigate("/home");
    }
  }, [authToken, navigate]);

  const handleGoogleLogin = async (e) => {
    e.preventDefault();
    try {
      const result = await signInWithPopup(auth, provider);
      console.log("✅ Google login success", result.user);

      const token = await result.user.getIdToken();
      localStorage.setItem("authToken", token);

      navigate("/home");
    } catch (error) {
      console.error("❌ Google login error:", error.message);
      alert("Google login failed: " + error.message);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${apiUrl}/signup`, {
        username,
        password,
      });
      console.log("✅ Signup success:", res.data);
      alert("Account created successfully!");
    } catch (error) {
      if (error.response) {
        console.error("❌ Signup failed:", error.response.data);
        alert(error.response.data.error || "Signup failed");
      } else if (error.request) {
        console.error("❌ No response from server:", error.request);
        alert("No response from the server. Check connection or backend.");
      } else {
        console.error("❌ Signup error:", error.message);
        alert("Unexpected error: " + error.message);
      }
    }

    try {
      const res = await createUserWithEmailAndPassword(auth, username, password);
      console.log(res.user);
    } catch (error) {
      console.error(error);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(`${apiUrl}/login`, {
        username,
        password,
      });

      if (res.data?.auth && res.data?.token) {
        setAuthToken(res.data.token);

        try {
          const decoded = jwtDecode(res.data.token);
          console.log("🧠 Logged in user (Backend):", decoded);
        } catch (decodeErr) {
          console.warn("⚠️ Token could not be decoded:", decodeErr.message);
        }

        return;
      }
    } catch (error) {
      console.warn("⚠️ Backend login failed, trying Firebase...");
    }

    try {
      await signInWithEmailAndPassword(auth, username, password);
      console.log("✅ Firebase login success");
      const token = await auth.currentUser.getIdToken();
      setAuthToken(token);
    } catch (firebaseErr) {
      console.error("❌ Firebase login failed:", firebaseErr.message);
      alert("Login failed with both methods. Check credentials.");
    }
  };

  const handleShowSignUp = () => setModalShow("SignUp");
  const handleShowLogin = () => setModalShow("Login");
  const handleClose = () => setModalShow(null);

  return (
    <Row>
      <Col sm={6}>
        <Image src={loginImage} fluid />
      </Col>
      <Col sm={6} className="p-4">
        <i className="bi bi-twitter" style={{ fontSize: 50, color: "dodgerblue" }}></i>

        <p className="mt-5" style={{ fontSize: 64 }}>Happening Now</p>
        <h2 className="my-5" style={{ fontSize: 31 }}>Join Twitter today.</h2>

        <Col sm={5} className="d-grid gap-2">
          <Button className="rounded-pill" variant="outline-dark" onClick={handleGoogleLogin}>
            <i className="bi bi-google"></i> Sign up with Google
          </Button>
          <Button className="rounded-pill" variant="outline-dark">
            <i className="bi bi-apple"></i> Sign up with Apple
          </Button>
          <p style={{ textAlign: "center" }}>or</p>
          <Button className="rounded-pill" onClick={handleShowSignUp}>
            Create an account
          </Button>
          <p style={{ fontSize: "12px" }}>
            By signing up, you agree to the Terms of Service and Privacy Policy, including Cookie Use.
          </p>

          <p className="mt-5" style={{ fontWeight: "bold" }}>Already have an account?</p>
          <Button className="rounded-pill" variant="outline-primary" onClick={handleShowLogin}>
            Sign in
          </Button>
        </Col>

        <Modal show={modalShow !== null} onHide={handleClose} animation={false} centered>
          <Modal.Body>
            <h2 className="mb-4" style={{ fontWeight: "bold" }}>
              {modalShow === "SignUp" ? "Create your account" : "Log in to your account"}
            </h2>

            <Form
              className="d-grid gap-2 px-5"
              onSubmit={modalShow === "SignUp" ? handleSignUp : handleLogin}
            >
              <Form.Group className="mb-3" controlId="formBasicEmail">
                <Form.Control
                  onChange={(e) => setUsername(e.target.value)}
                  type="email"
                  placeholder="Enter username"
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="formBasicPassword">
                <Form.Control
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  placeholder="Password"
                />
              </Form.Group>

              <p style={{ fontSize: "12px" }}>
                By signing up, you agree to the Terms of Service and Privacy Policy, including Cookie Use.
              </p>

              <Button className="rounded-pill" type="submit">
                {modalShow === "SignUp" ? "Sign up" : "Log in"}
              </Button>
            </Form>
          </Modal.Body>
        </Modal>
      </Col>
    </Row>
  );
}

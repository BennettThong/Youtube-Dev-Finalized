import {
    GoogleAuthProvider,
    createUserWithEmailAndPassword,
    getAuth,
    signInWithEmailAndPassword,
    signInWithPopup,
  } from "firebase/auth";
  import { useContext, useState } from "react";
  import { Button, Col, Form, Image, Modal, Row } from "react-bootstrap";
  import { AuthContext } from "../components/AuthProvider";
  import { useNavigate } from "react-router-dom";

  export default function AuthPage() {
    const loginImage = "https://i.postimg.cc/76XCk3Gk/original-0096017bd6b73372156147b678984ec5.webp";
    // values: null (no modal show), "login", "signup"
    const [modalShow, setModalShow] = useState(null);
    const handleShowSignUp = () => setModalShow("signup");
    const handleShowLogin = () => setModalShow("login");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const auth = getAuth();
    const navigate = useNavigate();
    const { currentUser } = useContext(AuthContext);
    const provider = new GoogleAuthProvider();

    if (currentUser) navigate("/");

    const handleSignUp = async (e) => {
      e.preventDefault();
      try {
        const res = await createUserWithEmailAndPassword(
          auth,
          username,
          password
        );
        console.log(res.user);
      } catch (error) {
        console.error(error);
      }
    };
    const handleLogin = async (e) => {
      e.preventDefault();
      try {
        await signInWithEmailAndPassword(auth, username, password);
      } catch (error) {
        console.error(error);
      }
    };
    const handleGoogleLogin = async (e) => {
      e.preventDefault();
      try {
        await signInWithPopup(auth, provider);
      } catch (error) {
        console.error(error);
      }
    };

    const handleClose = () => setModalShow(null);

    return (
      <Row>
        <Col sm={6}>
          <Image src={loginImage} fluid />
        </Col>
        <Col sm={6} className="p-4">
          <i
            className="bi bi-youtube"
            style={{ fontSize: 50, color: "red" }}
          ></i>

          <p className="mt-5" style={{ fontSize: 64 }}>
            Youtube Premium
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
              <i className="bi bi-google"></i> Sign up with Google
            </Button>
            <Button className="rounded-pill" variant="outline-dark">
              <i className="bi bi-apple"></i> Sign up with Apple
            </Button>
            <p style={{ textAlign: "center" }}>or</p>
            <Button className="rounded-pill" onClick={handleShowSignUp}>
              Create an account
            </Button>
            <p style={{ fontSize: "12px" }}> Agree to terms</p>
            <p className="mt-5" style={{ fontWeight: "bold" }}>
              Already have an account?
            </p>
            <Button
              className="rounded-pill"
              variant="outline-primary"
              onClick={handleShowLogin}
            >
              Sign in
            </Button>
          </Col>
          <Modal
            show={modalShow !== null}
            onHide={handleClose}
            animation={false}
            centered
          >
            <Modal.Body>
              <h2 className="mb-4" style={{ fontWeight: "bold" }}>
                {modalShow === "signup"
                  ? "Create your account"
                  : "Log in to your account"}
              </h2>

              <Form
                className="d-grid gap-2 px-5"
                onSubmit={modalShow === "signup" ? handleSignUp : handleLogin}
              >
                <Form.Group className="mb-3" controlId="formBasicEmai">
                  <Form.Control
                    onChange={(e) => setUsername(e.target.value)}
                    type="email"
                    placeholder="Enter email"
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formBasicPassword">
                  <Form.Control
                    onChange={(e) => setPassword(e.target.value)}
                    type="password"
                    placeholder="Password"
                  />
                </Form.Group>

                <p style={{ fontSize: 12 }}>
                  By signing up, you agree to the Terms of Service and Privacy

                </p>
                <Button className="rounded-pill" type="submit">
                  {modalShow === "signup" ? "Sign up" : "Log in"}
                </Button>
              </Form>
            </Modal.Body>
          </Modal>
        </Col>
      </Row>
    );
  }

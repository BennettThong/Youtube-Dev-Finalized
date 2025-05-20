import { Button, Col, Image, Row, Modal, Form } from "react-bootstrap";
import { useState } from "react";
import axios from "axios";

export default function AuthPage() {
    const loginImage = "https://i.postimg.cc/TPmt6k9W/original-0096017bd6b73372156147b678984ec5.webp";
    const url = "http://localhost:5000/";

    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    // Define the handleSignUp function
    const handleSignUp = async (e) => {
        e.preventDefault(); // Prevent the default form submission behavior
        try {
            const response = await axios.post(`${url}/signup`, {
                username,
                password,
            });
            console.log("Sign-up successful:", response.data);
            alert("Sign-up successful!");
            handleClose(); // Close the modal after successful sign-up
        } catch (error) {
            console.error("Error during sign-up:", error);
            alert("Sign-up failed. Please try again.");
        }
    };

    return (
        <Row>
            <Col sm={6}>
                <Image src={loginImage} fluid />
            </Col>
            <Col sm={6} className="p-4">
                <i className="bi bi-youtube" style={{ fontSize: 50, color: "red" }}></i>
                <p className="mt-5" style={{ fontSize: 64 }}>Youtube Premium </p>
                <h2 className="my-5" style={{ fontSize: 31 }}>Join Youtube Today.</h2>
                <Col sm={5} className="d-grid gap-2">
                    <Button className="rounded-pill" variant="outline-dark">
                        <i className="bi bi-google"></i> Sign up with Google
                    </Button>
                    <Button className="rounded-pill" variant="outline-dark">
                        <i className="bi bi-apple"></i> Sign up with Apple
                    </Button>
                    <p style={{ textAlign: "center" }}>or</p>
                    <Button className="rounded-pill" onClick={handleShow}>
                        Create an account
                    </Button>
                    <p style={{ fontSize: "12px" }}>
                        By signing up, you agree to the Terms of Service and Privacy Policy including Cookie Use.
                    </p>
                    <p className="mt-5" style={{ fontWeight: "bold" }}>
                        Already have an account?
                    </p>
                    <Button className="rounded-pill" variant="outline-primary">Sign In</Button>
                </Col>
                <Modal show={show} onHide={handleClose} centered>
                    <Modal.Body>
                        <h2 className="mb-4" style={{ fontWeight: "bold" }}>
                            Create your account
                        </h2>
                        <Form className="d-grid gap-2 px-5" onSubmit={handleSignUp}>
                            <Form.Group className="mb-3" controlId="formBasicEmail">
                                <Form.Control
                                    onChange={(e) => setUsername(e.target.value)}
                                    type="text"
                                    placeholder="Enter username"
                                />
                            </Form.Group>
                            <Form.Group className="mb-3" controlId="formBasicEmail">
                                <Form.Control type="email" placeholder="Enter email" />
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
                            <Button className="rounded-pill" type="submit">Sign up </Button>
                        </Form>
                    </Modal.Body>
                </Modal>
            </Col>
        </Row>
    );
}


import { useEffect, useContext, useState } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../AuthContext";
import AuthPage from "./AuthPage";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const authContext = useContext(AuthContext);



  function login() {
    if (username === "bennett@gmail.com" && password === "1234") {
      authContext.setToken("1234");
      navigate("/");
    }
  }

  return (
    <Container>
      <AuthPage />
      <h1 className="my-3">Login to your account</h1>
      <Form onSubmit={e => { e.preventDefault(); login(); }}>
        <Form.Group className="mb-3" controlId="username">
          <Form.Label>Email address</Form.Label>
          <Form.Control
            type="email"
            placeholder="name@example.com"
            value={username}
            onChange={e => setUsername(e.target.value)}
          />
          <Form.Text muted>We never share email with anyone else</Form.Text>
        </Form.Group>
        <Form.Group className="mb-3" controlId="password">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        </Form.Group>
        <Button type="submit">Login</Button>
      </Form>
    </Container>
  );
}

import "../css/login.css";
import { useState, useRef } from "react";
import { registerUser } from "../../backend/auth-service";

const Register = () => {
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const usernameRef = useRef(null);

  const handleRegister = async () => {
    const email = emailRef.current.value;
    const password = passwordRef.current.value;
    const username = usernameRef.current.value;

    const response = await registerUser(email, username, password);
    if (response.status) {
      alert("Registration successful!");
    } else {
      alert(`Registration failed: ${response.error}`);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Join Teleflix!</h2>
        <input
          type="text"
          name="username"
          placeholder="Username"
          ref={usernameRef}
          required
        ></input>
        <input
          type="text"
          name="email"
          placeholder="Email"
          ref={emailRef}
          required
        ></input>
        <input
          type="password"
          name="password"
          placeholder="Password"
          data-type="password"
          ref={passwordRef}
          required
        ></input>
        <button
          className="submit-button"
          type="submit"
          onClick={handleRegister}
        >
          Register
        </button>
      </div>
    </div>
  );
};

export default Register;

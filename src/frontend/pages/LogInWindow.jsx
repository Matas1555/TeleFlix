import "../css/login.css";
import { useRef, useState } from "react";
import { loginUser } from "../../backend/controllers/authController";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const isPasswordValid = (password) => {
    return password.length >= 6;
  };

  const isEmailValid = (email) => {
    // Regular expression for basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleLogin = async () => {
    const email = emailRef.current.value;
    const password = passwordRef.current.value;

    if (!isEmailValid(email)) {
      console.log("Email is bad!");
      alert("Email is bad!");
      return;
    }

    if (!isPasswordValid(password)) {
      console.log("Password too short!");
      alert("Password must be over 6 characters long");
      return;
    }

    const response = await loginUser(email, password);
    if (response.status) {
      setIsLoggedIn(true);
      localStorage.setItem("token", response.token); 
      navigate("/");
      console.log("Logged in successfully");
    } else {
      console.log("Failed to login");
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Login</h2>
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
          ref={passwordRef}
          required
        ></input>
        <div>
          <p>
            <input type="checkbox" />Remember Me
          </p>
        </div>
        <button className="submit-button" type="submit" onClick={handleLogin}>
          Login
        </button>
      </div>
    </div>
  );
};

export default Login;
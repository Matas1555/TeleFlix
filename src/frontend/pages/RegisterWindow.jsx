import React, { useState, useRef } from "react";
import ReactDOM from "react-dom";
import "../css/login.css";
import { registerUser } from "../../backend/controllers/authController";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const navigate = useNavigate();
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const usernameRef = useRef(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const isPasswordValid = (password) => {
    return password.length >= 6;
  };

  const isEmailValid = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isUsernameValid = (username) => {
    return username.length >= 3 && username.length <= 20;
  };

  const validateForm = () => {
    const email = emailRef.current.value;
    const password = passwordRef.current.value;
    const username = usernameRef.current.value;
    const newErrors = {};

    if (!username) {
      newErrors.username = "Username is required";
    } else if (!isUsernameValid(username)) {
      newErrors.username = "Username must be between 3 and 20 characters";
    }

    if (!email) {
      newErrors.email = "Email is required";
    } else if (!isEmailValid(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (!isPasswordValid(password)) {
      newErrors.password = "Password must be at least 6 characters long";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      const email = emailRef.current.value;
      const password = passwordRef.current.value;
      const username = usernameRef.current.value;

      const response = await registerUser(email, username, password);
      if (response.status) {
        navigate("/login");
        console.log("Registration successful!");
      } else {
        setErrors({ general: response.error || "Registration failed. Please try again." });
      }
    } catch (error) {
      setErrors({ general: "An error occurred. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleRegister();
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">Join TeleFlix</h1>
          <p className="auth-subtitle">Create your account to start watching together</p>
        </div>

        <div className="auth-form">
          <div className="input-group">
            <label className="input-label">Username</label>
            <div className="input-wrapper">
              <input
                type="text"
                name="username"
                placeholder="Choose a username"
                ref={usernameRef}
                className={`auth-input ${errors.username ? 'error' : ''}`}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
              />
              <div className="input-focus-border"></div>
            </div>
            {errors.username && <span className="error-message">{errors.username}</span>}
          </div>

          <div className="input-group">
            <label className="input-label">Email</label>
            <div className="input-wrapper">
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                ref={emailRef}
                className={`auth-input ${errors.email ? 'error' : ''}`}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
              />
              <div className="input-focus-border"></div>
            </div>
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

          <div className="input-group">
            <label className="input-label">Password</label>
            <div className="input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Create a password"
                ref={passwordRef}
                className={`auth-input ${errors.password ? 'error' : ''}`}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
              <div className="input-focus-border"></div>
            </div>
            {errors.password && <span className="error-message">{errors.password}</span>}
          </div>

          {errors.general && (
            <div className="general-error">
              {errors.general}
            </div>
          )}

          <button 
            className={`auth-button ${isLoading ? 'loading' : ''}`}
            onClick={handleRegister}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="loading-spinner"></span>
            ) : (
              'Create Account'
            )}
          </button>
        </div>

        <div className="auth-footer">
          <p className="auth-footer-text">
            Already have an account?{' '}
            <a href="/login" className="auth-link">
              Sign in here
            </a>
          </p>
        </div>
      </div>

      {/* Background Animation */}
      <div className="background-animation">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="gradient-orb orb-3"></div>
      </div>
    </div>
  );
};

export default Register;

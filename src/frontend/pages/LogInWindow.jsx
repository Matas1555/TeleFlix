import React, { useState, useRef } from 'react'
import ReactDOM from 'react-dom'
import "../css/login.css";
import { loginUser } from "../../backend/controllers/authController";
import { useNavigate } from "react-router-dom";
import { useAuth } from '../../authContext';

const Login = () => {
  const navigate = useNavigate();
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const { login } = useAuth();
  
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

  const validateForm = () => {
    const email = emailRef.current.value;
    const password = passwordRef.current.value;
    const newErrors = {};

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

  const handleLogin = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      const email = emailRef.current.value;
      const password = passwordRef.current.value;

      const response = await loginUser(email, password, login);
      if (response.status) {
        navigate("/");
        console.log("Logged in successfully");
      } else {
        setErrors({ general: "Invalid email or password" });
      }
    } catch (error) {
      setErrors({ general: "An error occurred. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-subtitle">Sign in to your TeleFlix account</p>
        </div>

        <div className="auth-form">
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
                placeholder="Enter your password"
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
            onClick={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="loading-spinner"></span>
            ) : (
              'Sign In'
            )}
          </button>
        </div>

        <div className="auth-footer">
          <p className="auth-footer-text">
            Don't have an account?{' '}
            <a href="/register" className="auth-link">
              Sign up here
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

export default Login;

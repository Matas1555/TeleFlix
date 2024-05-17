import React, { createContext, useState, useContext, useEffect } from "react";
import Cookies from "js-cookie";
import { loginUser as loginUserFirebase } from "./backend/controllers/authController";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true); // Add loading state

  useEffect(() => {
    const storedUser = Cookies.get("currentUser");
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    setLoading(false); // Set loading to false after user is fetched
  }, []);

  useEffect(() => {
    if (currentUser) {
      Cookies.set("currentUser", JSON.stringify(currentUser), { expires: 7 });
    }
  }, [currentUser]);

  const login = async (email, password) => {
    try {
      setCurrentUser({ email: email }); // Example to set more comprehensive user data
      return { status: true };
    } catch (error) {
      console.error("Error logging in:", error.message);
      return { status: false, error: error.message };
    }
  };

  const logout = () => {
    setCurrentUser(null);
    Cookies.remove("currentUser");
  };

  if (loading) {
    return <div>Loading...</div>; // Render loading state
  }

  return (
    <AuthContext.Provider value={{ currentUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

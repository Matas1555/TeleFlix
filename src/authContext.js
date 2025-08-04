import React, { createContext, useState, useContext, useEffect } from "react";
import Cookies from "js-cookie";
import { auth } from "./backend/controllers/firebase-config";
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen for Firebase auth state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user.email);
        Cookies.set("currentUser", user.email, { expires: 7 });
      } else {
        setCurrentUser(null);
        Cookies.remove("currentUser");
      }
      setLoading(false);
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setCurrentUser(userCredential.user.email);
      return { status: true };
    } catch (error) {
      console.error("Error logging in:", error.message);
      return { status: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      Cookies.remove("currentUser");
      return { status: true };
    } catch (error) {
      console.error("Error logging out:", error.message);
      return { status: false, error: error.message };
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ currentUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

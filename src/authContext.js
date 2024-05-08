import React, { createContext, useState, useContext, useEffect } from 'react';
import Cookies from 'js-cookie';
import { loginUser as loginUserFirebase } from './backend/controllers/authController';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // Retrieve currentUser from cookie on component mount
    const storedUser = Cookies.get('currentUser');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
  }, []);

  // Persist state to cookie whenever it changes
  useEffect(() => {
    // Check if currentUser is not null before setting the cookie
    if (currentUser !== null) {
      Cookies.set('currentUser', JSON.stringify(currentUser), { expires: 7 }); // Set cookie to expire in 7 days
    }
  }, [currentUser]);

  const login = async (email, password) => {
    try {
      setCurrentUser(email); // Set the current user to the email or any other identifier you prefer
      return { status: true };
    } catch (error) {
      console.error('Error logging in:', error.message);
      return { status: false, error: error.message };
    }
  };

  const logout = () => {
    setCurrentUser(null);
    Cookies.remove('currentUser'); // Remove the currentUser cookie on logout
    // Other logout logic if needed
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

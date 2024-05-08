import { auth, db } from "./firebase-config";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { signInWithEmailAndPassword } from "firebase/auth";
import { addDoc, collection, query, where, getDocs } from "firebase/firestore";

const bcrypt = require('bcryptjs');

const hashPassword = async (password) => {
  try {
    const saltRounds = 10; // Number of salt rounds (recommended: 10 or higher)
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
  } catch (error) {
    console.error('Error hashing password:', error);
    throw error;
  }
};


const comparePassword = async (password, hashedPassword) => {
  try {
    const isMatch = await bcrypt.compare(password, hashedPassword);
    return isMatch;
  } catch (error) {
    console.error('Error comparing passwords:', error);
    throw error;
  }
};

export const loginUser = async (email, password, login) => {
  
  try {
    // Retrieve user document from Firestore based on email
    const usersRef = collection(db, "users");
    const querySnapshot = await getDocs(query(usersRef, where("email", "==", email)));
    if (querySnapshot.empty) {
      console.error("No user found with this email");
      return { status: false, error: "Invalid email or password" };
    }

    // Get the first user document (assuming there's only one with this email)
    const userDoc = querySnapshot.docs[0];
    const userData = userDoc.data();

    // Compare the provided password with the hashed password stored in the database
    const isPasswordMatch = await comparePassword(password, userData.password);
    if (!isPasswordMatch) {
      console.error("Incorrect password");
      return { status: false, error: "Invalid email or password" };
    }

    const loginResult = await login(email, password);

    // Sign in the user with Firebase Authentication
    //await signInWithEmailAndPassword(auth, email, password);
    console.log("User logged in successfully");
    return { status: true };
  } catch (error) {
    console.error("Error in user login:", error.message);
    return { status: false, error: error.message };
  }
};

// Function to register a new user
export const registerUser = async (email, username, password) => {
  // Create user with email and password
  console.log(email, username, password);
  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.error("Error in user registration:", errorCode, errorMessage);
    });

  try {
    const hashPass = await hashPassword(password)
    const docRef = await addDoc(collection(db, "users"), {
      email: email,
      username: username,
      password: hashPass, //password
      points: 0,
      isAdmin: false,
    });

    console.log("Document written with ID: ", docRef.id);
  } catch (e) {
    console.error("Error adding document: ", e);
  }

  return { status: true };
};



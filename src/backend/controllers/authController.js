import { auth, db } from "./firebase-config";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { signInWithEmailAndPassword } from "firebase/auth";
import { addDoc, collection, query, where, getDocs } from "firebase/firestore";
import { getUserIP, getUserISPNationality } from "./recommendationController";
const bcrypt = require("bcryptjs");

const hashPassword = async (password) => {
  try {
    const saltRounds = 10; // Number of salt rounds (recommended: 10 or higher)
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
  } catch (error) {
    console.error("Error hashing password:", error);
    throw error;
  }
};

const comparePassword = async (password, hashedPassword) => {
  try {
    const isMatch = await bcrypt.compare(password, hashedPassword);
    return isMatch;
  } catch (error) {
    console.error("Error comparing passwords:", error);
    throw error;
  }
};

export const loginUser = async (email, password, login) => {
  try {
    // First, try to authenticate with Firebase
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    // If Firebase auth succeeds, also verify against Firestore for additional data
    const usersRef = collection(db, "users");
    const querySnapshot = await getDocs(
      query(usersRef, where("email", "==", email))
    );
    
    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data();
      
      // Verify password against Firestore hash (additional security layer)
      const isPasswordMatch = await comparePassword(password, userData.password);
      if (!isPasswordMatch) {
        // If Firestore password doesn't match, sign out from Firebase
        await auth.signOut();
        console.error("Password verification failed");
        return { status: false, error: "Invalid email or password" };
      }
    }

    console.log("User logged in successfully");
    return { status: true };
  } catch (error) {
    console.error("Error in user login:", error.message);
    return { status: false, error: error.message };
  }
};

// Function to register a new user
export const registerUser = async (email, username, password) => {
  let nationality = -1;
  try {
    const userIP = await getUserIP();
    nationality = await getUserISPNationality(userIP);
  } catch (e) {
    console.error("Error getting nationality: ", e)
  }
  if (nationality === -1) {
    nationality = "";
  }

  try {
    // Create user with Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Hash password for Firestore storage
    const hashPass = await hashPassword(password);
    
    // Store additional user data in Firestore
    const docRef = await addDoc(collection(db, "users"), {
      email: email,
      username: username,
      password: hashPass,
      points: 0,
      isAdmin: false,
      nationality: nationality,
      firebaseUID: user.uid, // Link to Firebase user
    });

    console.log("Document written with ID: ", docRef.id);
    return { status: true };
  } catch (error) {
    console.error("Error in user registration:", error);
    return { status: false, error: error.message };
  }
};

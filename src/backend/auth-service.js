import { auth, db } from "./firebase-config";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { signInWithEmailAndPassword } from "firebase/auth";
import { addDoc, collection } from "firebase/firestore";

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
    const docRef = await addDoc(collection(db, "users"), {
      username: username,
      points: 0,
      isAdmin: false,
    });

    console.log("Document written with ID: ", docRef.id);
  } catch (e) {
    console.error("Error adding document: ", e);
  }

  return { status: true };
};

// Function to log in a user
export const loginUser = async (email, password) => {
  try {
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        alert("User logged in!");
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.error("Error in user registration:", errorCode, errorMessage);
      });
    return { status: true };
  } catch (error) {
    console.error("Error in user login:", error.message);
    return { status: false, error: error.message };
  }
};

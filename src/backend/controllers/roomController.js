import { db } from "./firebase-config";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import {
  addDoc,
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  getDoc,
} from "firebase/firestore";

export const addRoom = async (userName) => {
  const roomID = generateID();
  try {
    await addDoc(collection(db, "rooms"), {
      title: movieData.title,
      roomCode: roomID,
      isMoviePlaying: false,
      isCreatorInTheRoom: true,
      users: userName,
    });
    console.log("Movie added successfully");
    return { status: true };
  } catch (e) {
    console.error("Error adding movie: ", e);
    return { status: false, error: e.message };
  }
};

function generateID() {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

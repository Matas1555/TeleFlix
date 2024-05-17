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
  setDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  arrayUnion,
} from "firebase/firestore";

export const addRoom = async (userName) => {
  const roomID = generateID();
  try {
    const roomRef = doc(db, "rooms", roomID);
    await setDoc(roomRef, {
      roomCode: roomID,
      isMoviePlaying: false,
      isCreatorInTheRoom: true,
      movieURL: "",
      users: [userName],
      roomCreator: userName,
    });
    console.log("Room added successfully with ID:", roomID);
    return { status: true, roomId: roomID };
  } catch (e) {
    console.error("Error adding room: ", e);
    return { status: false, error: e.message };
  }
};

export const getRoomCreator = async (roomID) => {
  const roomRef = doc(db, "rooms", roomID);
  try {
    const roomDoc = await getDoc(roomRef);
    if (roomDoc.exists()) {
      const roomData = roomDoc.data();
      return { status: true, roomCreator: roomData.users[0] };
    } else {
      return { status: false, message: "Room does not exist" };
    }
  } catch (e) {
    console.error("Error getting room creator: ", e);
    return { status: false, message: e.message };
  }
};

export const joinRoom = async (roomID, userName) => {
  const roomRef = doc(db, "rooms", roomID);
  try {
    // First, check if the room exists and the user isn't already in the room
    const roomDoc = await getDoc(roomRef);
    if (roomDoc.exists()) {
      const roomData = roomDoc.data();
      if (!roomData.users.includes(userName)) {
        await updateDoc(roomRef, {
          users: arrayUnion(userName),
        });
        return { status: true, message: "Joined the room successfully" };
      } else {
        return { status: true, message: "User already in the room" };
      }
    } else {
      return { status: false, message: "Room does not exist" };
    }
  } catch (e) {
    console.error("Error joining room: ", e);
    return { status: false, message: e.message };
  }
};

export const updateRoomMovieStatus = async (roomID, movie) => {
  const roomRef = doc(db, "rooms", roomID);
  try {
    // First, check if the room exists and the user isn't already in the room
    const roomDoc = await getDoc(roomRef);
    if (roomDoc.exists()) {
      const roomData = roomDoc.data();
      if (movie != null) {
        await updateDoc(roomRef, {
          isMoviePlaying: false,
          movieURL: movie,
          currentTime: 0,
        });
        return { status: true, message: "Movie status updated successfully" };
      } else {
        await updateDoc(roomRef, {
          isMoviePlaying: false,
          movieURL: movie,
          currentTime: 0,
        });
        return { status: true, message: "User already in the room" };
      }
    } else {
      return { status: false, message: "Room does not exist" };
    }
  } catch (e) {
    console.error("error updating movie status: ", e);
    return { status: false, message: e.message };
  }
};

export const updateRoomMoviePlayingStatus = async (roomID, isPlaying) => {
  const roomRef = doc(db, "rooms", roomID);
  try {
    // First, check if the room exists and the user isn't already in the room
    const roomDoc = await getDoc(roomRef);
    if (roomDoc.exists()) {
      const roomData = roomDoc.data();
      if (roomData.movieURL != null) {
        await updateDoc(roomRef, {
          isMoviePlaying: isPlaying,
        });
        return {
          status: true,
          message: "Movie is playing: " + isPlaying,
        };
      } else {
        await updateDoc(roomRef, {
          isMoviePlaying: null,
        });
        return { status: true, message: "Movie not selected" };
      }
    } else {
      return { status: false, message: "Room does not exist" };
    }
  } catch (e) {
    console.error("error updating movie status: ", e);
    return { status: false, message: e.message };
  }
};

export const updateRoomMovieTimeStatus = async (roomID, currentTime) => {
  const roomRef = doc(db, "rooms", roomID);
  await updateDoc(roomRef, {
    currentTime: currentTime,
  });
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

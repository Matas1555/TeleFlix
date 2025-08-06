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
  writeBatch,
} from "firebase/firestore";

export const createRoom = async (userName) => {
  const roomID = generateID();
  try {
    const roomRef = doc(db, "rooms", roomID);
    await setDoc(roomRef, {
      roomCode: roomID,
      isMoviePlaying: false,
      hasVotingStarted: false,
      isEventPredictionActive: false,
      isCreatorInTheRoom: true,
      movieURL: "",
      users: [userName],
      roomCreator: userName,
      messages: [],
    });
    console.log("Room added successfully with ID:", roomID);
    return { status: true, roomId: roomID };
  } catch (e) {
    console.error("Error adding room: ", e);
    return { status: false, error: e.message };
  }
};

export const createVote = async (roomID) => {
  try {
    const historyRef = doc(db, "movieVoteForm", roomID);
    await deleteDoc(historyRef);
    await setDoc(historyRef, {
      numberOfVotes: [],
      timeVoteOpened: 0.01,
      isVoteActive: true,
      choosenMovies: [],
    });
    return { status: true };
  } catch (e) {
    return { status: false, error: e.message };
  }
};

export const addEvent = async (roomID, predictionString) => {
  const result = validateFormInformation(predictionString);
  if (result) {
    try {
      const eventRef = doc(db, "movieEventForm", roomID);
      await deleteDoc(eventRef);
      await setDoc(eventRef, {
        prediction: predictionString,
        isPredictionActive: true,
      });
      return { status: true };
    } catch (e) {
      return { status: false, message: e.message };
    }
  } else {
    return { status: false, message: "prediction was not written" };
  }
};

export const addUserPrediction = async (roomID, username, predictionString) => {
  try {
    const eventRef = doc(db, "Response", roomID + "_" + username);
    await deleteDoc(eventRef);
    await setDoc(eventRef, {
      user: username,
      response: predictionString,
    });
    return { status: true };
  } catch (e) {
    return { status: false, message: e.message };
  }
};

export const validateFormInformation = (sentence) => {
  if (sentence === "") {
    return false;
  } else return true;
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

export const getPrediction = async (roomID) => {
  console.log(roomID);
  const roomRef = doc(db, "movieEventForm", roomID);
  try {
    const roomDoc = await getDoc(roomRef);
    if (roomDoc.exists()) {
      const roomData = roomDoc.data();
      return { status: true, prediction: roomData.prediction };
    } else {
      return { status: false, message: "Room does not exist" };
    }
  } catch (e) {
    console.error("Error getting room creator: ", e);
    return { status: false, message: e.message };
  }
};

export const addUserToRoom = async (roomID, userName) => {
  const roomRef = doc(db, "rooms", roomID);
  try {
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

export const countVotes = async (roomID) => {
  const voteRef = doc(db, "movieVoteForm", roomID);
  try {
    const voteDoc = await getDoc(voteRef);
    if (voteDoc.exists()) {
      const voteData = voteDoc.data();
      //Check if anyone voted for a movie
      if (voteData.numberOfVotes.length > 0) {
        let max = Math.max(...voteData.numberOfVotes);
        var count = 1;
        var movies = [];
        for (let i = 0; i < voteData.numberOfVotes.length; i++) {
          if (voteData.numberOfVotes[i] === max) {
            count++;
            movies.push(voteData.choosenMovies[i]);
          }
        }
        //Check if there are more than one movie with the highest amount of votes
        if (count > 1) {
          return { status: true, movies: movies, moreThanOne: true };
        } else {
          return { status: true, movies: movies, moreThanOne: false };
        }
      }
    } else {
      return { status: false, message: "voting form does not exist" };
    }
  } catch (e) {
    console.error("Error finding form: ", e);
    return { status: false, message: e.message };
  }
};

export const addVotes = async (roomID, movie) => {
  const voteRef = doc(db, "movieVoteForm", roomID);
  try {
    const voteDoc = await getDoc(voteRef);
    if (voteDoc.exists()) {
      const voteData = voteDoc.data();
      const { choosenMovies = [], numberOfVotes = [] } = voteData;
      const movieIndex = choosenMovies.findIndex(
        (m) => m.title === movie.title
      );
      if (movieIndex === -1) {
        //Movie not voted for
        const updatedChoosenMovies = [...choosenMovies, movie];
        const updatedNumberOfVotes = [...numberOfVotes, 1];
        await updateDoc(voteRef, {
          choosenMovies: updatedChoosenMovies,
          numberOfVotes: updatedNumberOfVotes,
        });
        return {
          status: true,
          message: "Movie added and vote updated successfully",
        };
      } else {
        //Movie already voted for
        const updatedNumberOfVotes = [...numberOfVotes];
        updatedNumberOfVotes[movieIndex] += 1;
        await updateDoc(voteRef, {
          numberOfVotes: updatedNumberOfVotes,
        });
        return { status: true, message: "Vote count updated successfully" };
      }
    } else {
      return { status: false, message: "voting form does not exist" };
    }
  } catch (e) {
    console.error("Error joining room: ", e);
    return { status: false, message: e.message };
  }
};

export const checkUserAnswers = async (roomID, response) => {
  var correctUsers = [];
  try {
    const documentsArray = [];
    const querySnapshot = await getDocs(collection(db, "Response"));

    querySnapshot.forEach((doc) => {
      const docID = doc.id;
      const [docRoomID, username] = docID.split("_");

      if (docRoomID === roomID) {
        documentsArray.push(doc.data());
      }
    });

    for (var doc of documentsArray) {
      if (doc.response === response) {
        correctUsers.push(doc.user);
      }
    }

    const results = await checkCorrectAnswers(correctUsers);

    return { status: true, correctUsers: correctUsers };
  } catch (e) {
    console.error("Error getting room creator: ", e);
    return { status: false, correctUsers: correctUsers };
  }
};

export const checkCorrectAnswers = async (users) => {
  try {
    console.log(users);
    const querySnapshot = await getDocs(collection(db, "users"));

    for (let userDoc of querySnapshot.docs) {
      const userData = userDoc.data();
      if (users.includes(userData.email)) {
        const userRef = doc(db, "users", userDoc.id);
        const newPoints = (userData.points || 0) + 100;
        console.log(
          `Updating points for user ${userData.user} to ${newPoints}`
        );
        await updateDoc(userRef, { points: newPoints });
      }
    }

    console.log("Points updated successfully");
    return { status: true, correctUsers: users };
  } catch (e) {
    console.error("Error updating user points: ", e);
    return { status: false, correctUsers: users };
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

export const updateRoomVoteStatus = async (roomID, voteStatus) => {
  const roomRef = doc(db, "rooms", roomID);
  try {
    // First, check if the room exists and the user isn't already in the room
    const roomDoc = await getDoc(roomRef);
    if (roomDoc.exists()) {
      const roomData = roomDoc.data();
      if (voteStatus != null) {
        await updateDoc(roomRef, {
          hasVotingStarted: voteStatus,
        });
        return { status: true, message: "Voting status updates successfully" };
      } else {
        return { status: false, message: "Error creating vote" };
      }
    } else {
      return { status: false, message: "Room does not exist" };
    }
  } catch (e) {
    console.error("error updating voting status: ", e);
    return { status: false, message: e.message };
  }
};

export const updateRoomEventPredictionStatus = async (
  roomID,
  predictionStatus
) => {
  const roomRef = doc(db, "rooms", roomID);
  try {
    // First, check if the room exists and the user isn't already in the room
    const roomDoc = await getDoc(roomRef);
    if (roomDoc.exists()) {
      const roomData = roomDoc.data();
      if (predictionStatus != null) {
        await updateDoc(roomRef, {
          isEventPredictionActive: predictionStatus,
        });
        return {
          status: true,
          message: "Prediction status updated successfully",
        };
      } else {
        return { status: false, message: "Error creating prediction" };
      }
    } else {
      return { status: false, message: "Room does not exist" };
    }
  } catch (e) {
    console.error("error updating prediction status: ", e);
    return { status: false, message: e.message };
  }
};

export const updateUserMovieHistory = async (userName, movie) => {
  try {
    const movieHistoryRef = await addDoc(collection(db, "moviehistory"), {
      Movie: movie,
      Time: Date.now(),
      User: userName,
    });
    return { status: true };
  } catch (e) {
    return { status: false, error: e.message };
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

export const closeMovie = async (roomID) => {
  const roomRef = doc(db, "rooms", roomID);
  await updateDoc(roomRef, {
    movieURL: "",
  });
};

export const sendMessage = async (roomID, userName, message) => {
  const roomRef = doc(db, "rooms", roomID);
  try {
    const roomDoc = await getDoc(roomRef);
    if (roomDoc.exists()) {
      const messageObject = {
        id: Date.now().toString(),
        user: userName,
        text: message,
        timestamp: new Date().toISOString(),
      };
      
      await updateDoc(roomRef, {
        messages: arrayUnion(messageObject),
      });
      
      return { status: true, message: "Message sent successfully" };
    } else {
      return { status: false, message: "Room does not exist" };
    }
  } catch (e) {
    console.error("Error sending message: ", e);
    return { status: false, message: e.message };
  }
};

export const getMessages = async (roomID) => {
  const roomRef = doc(db, "rooms", roomID);
  try {
    const roomDoc = await getDoc(roomRef);
    if (roomDoc.exists()) {
      const roomData = roomDoc.data();
      return { status: true, messages: roomData.messages || [] };
    } else {
      return { status: false, message: "Room does not exist" };
    }
  } catch (e) {
    console.error("Error getting messages: ", e);
    return { status: false, message: e.message };
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

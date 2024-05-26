import { db } from "./firebase-config";
import { collection, query, where, getDocs, addDoc, deleteDoc, updateDoc, doc } from "firebase/firestore";

export const getAllEvents = async (userId) => {
  try {
    const eventsQuery = query(
      collection(db, "events"),
      where("userId", "==", userId)
    );
    const eventsSnapshot = await getDocs(eventsQuery);
    const events = [];
    eventsSnapshot.forEach((doc) => {
      events.push({ id: doc.id, ...doc.data() });
    });
    return events;
  } catch (error) {
    console.error("Error getting user's events:", error);
    return [];
  }
};

export const getMovies = async () => {
  try {
    const moviesSnapshot = await getDocs(collection(db, "movies"));
    const movies = [];
    moviesSnapshot.forEach((doc) => {
      movies.push({ id: doc.id, ...doc.data() });
    });
    console.log("Fetched movies from Firestore:", movies); // Debug log
    return movies;
  } catch (error) {
    console.error("Error getting movies:", error.message);
    return [];
  }
};

export const addEvent = async (event) => {
  try {
    const docRef = await addDoc(collection(db, "events"), event);
    return { id: docRef.id, ...event };
  } catch (error) {
    console.error("Error adding event:", error);
    return null;
  }
};

export const deleteEvent = async (eventId) => {
  try {
    await deleteDoc(doc(db, "events", eventId));
    return true;
  } catch (error) {
    console.error("Error deleting event:", error);
    return false;
  }
};

export const updateEvent = async (eventId, updatedEvent) => {
  try {
    const eventDoc = doc(db, "events", eventId);
    await updateDoc(eventDoc, updatedEvent);
    return { id: eventId, ...updatedEvent };
  } catch (error) {
    console.error("Error updating event:", error);
    return null;
  }
};

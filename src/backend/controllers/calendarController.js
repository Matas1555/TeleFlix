import { db } from "./firebase-config";
import {
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";

export const getUserEvents = async (userId) => {
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



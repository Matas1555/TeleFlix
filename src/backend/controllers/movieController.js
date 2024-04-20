// movieController.js
import { db } from "./firebase-config";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { addDoc, collection, getDocs, doc, updateDoc, deleteDoc, getDoc } from "firebase/firestore";

// Create a new movie
export const addMovie = async (movieData, file) => {
  // Upload movie file to Firebase Storage
  const storage = getStorage();
  const fileRef = ref(storage, `movies/${file.name}`);
  await uploadBytes(fileRef, file);

  // Get the download URL of the uploaded movie file
  const movieURL = await getDownloadURL(fileRef);

  // Add movie details to Firebase Firestore
  try {
    await addDoc(collection(db, "movies"), {
      title: movieData.title,
      description: movieData.description,
      actors: movieData.actors,
      year: movieData.year,
      posterURL: movieData.posterURL,
      movieURL: movieURL,
    });
    console.log("Movie added successfully");
    return { status: true };
  } catch (e) {
    console.error("Error adding movie: ", e);
    return { status: false, error: e.message };
  }
};

// Read a single movie
export const getMovie = async (movieId) => {
  try {
    const movieDoc = await getDoc(doc(db, "movies", movieId));
    if (movieDoc.exists()) {
      return { id: movieDoc.id, ...movieDoc.data() };
    } else {
      console.log("No such document!");
      return null;
    }
  } catch (e) {
    console.error("Error getting movie: ", e);
    return null;
  }
};

// Read all movies
export const getAllMovies = async () => {
  try {
    const moviesSnapshot = await getDocs(collection(db, "movies"));
    const movies = [];
    moviesSnapshot.forEach((doc) => {
      movies.push({ id: doc.id, ...doc.data() });
    });
    return movies;
  } catch (e) {
    console.error("Error getting movies: ", e);
    return [];
  }
};

// Update a movie
export const updateMovie = async (movieId, updatedMovieData) => {
  try {
    const movieRef = doc(db, "movies", movieId);
    await updateDoc(movieRef, updatedMovieData);
    console.log("Movie updated successfully");
    return { status: true };
  } catch (e) {
    console.error("Error updating movie: ", e);
    return { status: false, error: e.message };
  }
};

// Delete a movie
export const deleteMovie = async (movieId) => {
  try {
    await deleteDoc(doc(db, "movies", movieId));
    console.log("Movie deleted successfully");
    return { status: true };
  } catch (e) {
    console.error("Error deleting movie: ", e);
    return { status: false, error: e.message };
  }
};

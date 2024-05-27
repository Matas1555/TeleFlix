// movieController.js
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
  query,
  where,
} from "firebase/firestore";
import { getRecommendations } from "./recommendationController";

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
      director: movieData.director,
      year: movieData.year,
      posterURL: movieData.posterURL,
      movieURL: movieURL,
      currentTime: 0.0,
      movieRef: `movies/${file.name}`,
    });
    console.log("Movie added successfully");
    return { status: true };
  } catch (e) {
    console.error("Error adding movie: ", e);
    return { status: false, error: e.message };
  }
};

export const postComment = async (movieId, commentText, user) => {
  try {
    const validate = await validateComment(movieId, commentText, user);
    if (validate != true) {
      console.error("Error posting comment:", "Validation failed");
    }
    await addDoc(collection(db, "comments"), {
      user: user,
      movieId: movieId,
      text: commentText,
      timestamp: new Date().toISOString(),
    });
    console.log("Comment posted successfully");
    return { status: true };
  } catch (error) {
    console.error("Error posting comment:", error);
    return { status: false, error: error.message };
  }
};
const validateComment = async (movieId, commentText, user) => {
  if (user != null) {
    return { status: false, error: "user is null" };
  }
  if (commentText != null) {
    return { status: false, error: "comment is null" };
  }
  if (movieId != null) {
    return { status: false, error: "movieID is null" };
  }
  return { status: true };
};

export const deleteComment = async (commentId) => {
  try {
    await deleteDoc(doc(db, "comments", commentId));
    console.log("Comment deleted successfully");
    return { status: true };
  } catch (error) {
    console.error("Error deleting comment:", error);
    return { status: false, error: error.message };
  }
};

export const editComment = async (commentId, newText) => {
  try {
    const commentRef = doc(db, "comments", commentId);
    await updateDoc(commentRef, { text: newText });
    console.log("Comment edited successfully");
    return { status: true };
  } catch (error) {
    console.error("Error editing comment:", error);
    return { status: false, error: error.message };
  }
};

export const getCommentsByMovieId = async (movieId) => {
  try {
    const commentsQuery = query(
      collection(db, "comments"),
      where("movieId", "==", movieId)
    );

    const commentsSnapshot = await getDocs(commentsQuery);
    const comments = [];
    commentsSnapshot.forEach((doc) => {
      comments.push({ id: doc.id, ...doc.data() });
    });
    return comments;
  } catch (error) {
    console.error("Error getting comments:", error);
    return [];
  }
};
export const getUser = async (user) => {
    try {
        const userSnapshot = await getDocs(collection(db, "users"));
        const users = [];
        userSnapshot.forEach((doc) => {
            users.push({ id: doc.id, ...doc.data() });
        });
        const admin = users.filter(entry => entry.email === user);
        return admin[0].isAdmin;
    } catch (error) {
        console.error("Error getting user:", error)
        return null;
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
export const getMovieList = async (user) => {
  try {
      const recommendations = await getRecommendations(user);
      const moviesSnapshot = await getDocs(collection(db, "movies"));
      const movies = [];
      moviesSnapshot.forEach((doc) => {
          movies.push({ id: doc.id, ...doc.data() });
      });
      return recommendations;
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
  const movie = await getMovie(movieId);
  const storage = getStorage();

  // Create a reference to the file to delete
  const fileRef = ref(storage, movie.movieRef);

  // Delete the file
  deleteObject(fileRef)
    .then(() => {
      console.log("File deleted successfully");
    })
    .catch((error) => {
      console.log("Error deleting file", error);
    });

  try {
    await deleteDoc(doc(db, "movies", movieId));
    console.log("Movie deleted successfully");
    return { status: true };
  } catch (e) {
    console.error("Error deleting movie: ", e);
    return { status: false, error: e.message };
  }
};

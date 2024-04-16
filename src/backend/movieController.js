import { auth, db } from "./firebase-config";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { addDoc, collection } from "firebase/firestore";

export const addMovie = async (movieData, file) => {
  // Upload movie file to Firebase Storage
  const storage = getStorage();
  const fileRef = ref(storage, `movies/${file.name}`);
  const fileSnapshot = await uploadBytes(fileRef, file);

  // Get the download URL of the uploaded movie file
  const movieURL = await getDownloadURL(fileSnapshot.ref);

  //Add movie details to firebase database
  try {
    const docRef = await addDoc(collection(db, "movies"), {
      title: movieData.title,
      description: movieData.description,
      actors: movieData.actors,
      year: movieData.year,
      posterURL: movieData.posterURL,
      movieURL: movieURL,
    });
    console.log("Movie added successfully");
  } catch (e) {
    console.error("Error adding document: ", e);
  }

  return { status: true };
};

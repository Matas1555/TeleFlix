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
const validateList = async (list) =>
{
    try {
        if (list.length === 0) { return false; }
        else return true;
    }
    catch (e) { console.error("Error validating user movie history list", e); return false; }
}
const prepareData = async (users, history, user) => {
    try {
        const userHistories = [];
        for (let i = 0; i < users.length; i++) {
            const email = users[i].email;
            if (email === user) continue;
            const historyArray = [email];
            for (let o = 0; o < history.length; o++) {
                if (email === history[o].User) {
                    historyArray.push(history[o].Movie);
                }
            }
            userHistories.push(historyArray);
        }
        return userHistories;
    } catch (e) {
        console.error("error mapping user/history lists")
    }
}
export const getRecommendations = async (user) => {
    try {
        const movies = await getAllMovieList();
        const history = await getMovieHistoryEntries();
        const users = await getUsers();
        const currentuserList = await GetCurrentUserEntryList(user, history);
        const validate = await validateList(currentuserList);
        if (validate) {
            const MappedData = await prepareData(users, history, user)

            return movies;
        }
        else {
            return movies;
        }
    } catch (e) {
        console.error("Error getting recommendations: ", e);
        return [];
    }
}
export const getAllMovieList = async () => {
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
export const getMovieHistoryEntries = async () => {
    try {
        const historySnapshot = await getDocs(collection(db, "moviehistory"));
        const history = [];
        historySnapshot.forEach((doc) => {
            history.push({ id: doc.id, ...doc.data() });
        });
        return history;
    } catch (e) {
        console.error("Error getting movie history: ", e);
        return [];
    }
};
export const getUsers = async () => {
    try {
        const userSnapshot = await getDocs(collection(db, "users"));
        const users = [];
        userSnapshot.forEach((doc) => {
            users.push({ id: doc.id, ...doc.data() });
        });
        return users;
    } catch (e) {
        console.error("Error getting users: ", e);
        return [];
    }
};
const GetCurrentUserEntryList = async (user, history) => {
    try {
        return history.filter(entry => entry.User === user);
    }
    catch (e)
    {
        console.error("Error getting current user history entry list", e)
    }
};
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
        console.error("error mapping user/history lists", e)
        return [];
    }
}
const computeJaccardIndex = async (list1, list2) =>
{
    try {
        list1.shift();
        let set1 = new Set(list1);
        let set2 = new Set(list2);
        let intersection = new Set([...set1].filter(item => set2.has(item)));
        let union = new Set([...set1, ...set2]);
        let jaccardIndex = intersection.size / union.size;
        return jaccardIndex;
    } catch (e) {
        console.log("error computing jaccard index", e)
        return -1;
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
            const promises = [];
            for (let i = 0; i < MappedData.length; i++) {
                promises.push(computeJaccardIndex(MappedData[i], currentuserList));
            }
            const jaccardIndex = await Promise.all(promises);
            jaccardIndex.sort((a, b) => b - a);
            console.log(MappedData);
            console.log(currentuserList);
            console.log(jaccardIndex);
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
        return history.filter(entry => entry.User === user).map(entry => entry.Movie);
    }
    catch (e)
    {
        console.error("Error getting current user history entry list", e)
        return [];
    }
};
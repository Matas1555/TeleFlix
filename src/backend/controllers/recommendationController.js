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
        console.error("error mapping user/history lists", e);
        return [];
    }
}
const computeJaccardIndex = async (list1, list2, index) =>
{
    try {
        list1.shift();
        let set1 = new Set(list1);
        let set2 = new Set(list2);
        let intersection = new Set([...set1].filter(item => set2.has(item)));
        let union = new Set([...set1, ...set2]);
        let jaccardIndex = intersection.size / union.size;
        return { index, jaccardIndex };
    } catch (e) {
        console.log("error computing jaccard index", e);
        return -1;
    }
}
const selectListsMeetingIndexThreshold = async (filteredIndices, MappedData, current) => {
    try {
        const recommendations = [];
        for (let i = 0; i < filteredIndices.length; i++) {
            const index = filteredIndices[i].index;
            const userMovies = MappedData[index];
            for (const movie of userMovies) {
                if (current.includes(movie)) continue;
                if (!recommendations.includes(movie)) {
                    recommendations.push(movie);
                    if (recommendations.length === 10) {
                        break;
                    }
                }
            }
            if (recommendations.length === 10) {
                break;
            }
        }
        return recommendations;
    } catch (e) {
        console.log("error getting recommendations from lists meeting index threshold", e);
        return [];
    }
}
const getUserNationality = async (user) =>
{
    try {
        if (user?.nationality != null) {
            return user.nationality;
        }
        else {
            return -1;
        }
    }
    catch (e) {
        console.log("error getting user nationality", e);
        return -1
    }
}
const getUserIP = async () => {
    try {
        return fetch('https://api.ipify.org?format=json')
            .then(response => response.json())
            .then(data => {
                console.log(data.ip);
            })
            .catch(error => {
                console.log('Error:', error);
            });
    }
    catch (e) {
        console.log("error getting user ip", e);
        return null;
    }
}
const getUserISPNationality = async () => {
    try {
        return fetch('https://api.ipregistry.co/?key=tryout')
            .then(function (response) {
                return response.json();
            })
            .then(function (payload) {
                console.log(payload.location.country.name);
            });
    }
    catch (e) {
        console.log("error getting user isp nationality", e);
        return null;
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
                promises.push(computeJaccardIndex(MappedData[i], currentuserList, i));
            }
            const jaccardIndex = await Promise.all(promises);
            const filteredIndices = jaccardIndex.filter(obj => obj.jaccardIndex >= 0.5);
            if (filteredIndices.length === 0) { return movies; }
            filteredIndices.sort((a, b) => b.jaccardIndex - a.jaccardIndex);
            const recommendations = await selectListsMeetingIndexThreshold(filteredIndices, MappedData, currentuserList);
            const recommendedMovies = movies.filter(movie => recommendations.includes(movie.title));
            const movieList = [...recommendedMovies, ...movies];
            const uniqueMovies = movieList.filter((movie, index, self) => self.findIndex(m => m.id === movie.id) === index);
            return uniqueMovies;
        }
        else {
            let nationality = -1;
            if (nationality === -1) {
                nationality = await getUserNationality(user);
            }
            if (nationality === -1) {
                const userIP = await getUserIP();
                nationality = getUserISPNationality();
            }
            if (nationality === -1) return movies;
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
        console.error("Error getting current user history entry list", e);
        return [];
    }
};
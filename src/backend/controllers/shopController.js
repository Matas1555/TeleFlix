import { db } from './firebase-config';
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
// Function to fetch shop items from the database
export const getShopItems = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'shopItems'));
    const shopItems = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return shopItems;
  } catch (error) {
    console.error('Error fetching shop items:', error);
    return [];
  }
};
export const ProcessBuying = async (item, user) => {
    try {
        const points = await GetUserPoints(user);
        var p = Number(points);
        var i = Number(item.price);
        if (p > i) {
            p = p - i;
            const success = await AddShopItem(item, user, p);
            return success;
        } else {
            return false;
        }
    } catch (error) {
        console.error('Error processing buying items:', error);
        return false;
    }
}
const GetUserPoints = async (user) => {
    try {
        const querySnapshot = await getDocs(collection(db, 'users'));
        const userDoc = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        user = userDoc.filter(entry => entry.email === user);
        return user[0].points;
    } catch (error) {
        console.error('Error getting points:', error);
        return false;
    }
}
const AddShopItem = async (item, user, p) => {
    try {
        const querySnapshot = await getDocs(collection(db, 'users'));
        const userDoc = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        user = userDoc.filter(entry => entry.email === user);
        const userRef = doc(db, "users", user[0].id);
        const { email, isAdmin, nationality, password, username } = user[0];
        const items = Array.isArray(user[0].items) ? user[0].items : [];
        const updatedItems = [...items, item.id];
        const points = p
        const updatedUserData = {
            email,
            isAdmin,
            nationality,
            password,
            points,
            username,
            items: updatedItems
        };
        try {
            await updateDoc(userRef, updatedUserData);
        }
        catch (error) {
            console.error("Error updating user", error);
        }
        return true;
    } catch (error) {
        console.error('Error adding shop item:', error);
        return false;
    }
}
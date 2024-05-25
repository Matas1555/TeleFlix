import { collection, getDocs, addDoc } from 'firebase/firestore';
import { db } from './firebase-config';

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
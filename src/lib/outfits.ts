import { db } from './firebase';
import { 
  collection, 
  addDoc,
  query, 
  where, 
  getDocs,
  deleteDoc,
  doc,
  serverTimestamp
} from 'firebase/firestore';

export interface SavedOutfit {
  id?: string;
  userId: string;
  city: string;
  weather: {
    temp: number;
    condition: string;
    humidity: number;
    windSpeed: number;
  };
  innerLayers: string[];
  outerLayers: string[];
  createdAt: Date;
}

export const saveOutfit = async (outfit: Omit<SavedOutfit, 'id' | 'createdAt'>) => {
  try {
    console.log('Attempting to save outfit:', outfit); // Debug log
    
    // Validate outfit data
    if (!outfit.userId) {
      throw new Error('User ID is required');
    }
    if (!outfit.city) {
      throw new Error('City is required');
    }
    if (!outfit.weather) {
      throw new Error('Weather data is required');
    }

    const outfitData = {
      ...outfit,
      createdAt: serverTimestamp(),
      innerLayers: Array.from(outfit.innerLayers || []),
      outerLayers: Array.from(outfit.outerLayers || [])
    };

    console.log('Saving outfit data:', outfitData); // Debug log

    const docRef = await addDoc(collection(db, 'outfits'), outfitData);
    console.log('Outfit saved successfully with ID:', docRef.id); // Debug log
    return docRef.id;
  } catch (error) {
    console.error('Error saving outfit:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to save outfit: ${error.message}`);
    } else {
      throw new Error('Failed to save outfit: Unknown error');
    }
  }
};

export const getUserOutfits = async (userId: string): Promise<SavedOutfit[]> => {
  try {
    const q = query(collection(db, 'outfits'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date()
    })) as SavedOutfit[];
  } catch (error) {
    console.error('Error getting outfits:', error);
    throw error;
  }
};

export const deleteOutfit = async (outfitId: string) => {
  try {
    await deleteDoc(doc(db, 'outfits', outfitId));
  } catch (error) {
    console.error('Error deleting outfit:', error);
    throw error;
  }
}; 
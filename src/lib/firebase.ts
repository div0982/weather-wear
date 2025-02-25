import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

// Replace these with your Firebase configuration values
const firebaseConfig = {
  apiKey: "AIzaSyDwt8b-R-qV2wMSkpNmq0zcjQozgwKdwuw",
  projectId: "weatherwear-avatar",
  messagingSenderId: "1041831801829",
  appId: "1:1041831801829:web:c35363ba126b99d1adb50c",
  authDomain: "weatherwear-avatar.firebaseapp.com",
  storageBucket: "weatherwear-avatar.appspot.com",
  measurementId: "G-H8XYKSKH34"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app); 
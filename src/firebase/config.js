import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

export const firebaseConfig = {
  apiKey: "AIzaSyDVrDULWL5su6wnFK3ImZHbc29NZzUdCsw",
  authDomain: "taller-d6733.firebaseapp.com",
  databaseURL: "https://taller-d6733-default-rtdb.firebaseio.com",
  projectId: "taller-d6733",
  storageBucket: "taller-d6733.firebasestorage.app",
  messagingSenderId: "679140259658",
  appId: "1:679140259658:web:e9b20c8b6407acdcb9b3b3",
  measurementId: "G-RBRN9GBHQS"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getDatabase(app);
export default app;



import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

export const firebaseConfig = {
    apiKey: "AIzaSyAxGohQZKmjtFUbqdXrgEnqhShl1G4FL-E",
    authDomain: "project-9c33a.firebaseapp.com",
    projectId: "project-9c33a",
    storageBucket: "project-9c33a.firebasestorage.app",
    messagingSenderId: "886971993002",
    appId: "1:886971993002:web:eef544daa11a600ae7f9d3"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
// Set language to Arabic for Firebase emails/SMS
auth.languageCode = 'ar';

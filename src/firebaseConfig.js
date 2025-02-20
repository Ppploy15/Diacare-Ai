import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyA00oRrD1xRBd0Oi0INHx7nggovUA-CMNE",
    authDomain: "diacare-ai.firebaseapp.com",
    projectId: "diacare-ai",
    storageBucket: "diacare-ai.firebasestorage.app",
    messagingSenderId: "848199933543",
    appId: "1:848199933543:web:2c37d295f3aeb24cf0fec2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };

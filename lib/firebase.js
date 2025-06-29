import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyACvdeH6po8fbsxtWxTiiYo9_qRPicOtG4",

  authDomain: "healthcare-app-a0c3b.firebaseapp.com",

  projectId: "healthcare-app-a0c3b",

  storageBucket: "healthcare-app-a0c3b.firebasestorage.app",

  messagingSenderId: "717053927792",

  appId: "1:717053927792:web:1d7e1d7a07fbeb75ce6fb5",

  measurementId: "G-Y5SVLG3K68"
};

export const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);

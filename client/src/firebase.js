import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCzx8JLsOmFUXA9nZx0qhaYve6zijX5pUE",
  authDomain: "brewery-597ed.firebaseapp.com",
  projectId: "brewery-597ed",
  storageBucket: "brewery-597ed.firebasestorage.app",
  messagingSenderId: "924676372931",
  appId: "1:924676372931:web:b843d98fb0b22e7c142576",
  measurementId: "G-CD2JS2X48Z"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export default app;

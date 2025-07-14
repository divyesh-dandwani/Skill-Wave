import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { createContext, useContext, useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore } from "firebase/firestore";



const firebaseConfig = {
  apiKey: "AIzaSyDBsTjGuFabIB7n7V6ODe_gXs2hppZZbYs",
  authDomain: "skill-wave-cb730.firebaseapp.com",
  projectId: "skill-wave-cb730",
  storageBucket: "skill-wave-cb730.appspot.com",
  messagingSenderId: "968758897944",
  appId: "1:968758897944:web:f7d9e50d2196ed67fd426d",
  measurementId: "G-3MHTJQ7WH7",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);

// Initialize Analytics only in client-side and supported environments
let analytics;
const initAnalytics = async () => {
  if (typeof window !== 'undefined') {
    try {
      if (await isSupported()) {
        analytics = getAnalytics(app);
      }
    } catch (error) {
      console.warn("Firebase Analytics initialization error:", error);
    }
  }
};
initAnalytics();

// Create Firebase Context
const FirebaseContext = createContext(null);

// Custom Hook
export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (!context) {
    throw new Error("useFirebase must be used within a FirebaseProvider");
  }
  return context;
};

// Provider Component
export const FirebaseProvider = ({ children }) => {
  const [userId, setUserId] = useState(null);
  const [authInitialized, setAuthInitialized] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthInitialized(true);
      setUserId(user?.uid || null);
    });

    return () => unsubscribe();
  }, []);

  const value = {
    auth,
    db,
    analytics,
    userId,
    authInitialized,
    setUserId
  };

  return (
    <FirebaseContext.Provider value={value}>
      {children}
    </FirebaseContext.Provider>
  );
};

// Direct exports for non-context usage
export { auth, db, analytics };

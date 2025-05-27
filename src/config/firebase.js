import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithRedirect, 
  getRedirectResult 
} from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';

// TODO: Replace with your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCOHDmO2SzviFTpdQN936YA4Zl7XW3W8PY",
  authDomain: "planmateweb.firebaseapp.com",
  projectId: "planmateweb",
  storageBucket: "planmateweb.firebasestorage.app",
  messagingSenderId: "665292716528",
  appId: "1:665292716528:web:6b58dc72f53ec981a80535"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// Function to sign in with Google
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    // Check if user exists in Firestore
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    
    if (!userDoc.exists()) {
      // Create user document if it doesn't exist
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        provider: 'google.com',
        createdAt: new Date().toISOString(),
      });
    }
    
    return { user };
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
};

export { auth, db, googleProvider };
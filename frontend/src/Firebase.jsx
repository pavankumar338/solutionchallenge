import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBkXk7fjIeTC9mWvrXFxgl9jymP42jWGN0",
  authDomain: "chatreal-3ad67.firebaseapp.com",
  projectId: "chatreal-3ad67",
  storageBucket: "chatreal-3ad67.appspot.com", 
  appId: "1:1025045455922:web:f9ec14ccc8c0cb58aa882b",
  measurementId: "G-HR0G4K3BRZ",
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const signOut = async () => {
  try {
    await auth.signOut();
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export { auth, googleProvider, signInWithGoogle, signOut };
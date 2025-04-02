import { useEffect, useState } from 'react';
import { auth } from './Firebase';
import { signInWithGoogle, signOut } from './Firebase';
import { onAuthStateChanged } from 'firebase/auth';

const Auth = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="flex items-center space-x-4">
      {user ? (
        <>
          <img 
            src={user.photoURL} 
            alt="User" 
            className="w-8 h-8 rounded-full" 
          />
          <button 
            onClick={signOut}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition duration-200"
          >
            Sign Out
          </button>
        </>
      ) : (
        <button 
          onClick={signInWithGoogle}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition duration-200 flex items-center"
        >
          <svg className="w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
            <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"/>
          </svg>
          Sign in with Google
        </button>
      )}
    </div>
  );
};

export default Auth;
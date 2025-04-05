import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from "react-router-dom";
import { auth } from './Firebase';
import { onAuthStateChanged } from 'firebase/auth';
import Header from './Header';
import HERO from './HERO';
import HealthAssistant from './HealthAssistant';
import EDU from './EDU';
import RESEARCH from './RESEARCH';
import Auth from './Auth';

const PrivateRoute = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return <div>Loading...</div>;
  return user ? children : <Navigate to="/" />;
};

const App = () => {
  return (
    <div className='bg-gradient-to-r from-slate-500 to-black min-h-screen'>
      <Header>
        <Auth />
      </Header>

      <main className="container mx-auto p-4">
        <Routes>
          <Route path="/" element={<HERO />} />
          
          <Route 
            path="/health"
            element={
              <PrivateRoute>
                <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-lg p-6 shadow-lg">
                  <HealthAssistant />
                </div>
              </PrivateRoute>
            }
          />
          
          <Route 
            path="/edu"
            element={
              <PrivateRoute>
                <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-lg p-6 shadow-lg">
                  <EDU />
                </div>
              </PrivateRoute>
            }
          />
          
          <Route 
            path="/research"
            element={
              <PrivateRoute>
                <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-lg p-6 shadow-lg">
                  <RESEARCH />
                </div>
              </PrivateRoute>
            }
          />
          
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;
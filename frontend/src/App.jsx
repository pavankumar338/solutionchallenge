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

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );
  
  return user ? children : <Navigate to="/" />;
};

const App = () => {
  // Check for mobile device to adjust touch targets
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-800 text-gray-100'>
      <Header>
        <Auth />
      </Header>

      <main className="container mx-auto px-4 py-8 md:py-12">
        <Routes>
          <Route path="/" element={<HERO />} />
          
          <Route 
            path="/health"
            element={
              <PrivateRoute>
                <div className={`bg-white/5 backdrop-blur-lg rounded-xl ${isMobile ? 'p-3' : 'p-4 md:p-6'} shadow-xl border border-white/10`}>
                  <HealthAssistant isMobile={isMobile} />
                </div>
              </PrivateRoute>
            }
          />
          
          <Route 
            path="/edu"
            element={
              <PrivateRoute>
                <div className={`bg-white/5 backdrop-blur-lg rounded-xl ${isMobile ? 'p-3' : 'p-4 md:p-6'} shadow-xl border border-white/10`}>
                  <EDU isMobile={isMobile} />
                </div>
              </PrivateRoute>
            }
          />
          
          <Route 
            path="/research"
            element={
              <PrivateRoute>
                <div className={`bg-white/5 backdrop-blur-lg rounded-xl ${isMobile ? 'p-3' : 'p-4 md:p-6'} shadow-xl border border-white/10`}>
                  <RESEARCH isMobile={isMobile} />
                </div>
              </PrivateRoute>
            }
          />
          
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>

      {/* Mobile-specific footer or navigation */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 bg-gray-800/90 backdrop-blur-sm p-2 flex justify-around items-center border-t border-gray-700">
          {/* Add mobile navigation buttons here */}
        </div>
      )}
    </div>
  );
};

export default App;
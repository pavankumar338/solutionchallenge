import React from 'react';
import HealthAssistant from './HealthAssistant';
import EDU from './EDU';
import HERO from './HERO';
import { Routes, Route } from "react-router-dom";
import Header from './Header'; // Import the Header component
import PrivateRoute from './PrivateRoute';

const App = () => {
  return (
    <div className='bg-gradient-to-r from-slate-500 to-black min-h-screen'>
      {/* Replace the old header with the new Header component */}
      <Header />
      
      <main className="container mx-auto p-4">
        <Routes>
          <Route path="/" element={<HERO />} />
          <Route path="/health" element={
            <PrivateRoute>
              <HealthAssistant />
            </PrivateRoute>
          } />
          <Route path="/edu" element={
            <PrivateRoute>
              <EDU />
            </PrivateRoute>
          } />
        </Routes>
      </main>
    </div>
  );
};

export default App;
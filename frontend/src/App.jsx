import React from 'react';
import HealthAssistant from './HealthAssistant';
import EDU from './EDU';
import HERO from './HERO';
import { Routes, Route } from "react-router-dom";
import Header from './Header';
import RESEARCH from './RESEARCH';

const App = () => {
  return (
    <div className='bg-gradient-to-r from-slate-500 to-black min-h-screen'>
      <Header />
      
      <main className="container mx-auto p-4">
        <Routes>
          <Route path="/" element={<HERO />} />
          <Route path="/health" element={<HealthAssistant />} />
          <Route path="/edu" element={<EDU />} />
          <Route path="/research" element={<RESEARCH />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;
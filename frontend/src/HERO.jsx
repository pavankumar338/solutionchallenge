import React from 'react';
import { Link } from 'react-router-dom';


const HERO = () => {
  return (
    <div className="min-h-screen bg-gradient-to-r from-slate-500 to-black text-white">
     
      
      {/* Hero Content */}
      <main className="container mx-auto px-6 py-20 text-center">
        <h1 className="text-5xl font-bold mb-6">Your Personal Health Companion</h1>
        <p className="text-xl mb-8 max-w-2xl mx-auto">
          Discover personalized health solutions and educational resources tailored just for you.
        </p>
        
        <div className="flex justify-center space-x-4">
          <Link 
            to="/health" 
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition duration-300"
          >
            Get Health Advice
          </Link>
          <Link 
            to="/edu" 
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition duration-300"
          >
            Education
          </Link>
          <Link 
            to="/research" 
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition duration-300"
          >
            Research
          </Link>
        </div>
      </main>
    </div>
  );
};

export default HERO;
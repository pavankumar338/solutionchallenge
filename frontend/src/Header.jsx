import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import Auth from './Auth'; // Import the Auth component

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-black bg-opacity-80 backdrop-blur-sm">
      <div className="container mx-auto px-6 py-2 flex items-center justify-between">
        {/* Logo */}
        <NavLink to="/" className="text-2xl font-bold text-white">
          Health Companion
        </NavLink>

        {/* Mobile menu button */}
        <div className="flex items-center md:order-2">
          <Auth className="hidden md:block" /> {/* Auth for desktop */}
          <button
            className="md:hidden z-10 border-2 border-white rounded-full p-2 flex items-center justify-center ml-4"
            onClick={() => setIsOpen(!isOpen)}
          >
            <span className="text-white">
              {isOpen ? '✕' : '☰'}
            </span>
          </button>
        </div>

        {/* Navigation Links */}
        <nav
          className={`${
            isOpen ? "block" : "hidden"
          } absolute top-full left-0 w-full bg-black bg-opacity-90 md:bg-transparent py-4 md:py-0 md:flex md:static md:w-auto md:space-x-6 md:items-center md:order-1`}
        >
          <NavLink
            to="/"
            className={({isActive}) => `block py-2 px-4 ${isActive ? 'text-blue-400' : 'text-white hover:text-blue-300'} transition-colors duration-300`}
            onClick={() => setIsOpen(false)}
          >
            Home
          </NavLink>
          <NavLink
            to="/health"
            className={({isActive}) => `block py-2 px-4 ${isActive ? 'text-blue-400' : 'text-white hover:text-blue-300'} transition-colors duration-300`}
            onClick={() => setIsOpen(false)}
          >
            Health Assistant
          </NavLink>
          <NavLink
            to="/edu"
            className={({isActive}) => `block py-2 px-4 ${isActive ? 'text-blue-400' : 'text-white hover:text-blue-300'} transition-colors duration-300`}
            onClick={() => setIsOpen(false)}
          >
            Education
          </NavLink>
          <NavLink
            to="/research"
            className={({isActive}) => `block py-2 px-4 ${isActive ? 'text-blue-400' : 'text-white hover:text-blue-300'} transition-colors duration-300`}
            onClick={() => setIsOpen(false)}
          >
            Research
          </NavLink>
          <div className="md:hidden block py-2 px-4"> {/* Auth for mobile */}
            <Auth />
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
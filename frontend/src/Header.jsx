import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import Auth from './Auth';
import { Menu, X, ChevronDown } from 'lucide-react';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  
  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${
      scrolled 
        ? "bg-black bg-opacity-90 backdrop-blur-md shadow-lg py-2" 
        : "bg-black bg-opacity-70 backdrop-blur-sm py-4"
    }`}>
      <div className="container mx-auto px-4 lg:px-8 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <NavLink to="/" className="flex items-center">
            <svg className="w-8 h-8 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
            <span className="ml-2 text-xl font-bold text-white">OmniTask</span>
          </NavLink>
            
        </div>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          <NavLink
            to="/"
            className={({isActive}) => 
              `px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                isActive 
                  ? 'text-blue-400 bg-blue-900 bg-opacity-30' 
                  : 'text-gray-200 hover:text-white hover:bg-white hover:bg-opacity-10'
              }`
            }
          >
            Home
          </NavLink>
          <NavLink
            to="/health"
            className={({isActive}) => 
              `px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                isActive 
                  ? 'text-blue-400 bg-blue-900 bg-opacity-30' 
                  : 'text-gray-200 hover:text-white hover:bg-white hover:bg-opacity-10'
              }`
            }
          >
           Health
          </NavLink>
          <NavLink
            to="/edu"
            className={({isActive}) => 
              `px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                isActive 
                  ? 'text-blue-400 bg-blue-900 bg-opacity-30' 
                  : 'text-gray-200 hover:text-white hover:bg-white hover:bg-opacity-10'
              }`
            }
          >
           Education
          </NavLink>
          <NavLink
            to="/research"
            className={({isActive}) => 
              `px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                isActive 
                  ? 'text-blue-400 bg-blue-900 bg-opacity-30' 
                  : 'text-gray-200 hover:text-white hover:bg-white hover:bg-opacity-10'
              }`
            }
          >
            Research
          </NavLink>
          
          
         
          
        
          
         
          
        </nav>
        
        {/* Auth buttons and mobile menu toggle */}
        <div className="flex items-center space-x-2">
          <Auth className="hidden md:flex" />
          
          <button
            className="md:hidden flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        
        {/* Mobile Navigation Overlay */}
        {isOpen && (
          <div className="md:hidden fixed inset-0 z-50 bg-black bg-opacity-95">
            <div className="container mx-auto px-6 py-8">
              <div className="flex justify-between items-center mb-8">
                <NavLink to="/" className="flex items-center" onClick={() => setIsOpen(false)}>
                  <svg className="w-8 h-8 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                  </svg>
                  <span className="ml-2 text-xl font-bold text-white">INVO AI</span>
                </NavLink>
                <button
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                  onClick={() => setIsOpen(false)}
                  aria-label="Close menu"
                >
                  <X size={20} />
                </button>
              </div>
              
              <nav className="flex flex-col space-y-4">
                <NavLink
                  to="/"
                  className={({isActive}) => 
                    `px-4 py-3 rounded-lg font-medium text-lg transition-all duration-300 ${
                      isActive 
                        ? 'text-blue-400 bg-blue-900 bg-opacity-30' 
                        : 'text-gray-200 hover:text-white hover:bg-white hover:bg-opacity-10'
                    }`
                  }
                  onClick={() => setIsOpen(false)}
                >
                  Home
                </NavLink>

               
              
              </nav>
              
              <div className="mt-8 pt-6 border-t border-gray-800">
                <Auth className="flex flex-col space-y-3 w-full" isMobile={true} />
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
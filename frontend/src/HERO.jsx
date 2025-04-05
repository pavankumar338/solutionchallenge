import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const HERO = () => {
  const [inView, setInView] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    setInView(true);
    document.documentElement.style.scrollBehavior = 'smooth';
    return () => {
      setInView(false);
      document.documentElement.style.scrollBehavior = 'auto';
    }
  }, []);

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 1 } }
  };
  
  const slideUp = {
    hidden: { y: 60, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.7, ease: "easeOut" } }
  };
  
  const popIn = {
    hidden: { scale: 0, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1, 
      transition: { 
        type: "spring", 
        stiffness: 280, 
        damping: 20,
        mass: 1.2
      } 
    }
  };
  
  const drawLine = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: { 
      pathLength: 1, 
      opacity: 0.8, 
      transition: { 
        pathLength: { duration: 1.8, delay: 0.5, ease: "easeInOut" },
        opacity: { duration: 0.6, delay: 0.5 }
      } 
    }
  };
  
  const shimmer = {
    hidden: { backgroundPosition: '0% 0%' },
    visible: { 
      backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
      transition: { 
        repeat: Infinity, 
        repeatType: "loop", 
        duration: 8,
        ease: "easeInOut" 
      } 
    }
  };

  return (
    <motion.div 
      className="bg-gradient-to-br from-slate-50 to-gray-100 w-full min-h-screen flex flex-col items-center justify-center p-8 relative overflow-hidden"
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={fadeIn}
    >
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          className="absolute left-0 top-0 w-full h-full bg-gradient-to-br from-blue-50/30 to-purple-50/30"
          variants={shimmer}
        />
        
        <motion.div 
          className="absolute right-0 top-0 w-64 h-64 bg-gradient-to-br from-pink-200/20 to-purple-200/20 blur-3xl rounded-full"
          animate={{ 
            x: [0, 10, 0], 
            y: [0, -10, 0],
            scale: [1, 1.05, 1],
            transition: { duration: 12, repeat: Infinity, repeatType: "reverse" }
          }}
        />
        
        <motion.div 
          className="absolute left-0 bottom-0 w-96 h-96 bg-gradient-to-tr from-cyan-200/20 to-blue-200/20 blur-3xl rounded-full"
          animate={{ 
            x: [0, -20, 0], 
            y: [0, 15, 0],
            scale: [1, 1.08, 1],
            transition: { duration: 15, repeat: Infinity, repeatType: "reverse", delay: 2 }
          }}
        />
        
        <motion.div 
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-3xl max-h-3xl bg-gradient-to-tr from-purple-100/10 to-pink-100/10 blur-3xl rounded-full"
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3],
            transition: { duration: 10, repeat: Infinity, repeatType: "reverse" }
          }}
        />
      </div>
      
      {/* Header section */}
      <motion.div 
        className="mb-16 text-center relative z-10"
        variants={slideUp}
        transition={{ delay: 0.2 }}
      >
        <div className="flex flex-col items-center">
          <motion.div
            className="mb-3 px-6 py-2 bg-white/60 backdrop-blur-sm rounded-full shadow-sm"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 25, delay: 0.4 }}
          >
            <span className="text-sm font-medium text-indigo-600">Interactive Platform Explorer</span>
          </motion.div>
          
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-4">
            <motion.span 
              className="text-gray-800 inline-block"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              Welcome to 
            </motion.span>{" "}
            <motion.span 
              className="bg-gradient-to-r from-purple-600 to-pink-500 text-transparent bg-clip-text font-extrabold inline-block"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.7 }}
            >
              Our Platform
            </motion.span>
          </h1>
          
          <motion.p 
            className="mt-4 text-gray-600 max-w-xl mx-auto text-lg"
            variants={fadeIn}
            transition={{ delay: 0.9 }}
          >
            Navigate through our interactive diagram to explore all services and resources available to you
          </motion.p>
          
          <motion.div
            className="mt-6 flex space-x-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
          >
            <button 
              className="px-6 py-2 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              onClick={() => document.getElementById('diagram').scrollIntoView()}
            >
              Explore Now
            </button>
            <button 
              className="px-6 py-2 rounded-full bg-white text-purple-600 font-medium border border-purple-200 shadow-sm hover:shadow hover:-translate-y-1 transition-all duration-300"
              onClick={() => navigate('/about')}
            >
              Learn More
            </button>
          </motion.div>
        </div>
      </motion.div>
      
      {/* Main diagram content */}
      <div id="diagram" className="relative w-full max-w-4xl mx-auto flex flex-col items-center z-10 mt-6">
        {/* Top description box - Home/Overview */}
        <motion.div 
          className="mb-8 relative z-20"
          variants={slideUp}
          transition={{ delay: 0.8 }}
        >
          <motion.div 
            className="bg-white/90 backdrop-blur-sm border border-indigo-100 rounded-xl p-5 shadow-md hover:shadow-xl w-72 cursor-pointer transition-all duration-300"
            whileHover={{ 
              y: -5,
              boxShadow: "0 15px 30px -5px rgba(79, 70, 229, 0.15), 0 10px 10px -5px rgba(79, 70, 229, 0.1)"
            }}
            onClick={() => navigate('/')}
          >
            <div className="flex items-center justify-center mb-3">
              <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-indigo-600">
                  <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69z" />
                  <path d="M12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75v4.5a.75.75 0 01-.75.75H5.625a1.875 1.875 0 01-1.875-1.875v-6.198c.03-.028.061-.056.091-.086L12 5.43z" />
                </svg>
              </div>
            </div>
            <h3 className="font-semibold text-center text-gray-800 mb-1">Dashboard & Overview</h3>
            <p className="text-indigo-600 text-center text-sm">
              Platform features and navigation hub
            </p>
          </motion.div>
          
          {/* Connector line to cyan bubble */}
          <div className="flex justify-center">
            <motion.div 
              className="relative h-12 w-px bg-gradient-to-b from-indigo-400 to-cyan-500"
              initial={{ height: 0 }}
              animate={{ height: "3rem" }}
              transition={{ duration: 0.6, delay: 1.0 }}
            >
              <motion.div 
                className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-indigo-400 rounded-full shadow-md shadow-indigo-200"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1.1 }}
              />
              <motion.div 
                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-cyan-500 rounded-full shadow-md shadow-cyan-200"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1.2 }}
              />
            </motion.div>
          </div>
        </motion.div>
        
        {/* Center cyan circle - Home/Overview */}
        <motion.div 
          className="relative mb-20 z-20"
          variants={popIn}
          transition={{ delay: 1.2 }}
        >
          <motion.div 
            className="w-28 h-28 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg hover:shadow-xl cursor-pointer overflow-hidden transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            animate={{
              boxShadow: ["0 10px 15px -3px rgba(6, 182, 212, 0.3)", "0 15px 25px -5px rgba(6, 182, 212, 0.4)", "0 10px 15px -3px rgba(6, 182, 212, 0.3)"],
              transition: { duration: 2, repeat: Infinity, repeatType: "reverse" }
            }}
            onClick={() => navigate('/')}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-300/20 to-blue-300/20 animate-pulse" />
            
            <div className="text-white relative flex flex-col items-center justify-center">
              <motion.svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="currentColor" 
                className="w-12 h-12"
                animate={{
                  scale: [1, 1.1, 1],
                  transition: { duration: 2, repeat: Infinity, repeatType: "reverse" }
                }}
              >
                <motion.path 
                  d="M12 15a3 3 0 100-6 3 3 0 000 6z" 
                  animate={{
                    scale: [1, 0.9, 1],
                    transition: { duration: 2, repeat: Infinity, repeatType: "reverse", delay: 0.5 }
                  }}
                />
                <path fillRule="evenodd" d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.487 4.471-5.705 7.697-10.677 7.697-4.97 0-9.186-3.223-10.675-7.69a1.762 1.762 0 010-1.113zM17.25 12a5.25 5.25 0 11-10.5 0 5.25 5.25 0 0110.5 0z" clipRule="evenodd" />
              </motion.svg>
              
              <span className="text-xs font-medium mt-1">EXPLORE</span>
            </div>
          </motion.div>
          
          {/* Decorative rings */}
          <motion.div 
            className="absolute -inset-4 border-2 border-dashed border-cyan-200/60 rounded-full"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.5, duration: 0.6 }}
          />
          <motion.div 
            className="absolute -inset-8 border border-cyan-100/40 rounded-full"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.7, duration: 0.6 }}
          />
        </motion.div>
        
        {/* Lower section with left and right sides */}
        <div className="relative w-full">
          <div className="flex justify-between items-start">
            {/* Left side - Purple section - Health Services */}
            <motion.div 
              className="w-1/3 flex flex-col items-center relative z-20"
              variants={fadeIn}
              transition={{ delay: 1.4 }}
            >
              <motion.div 
                className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-600 to-violet-700 flex items-center justify-center shadow-lg hover:shadow-xl mb-4 cursor-pointer overflow-hidden transition-all duration-300"
                variants={popIn}
                transition={{ delay: 1.6 }}
                whileHover={{ 
                  scale: 1.05,
                  rotate: 5,
                  boxShadow: "0 20px 25px -5px rgba(124, 58, 237, 0.25), 0 10px 10px -5px rgba(124, 58, 237, 0.1)"
                }}
                onClick={() => navigate('/health')}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-violet-400/20 animate-pulse" />
                
                <div className="text-white relative flex flex-col items-center justify-center">
                  <motion.svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 24 24" 
                    fill="currentColor" 
                    className="w-10 h-10"
                    animate={{ 
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, 0, -5, 0],
                      transition: { duration: 5, repeat: Infinity, ease: "easeInOut" }
                    }}
                  >
                    <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                  </motion.svg>
                  
                  <span className="text-xs font-medium mt-1">HEALTH</span>
                </div>
              </motion.div>
              
              <motion.div 
                className="mt-24"
                variants={slideUp}
                transition={{ delay: 1.8 }}
              >
                <motion.div 
                  className="bg-white/90 backdrop-blur-sm border border-purple-100 rounded-xl p-5 shadow-md hover:shadow-xl w-72 cursor-pointer transition-all duration-300"
                  whileHover={{ 
                    y: -5,
                    boxShadow: "0 15px 30px -5px rgba(124, 58, 237, 0.15), 0 10px 10px -5px rgba(124, 58, 237, 0.1)"
                  }}
                  onClick={() => navigate('/health')}
                >
                  <div className="flex items-center justify-center mb-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-purple-600">
                        <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-2.625 6c-.54 0-.828.419-.936.634a1.96 1.96 0 00-.189.866c0 .298.059.605.189.866.108.215.395.634.936.634.54 0 .828-.419.936-.634.13-.26.189-.568.189-.866 0-.298-.059-.605-.189-.866-.108-.215-.395-.634-.936-.634zm4.314.634c.108-.215.395-.634.936-.634.54 0 .828.419.936.634.13.26.189.568.189.866 0 .298-.059.605-.189.866-.108.215-.395.634-.936.634-.54 0-.828-.419-.936-.634a1.96 1.96 0 01-.189-.866c0-.298.059-.605.189-.866zm-4.34 7.964a.75.75 0 01-1.061-1.06 5.236 5.236 0 013.73-1.538 5.236 5.236 0 013.695 1.538.75.75 0 11-1.061 1.06 3.736 3.736 0 00-2.639-1.098 3.736 3.736 0 00-2.664 1.098z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <h3 className="font-semibold text-center text-gray-800 mb-1">Health Services</h3>
                  <p className="text-purple-600 text-center text-sm">
                    Medical resources and wellness programs
                  </p>
                </motion.div>
              </motion.div>
            </motion.div>
            
            {/* Center placeholder */}
            <div className="w-1/3"></div>
            
            {/* Right side - Pink section - Education */}
            <motion.div 
              className="w-1/3 flex flex-col items-center relative z-20"
              variants={fadeIn}
              transition={{ delay: 1.5 }}
            >
              <motion.div 
                className="w-24 h-24 rounded-full bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-lg hover:shadow-xl mb-4 cursor-pointer overflow-hidden transition-all duration-300"
                variants={popIn}
                transition={{ delay: 1.7 }}
                whileHover={{ 
                  scale: 1.05,
                  rotate: -5,
                  boxShadow: "0 20px 25px -5px rgba(219, 39, 119, 0.25), 0 10px 10px -5px rgba(219, 39, 119, 0.1)"
                }}
                onClick={() => navigate('/edu')}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-pink-400/20 to-rose-400/20 animate-pulse" />
                
                <div className="text-white relative flex flex-col items-center justify-center">
                  <motion.svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 24 24" 
                    fill="currentColor" 
                    className="w-10 h-10"
                    animate={{ 
                      y: [0, -3, 0], 
                      transition: { duration: 2, repeat: Infinity, repeatType: "reverse" } 
                    }}
                  >
                    <path d="M11.7 2.805a.75.75 0 01.6 0A60.65 60.65 0 0122.83 8.72a.75.75 0 01-.231 1.337 49.949 49.949 0 00-9.902 3.912l-.003.002-.34.18a.75.75 0 01-.707 0A50.009 50.009 0 007.5 12.174v-.224c0-.131.067-.248.172-.311a54.614 54.614 0 014.653-2.52.75.75 0 00-.65-1.352 56.129 56.129 0 00-4.78 2.589 1.5 1.5 0 00-.82 1.317v.224a6 6 0 003.318 5.376l.04.025c.149.074.39.231.555.325.214.13.405.246.579.347.174.1.332.193.477.273.291.16.51.276.694.345a.75.75 0 01.139.116 8.278 8.278 0 00.229.228z" />
                    <path fillRule="evenodd" d="M15.75 11.25a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zm-8.25-.75a.75.75 0 01.75-.75h4.5a.75.75 0 010 1.5h-4.5a.75.75 0 01-.75-.75z" clipRule="evenodd" />
                  </motion.svg>
                  
                  <span className="text-xs font-medium mt-1">EDUCATION</span>
                </div>
              </motion.div>
              
              <motion.div 
                className="mt-24"
                variants={slideUp}
                transition={{ delay: 1.9 }}
              >
                <motion.div 
                  className="bg-white/90 backdrop-blur-sm border border-pink-100 rounded-xl p-5 shadow-md hover:shadow-xl w-72 cursor-pointer transition-all duration-300"
                  whileHover={{ 
                    y: -5,
                    boxShadow: "0 15px 30px -5px rgba(219, 39, 119, 0.15), 0 10px 10px -5px rgba(219, 39, 119, 0.1)"
                  }}
                  onClick={() => navigate('/edu')}
                >
                  <div className="flex items-center justify-center mb-3">
                    <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-pink-600">
                        <path d="M11.7 2.805a.75.75 0 01.6 0A60.65 60.65 0 0122.83 8.72a.75.75 0 01-.231 1.337 49.949 49.949 0 00-9.902 3.912l-.003.002-.34.18a.75.75 0 01-.707 0A50.009 50.009 0 007.5 12.174v-.224c0-.131.067-.248.172-.311a54.614 54.614 0 014.653-2.52.75.75 0 00-.65-1.352 56.129 56.129 0 00-4.78 2.589 1.5 1.5 0 00-.82 1.317v.224a6 6 0 003.318 5.376l.04.025c.149.074.39.231.555.325.214.13.405.246.579.347.174.1.332.193.477.273.291.16.51.276.694.345a.75.75 0 01.139.116 8.278 8.278 0 00.229.228z" />
                      </svg>
                    </div>
                  </div>
                  <h3 className="font-semibold text-center text-gray-800 mb-1">Education Center</h3>
                  <p className="text-pink-600 text-center text-sm">
                    Learning resources and courses
                  </p>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
          
          {/* Connection lines */}
          <motion.svg 
            className="absolute top-0 left-0 w-full h-full" 
            viewBox="0 0 800 300" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            initial="hidden"
            animate="visible"
          >
            <defs>
              <linearGradient id="purpleGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#7C3AED" />
                <stop offset="100%" stopColor="#8B5CF6" />
              </linearGradient>
              <linearGradient id="pinkGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#EC4899" />
                <stop offset="100%" stopColor="#F472B6" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="2.5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
            
            <motion.path 
              d="M130 70 Q 400 220 670 70" 
              stroke="url(#purpleGradient)" 
              strokeWidth="2.5"
              strokeLinecap="round"
              filter="url(#glow)"
              fill="none" 
              strokeDasharray="0"
              variants={drawLine}
              transition={{ duration: 1.4, delay: 2.0 }}
            />
            <motion.circle 
              cx="130" 
              cy="70" 
              r="5" 
              fill="#7C3AED"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 2.2 }}
            />
            <motion.circle 
              cx="400" 
              cy="130" 
              r="5" 
              fill="#7C3AED"
              initial={{ scale: 0 }}
              animate={{
                scale: 1,
                opacity: [0.6, 1, 0.6],
                transition: { duration: 2, repeat: Infinity, repeatType: "reverse" } 
              }}
              transition={{ delay: 2.4 }}
            />
            
            <motion.path 
              d="M670 70 Q 400 220 130 70" 
              stroke="url(#pinkGradient)" 
              strokeWidth="2.5"
              strokeLinecap="round"
              filter="url(#glow)"
              fill="none" 
              strokeDasharray="0"
              variants={drawLine}
              transition={{ duration: 1.4, delay: 2.1 }}
            />
          <motion.circle 
              cx="670" 
              cy="70" 
              r="5" 
              fill="#EC4899"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 2.3 }}
            />
            <motion.circle 
              cx="400" 
              cy="130" 
              r="5" 
              fill="#EC4899"
              initial={{ scale: 0 }}
              animate={{
                scale: 1,
                opacity: [0.6, 1, 0.6],
                transition: { duration: 2, repeat: Infinity, repeatType: "reverse" } 
              }}
              transition={{ delay: 2.5 }}
            />
          </motion.svg>
        </div>
      </div>
      
      {/* Call to action */}
      <motion.div 
        className="mt-12 text-center relative z-10"
        variants={fadeIn}
        transition={{ delay: 2.2 }}
      >
        <p className="text-gray-600 mb-6">Ready to learn more about our platform?</p>
        <button 
          className="px-6 py-3 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
          onClick={() => navigate('/about')}
        >
          View All Features
        </button>
      </motion.div>
    </motion.div>
  );
};

export default HERO;
import React, { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRobot, faComments, faPuzzlePiece, faCalendarAlt, faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import Prism from 'prismjs';
import 'prismjs/themes/prism.css';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-java';

function EDU() {
  const [selectedFeature, setSelectedFeature] = useState('syncbot');
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatBoxRef = useRef(null);
  
  const features = [
    {
      id: 'syncbot',
      icon: faComments,
      title: 'AI SyncBot',
      description: 'Ask any question',
      placeholder: 'Ask me any question or coding problem!',
      featureDescription: 'Ask any general questions or coding problems'
    },
    {
      id: 'quizzes',
      icon: faPuzzlePiece,
      title: 'Quiz Generator',
      description: 'Create topic quizzes',
      placeholder: 'Enter a topic to generate a quiz',
      featureDescription: 'Enter a topic to generate a quiz'
    },
    {
      id: 'study-planner',
      icon: faCalendarAlt,
      title: 'Study Planner',
      description: 'Exam preparation',
      placeholder: 'Enter a subject for a customized study plan',
      featureDescription: 'Enter a subject to get a personalized study plan'
    }
  ];

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages, isTyping]);
  
  useEffect(() => {
    // Apply syntax highlighting after component updates
    if (messages.length > 0) {
      Prism.highlightAll();
    }
  }, [messages]);
  
  const selectFeature = (feature) => {
    setSelectedFeature(feature.id);
    setMessages([]);
  };
  
  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };
  
  const sendMessage = async () => {
    if (!inputValue.trim()) return;
    
    // Add user message
    const userMessage = {
      text: inputValue,
      sender: 'user'
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);
    
    try {
      // Make actual API call to backend
      const response = await fetch('http://localhost:5000/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          feature: selectedFeature, 
          message: inputValue 
        })
      });
      
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      
      setMessages(prev => [...prev, {
        text: data.response,
        sender: 'bot'
      }]);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, {
        text: `Error: Unable to get response. ${error.message}`,
        sender: 'bot'
      }]);
    } finally {
      setIsTyping(false);
    }
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };
  
  const copyCode = (codeText) => {
    navigator.clipboard.writeText(codeText)
      .then(() => {
        // Could add a toast notification here
        console.log('Code copied to clipboard');
      })
      .catch(err => {
        console.error('Failed to copy code', err);
      });
  };
  
  // Function to render message content with code highlighting
  const renderMessage = (message) => {
    // Check if the message contains code blocks
    if (message.text.includes('```')) {
      const parts = message.text.split(/```(\w+)?\n|```/g);
      return parts.map((part, index) => {
        if (index % 3 === 0) {
          // Regular text
          return <span key={index}>{part}</span>;
        } else if (index % 3 === 1) {
          // Language identifier or empty string
          return null;
        } else {
          // Code block
          const language = parts[index - 1] || 'javascript';
          return (
            <div className="relative bg-gray-900 rounded-lg my-4" key={index}>
              <button 
                className="absolute top-2 right-2 bg-indigo-700 hover:bg-indigo-600 text-white text-xs py-1 px-2 rounded transition duration-300"
                onClick={() => copyCode(part)}
              >
                Copy
              </button>
              <pre className="m-0 p-4 overflow-x-auto">
                <code className={`language-${language}`}>
                  {part}
                </code>
              </pre>
            </div>
          );
        }
      });
    }
    
    // Regular text message
    return message.text;
  };
  
  const currentFeature = features.find(f => f.id === selectedFeature);
  
  return (
    <div className="max-w-4xl mx-auto p-5">
      <div className="flex items-center justify-center gap-4 mb-8 text-center">
        <FontAwesomeIcon icon={faRobot} className="text-4xl text-indigo-600" />
        <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-700 to-indigo-900 text-transparent bg-clip-text">
          Synchyper Chatbot
        </h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        {features.map(feature => (
          <div 
            className={`bg-gray-800 rounded-xl p-5 text-center transition-all duration-300 transform hover:-translate-y-2 hover:shadow-xl hover:border-indigo-600 hover:border-2 cursor-pointer border-2 ${
              selectedFeature === feature.id 
                ? 'bg-indigo-700 text-white border-indigo-500' 
                : 'border-transparent'
            }`}
            key={feature.id}
            onClick={() => selectFeature(feature)}
          >
            <FontAwesomeIcon icon={feature.icon} className="text-3xl mb-3 text-gray-100" />
            <h3 className="text-xl font-semibold mb-1">{feature.title}</h3>
            <p className="text-gray-300">{feature.description}</p>
          </div>
        ))}
      </div>
      
      <div className="text-center mb-5 text-gray-200 animate-fadeIn">
        {currentFeature.featureDescription}
      </div>
      
      <div className="bg-gray-800 rounded-xl p-5 shadow-lg">
        <div 
          ref={chatBoxRef} 
          className="h-96 overflow-y-auto bg-gray-900 rounded-lg p-4 mb-4 relative"
        >
          {messages.length === 0 ? (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center text-gray-500 w-4/5 pointer-events-none">
              <FontAwesomeIcon icon={currentFeature.icon} className="text-5xl mb-4" />
              <h3 className="text-xl font-semibold mb-2">{currentFeature.title}</h3>
              <p>{currentFeature.placeholder}</p>
            </div>
          ) : (
            messages.map((message, index) => (
              <div 
                key={index} 
                className={`max-w-4/5 rounded-lg p-3 mb-3 ${
                  message.sender === 'user' 
                    ? 'bg-indigo-700 text-white ml-auto' 
                    : 'bg-gray-800 text-gray-200'
                }`}
              >
                {renderMessage(message)}
              </div>
            ))
          )}
          
          {isTyping && (
            <div className="bg-gray-800 rounded-lg p-3 mb-3 text-gray-300 flex items-center">
              <span className="inline-block mr-1 animate-pulse">•</span>
              <span className="inline-block mr-1 animate-pulse delay-100">•</span>
              <span className="inline-block mr-2 animate-pulse delay-200">•</span>
              Bot is typing...
            </div>
          )}
        </div>
        
        <div className="flex gap-3">
          <input 
            type="text" 
            value={inputValue}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder={currentFeature.placeholder}
            className="flex-grow p-3 bg-gray-900 border border-indigo-600 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button 
            onClick={sendMessage} 
            title="Send Message"
            className="p-3 bg-indigo-700 text-white rounded-lg hover:bg-indigo-600 transition duration-300"
          >
            <FontAwesomeIcon icon={faPaperPlane} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default EDU;
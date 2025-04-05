import React, { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faRobot, 
  faComments, 
  faPuzzlePiece, 
  faCalendarAlt, 
  faPaperPlane,
  faCopy,
  faCheck,
  faThumbsUp,
  faThumbsDown,
  faCode,
  faFileDownload,
  faShareAlt
} from '@fortawesome/free-solid-svg-icons';
import Prism from 'prismjs';
import 'prismjs/themes/prism-okaidia.css';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-bash';
import 'prismjs/plugins/line-numbers/prism-line-numbers';
import 'prismjs/plugins/line-numbers/prism-line-numbers.css';

function EDU() {
  const [selectedFeature, setSelectedFeature] = useState('syncbot');
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedItems, setCopiedItems] = useState({});
  const [shareMenuOpen, setShareMenuOpen] = useState(null);
  const chatBoxRef = useRef(null);
  const textareaRef = useRef(null);

  const API_BASE = import.meta.env.VITE_API;
  
  const features = [
    {
      id: 'syncbot',
      icon: faComments,
      title: 'AI SyncBot',
      description: 'Ask any question',
      placeholder: 'Ask me any question or coding problem!',
      featureDescription: 'Ask any general questions or coding problems',
      theme: 'bg-indigo-700'
    },
    {
      id: 'quizzes',
      icon: faPuzzlePiece,
      title: 'Quiz Generator',
      description: 'Create topic quizzes',
      placeholder: 'Enter a topic to generate a quiz',
      featureDescription: 'Enter a topic to generate a quiz',
      theme: 'bg-purple-700'
    },
    {
      id: 'study-planner',
      icon: faCalendarAlt,
      title: 'Study Planner',
      description: 'Exam preparation',
      placeholder: 'Enter a subject for a customized study plan',
      featureDescription: 'Enter a subject to get a personalized study plan',
      theme: 'bg-emerald-700'
    }
  ];

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages, isTyping]);
  
  useEffect(() => {
    Prism.highlightAll();
  }, [messages]);
  
  // Auto-resize textarea as content grows
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "44px";
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = 
        Math.min(scrollHeight, 150) + "px";
    }
  }, [inputValue]);
  
  // Click outside to close share menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (shareMenuOpen && !event.target.closest('.share-menu')) {
        setShareMenuOpen(null);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [shareMenuOpen]);
  
  // Set up global handler for copy buttons in bot responses
  useEffect(() => {
    // Function to handle copy button clicks within code-response divs
    const handleCopyCodeResponse = (event) => {
      if (event.target.classList.contains('copy-btn')) {
        const button = event.target;
        const codeBlock = button.closest('.code-block').querySelector('code');
        
        if (codeBlock) {
          const code = codeBlock.textContent;
          
          navigator.clipboard.writeText(code)
            .then(() => {
              const originalText = button.textContent;
              button.textContent = 'Copied!';
              button.classList.add('copied');
              
              setTimeout(() => {
                button.textContent = originalText;
                button.classList.remove('copied');
              }, 2000);
            })
            .catch(err => {
              console.error('Failed to copy text: ', err);
              button.textContent = 'Failed to copy';
              
              setTimeout(() => {
                button.textContent = 'Copy';
              }, 2000);
            });
        }
      }
    };
    
    document.addEventListener('click', handleCopyCodeResponse);
    
    return () => {
      document.removeEventListener('click', handleCopyCodeResponse);
    };
  }, []);
  
  const selectFeature = (feature) => {
    setSelectedFeature(feature.id);
    setMessages([]);
  };
  
  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };
  
  const sendMessage = async () => {
    if (!inputValue.trim()) return;
    
    const userMessage = {
      text: inputValue,
      sender: 'user',
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);
    
    try {
      const response = await fetch(`${API_BASE}/chatbot`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          feature: selectedFeature, 
          message: inputValue,
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || 
          `Server responded with status: ${response.status}`
        );
      }
      
      const data = await response.json();
      
      setMessages(prev => [...prev, {
        text: data.response,
        sender: 'bot',
        timestamp: new Date().toISOString()
      }]);
    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage = error.message.includes('Failed to fetch') 
        ? 'Network error: Please check your connection'
        : `Error: ${error.message}`;
        
      setMessages(prev => [...prev, {
        text: errorMessage,
        sender: 'bot',
        isError: true,
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };
  
  const copyToClipboard = (text, itemId) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        // Set this item as copied
        setCopiedItems(prev => ({ ...prev, [itemId]: true }));
        
        // Remove the copied status after 2 seconds
        setTimeout(() => {
          setCopiedItems(prev => ({ ...prev, [itemId]: false }));
        }, 2000);
      })
      .catch(err => {
        console.error('Failed to copy text', err);
      });
  };
  
  const downloadAsFile = (text, fileName, fileType) => {
    let content = text;
    let type = "text/plain";
    
    if (fileType === 'json') {
      try {
        // Try to pretty-print if it's valid JSON
        content = JSON.stringify(JSON.parse(text), null, 2);
      } catch (e) {
        // If parsing fails, use the original text
        console.warn('Could not parse as JSON, downloading as plain text');
      }
      type = "application/json";
    } else if (fileType === 'html') {
      type = "text/html";
    }
    
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  };
  
  const shareText = async (text, method) => {
    try {
      if (method === 'clipboard') {
        await navigator.clipboard.writeText(text);
        alert('Text copied to clipboard!');
      } else if (method === 'share-api' && navigator.share) {
        await navigator.share({
          title: 'Shared from Synchyper Chatbot',
          text: text
        });
      } else {
        // Fallback for unsupported methods
        alert('Sharing method not supported on this device');
      }
    } catch (error) {
      console.error('Error sharing content:', error);
      alert('Failed to share content');
    }
    
    // Close share menu
    setShareMenuOpen(null);
  };
  
  const toggleShareMenu = (itemId) => {
    setShareMenuOpen(prev => prev === itemId ? null : itemId);
  };
  
  const detectLanguage = (text) => {
    // Simple language detection based on syntax patterns
    if (text.includes('import ') || text.includes('def ') || text.includes('print(')) {
      return 'python';
    } else if (text.includes('function ') || text.includes('const ') || text.includes('let ')) {
      return 'javascript';
    } else if (text.includes('public class') || text.includes('void main')) {
      return 'java';
    } else if (text.includes('SELECT ') || text.includes('FROM ') || text.includes('WHERE ')) {
      return 'sql';
    } else if (text.includes('<!DOCTYPE') || text.includes('<html')) {
      return 'html';
    } else if (text.includes('{') && text.includes('}') && text.includes(':')) {
      return 'css';
    } else if (text.includes('#!/bin/')) {
      return 'bash';
    }
    return 'javascript'; // Default
  };
  
  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const renderMarkdown = (text) => {
    // Process code-response blocks first
    if (text.includes('<div class="code-response">')) {
      return text; // Keep HTML intact for code-response blocks
    }
    
    // Headers
    text = text.replace(/^### (.*$)/gm, '<h3 class="text-xl font-bold mb-2 mt-4">$1</h3>');
    text = text.replace(/^## (.*$)/gm, '<h2 class="text-2xl font-bold mb-3 mt-5">$1</h2>');
    text = text.replace(/^# (.*$)/gm, '<h1 class="text-3xl font-bold mb-4 mt-6">$1</h1>');
    
    // Lists
    text = text.replace(/^\* (.*$)/gm, '<li class="ml-4 list-disc mb-1">$1</li>');
    text = text.replace(/^\d\. (.*$)/gm, '<li class="ml-4 list-decimal mb-1">$1</li>');
    
    // Wrap lists in ul/ol tags
    text = text.replace(/(<li class="ml-4 list-disc mb-1">.*<\/li>)/gs, '<ul class="my-2">$1</ul>');
    text = text.replace(/(<li class="ml-4 list-decimal mb-1">.*<\/li>)/gs, '<ol class="my-2">$1</ol>');
    
    // Links
    text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">$1</a>');
    
    // Bold and italic
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold">$1</strong>');
    text = text.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');
    
    // Inline code
    text = text.replace(/`([^`]+)`/g, '<code class="bg-gray-700 px-1 py-0.5 rounded text-sm font-mono">$1</code>');
    
    // Blockquotes
    text = text.replace(/^> (.*$)/gm, '<blockquote class="border-l-4 border-gray-500 pl-4 my-2 text-gray-400">$1</blockquote>');
    
    // Horizontal rule
    text = text.replace(/^---$/gm, '<hr class="my-4 border-gray-600" />');
    
    // Tables - basic support
    let insideTable = false;
    const lines = text.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith('|') && lines[i].endsWith('|')) {
        if (!insideTable) {
          // Start table
          lines[i] = '<table class="w-full my-4 border-collapse"><thead><tr>' + 
            lines[i].split('|')
              .filter(cell => cell.trim() !== '')
              .map(cell => `<th class="border border-gray-700 p-2">${cell.trim()}</th>`)
              .join('') + 
            '</tr></thead>';
          insideTable = true;
          
          // Skip the separator row
          i++;
          
          // Start tbody
          lines[i] = '<tbody><tr>' + 
            lines[i].split('|')
              .filter(cell => cell.trim() !== '')
              .map(cell => `<td class="border border-gray-700 p-2">${cell.trim()}</td>`)
              .join('') + 
            '</tr>';
        } else {
          // Continue table
          lines[i] = '<tr>' + 
            lines[i].split('|')
              .filter(cell => cell.trim() !== '')
              .map(cell => `<td class="border border-gray-700 p-2">${cell.trim()}</td>`)
              .join('') + 
            '</tr>';
        }
      } else if (insideTable) {
        // End table
        lines[i-1] += '</tbody></table>';
        insideTable = false;
      }
    }
    
    if (insideTable) {
      // Close the table if we reach the end
      lines[lines.length-1] += '</tbody></table>';
    }
    
    return lines.join('\n');
  };
  
  const renderMessageContent = (message, index) => {
    // Generate a unique ID for this message to track copy state
    const messageId = `msg-${index}-${message.timestamp}`;
    
    // Check for HTML code-response blocks first
    if (message.text.includes('<div class="code-response">')) {
      return (
        <div
          className="message-content"
          dangerouslySetInnerHTML={{ __html: message.text }}
        />
      );
    }
    
    // Check for code blocks
    if (message.text.includes('```')) {
      const parts = message.text.split(/```(\w+)?\n|```/g);
      return parts.map((part, i) => {
        if (i % 3 === 0) {
          return <div 
            key={i} 
            className="mb-3 relative group" 
            dangerouslySetInnerHTML={{ __html: renderMarkdown(part) }} 
          />;
        } else if (i % 3 === 1) {
          return null;
        } else {
          const language = parts[i - 1] || detectLanguage(part);
          const codeId = `${messageId}-code-${i}`;
          const fileName = `code-snippet-${index}-${i}.${language === 'javascript' ? 'js' : language}`;
          
          return (
            <div className="relative bg-gray-900 rounded-lg my-4 group" key={i}>
              <div className="flex justify-between items-center bg-gray-800 px-4 py-2 rounded-t-lg">
                <div className="flex items-center">
                  <FontAwesomeIcon icon={faCode} className="mr-2 text-gray-400" />
                  <span className="text-xs text-gray-400 uppercase">{language}</span>
                </div>
                <div className="flex gap-2">
                  <button 
                    className={`text-xs p-1 rounded transition-all flex items-center ${
                      copiedItems[codeId] ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                    onClick={() => copyToClipboard(part, codeId)}
                    title="Copy code"
                  >
                    <FontAwesomeIcon 
                      icon={copiedItems[codeId] ? faCheck : faCopy} 
                      className="mr-1" 
                    />
                    {copiedItems[codeId] ? 'Copied!' : 'Copy'}
                  </button>
                  <button 
                    className="text-xs p-1 rounded transition-all flex items-center bg-gray-700 text-gray-300 hover:bg-gray-600"
                    onClick={() => downloadAsFile(part, fileName, language)}
                    title="Download code"
                  >
                    <FontAwesomeIcon 
                      icon={faFileDownload} 
                      className="mr-1" 
                    />
                    Download
                  </button>
                </div>
              </div>
              <pre className="m-0 p-4 overflow-x-auto line-numbers">
                <code className={`language-${language}`}>
                  {part}
                </code>
              </pre>
            </div>
          );
        }
      });
    }
    
    // Regular text with markdown and copy/share buttons
    return (
      <div className="relative group">
        <div 
          className="message-content" 
          dangerouslySetInnerHTML={{ __html: renderMarkdown(message.text) }} 
        />
        {message.sender === 'bot' && (
          <div className="absolute -top-3 -right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              className={`p-2 rounded-full text-xs transition-all ${
                copiedItems[messageId] ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
              onClick={() => copyToClipboard(message.text, messageId)}
              title="Copy text"
            >
              <FontAwesomeIcon 
                icon={copiedItems[messageId] ? faCheck : faCopy} 
                size="xs" 
              />
            </button>
            <div className="relative share-menu">
              <button
                className="p-2 rounded-full text-xs transition-all bg-gray-700 text-gray-300 hover:bg-gray-600"
                onClick={() => toggleShareMenu(messageId)}
                title="Share"
              >
                <FontAwesomeIcon 
                  icon={faShareAlt} 
                  size="xs" 
                />
              </button>
              
              {shareMenuOpen === messageId && (
                <div className="absolute z-10 right-0 top-8 bg-gray-800 border border-gray-700 rounded-lg p-2 min-w-32 shadow-lg">
                  <ul>
                    <li>
                      <button 
                        className="w-full text-left py-2 px-3 rounded hover:bg-gray-700 text-sm flex items-center"
                        onClick={() => shareText(message.text, 'clipboard')}
                      >
                        <FontAwesomeIcon icon={faCopy} className="mr-2" />
                        Copy to clipboard
                      </button>
                    </li>
                    {navigator.share && (
                      <li>
                        <button 
                          className="w-full text-left py-2 px-3 rounded hover:bg-gray-700 text-sm flex items-center"
                          onClick={() => shareText(message.text, 'share-api')}
                        >
                          <FontAwesomeIcon icon={faShareAlt} className="mr-2" />
                          Share...
                        </button>
                      </li>
                    )}
                    <li>
                      <button 
                        className="w-full text-left py-2 px-3 rounded hover:bg-gray-700 text-sm flex items-center"
                        onClick={() => downloadAsFile(message.text, `synchyper-message-${index}.txt`, 'text')}
                      >
                        <FontAwesomeIcon icon={faFileDownload} className="mr-2" />
                        Download as text
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
        
        {copiedItems[messageId] && (
          <div className="absolute -top-8 right-0 bg-green-600 text-white text-xs px-2 py-1 rounded animate-fade-in-out">
            Copied!
          </div>
        )}
      </div>
    );
  };
  
  const currentFeature = features.find(f => f.id === selectedFeature);
  
  return (
    <div className="max-w-4xl mx-auto p-5">
      <div className="flex items-center justify-center gap-4 mb-8 text-center">
        <FontAwesomeIcon icon={faRobot} className="text-4xl text-indigo-600 animate-bounce" />
        <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-700 via-purple-600 to-indigo-900 text-transparent bg-clip-text">
          Synchyper Chatbot
        </h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        {features.map(feature => (
          <div 
            className={`rounded-xl p-5 text-center transition-all duration-300 transform hover:-translate-y-2 hover:shadow-xl hover:border-2 cursor-pointer border-2 ${
              selectedFeature === feature.id 
                ? `${feature.theme} text-white border-indigo-500 shadow-lg` 
                : 'bg-gray-800 border-transparent hover:border-indigo-500'
            }`}
            key={feature.id}
            onClick={() => selectFeature(feature)}
          >
            <FontAwesomeIcon 
              icon={feature.icon} 
              className={`text-3xl mb-3 ${
                selectedFeature === feature.id ? 'text-white' : 'text-gray-300'
              }`} 
            />
            <h3 className="text-xl font-semibold mb-1">{feature.title}</h3>
            <p className={selectedFeature === feature.id ? 'text-gray-100' : 'text-gray-300'}>
              {feature.description}
            </p>
          </div>
        ))}
      </div>
      
      <div className={`text-center mb-5 p-3 rounded-lg ${
        selectedFeature === 'syncbot' ? 'bg-indigo-900 text-indigo-100' :
        selectedFeature === 'quizzes' ? 'bg-purple-900 text-purple-100' :
        'bg-emerald-900 text-emerald-100'
      } animate-pulse`}>
        {currentFeature.featureDescription}
      </div>
      
      <div className="bg-gray-800 rounded-xl p-5 shadow-lg">
        <div 
          ref={chatBoxRef} 
          className="h-96 overflow-y-auto bg-gray-900 rounded-lg p-4 mb-4 relative scroll-smooth"
        >
          {messages.length === 0 ? (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center text-gray-500 w-4/5 pointer-events-none">
              <FontAwesomeIcon 
                icon={currentFeature.icon} 
                className={`text-5xl mb-4 ${
                  selectedFeature === 'syncbot' ? 'text-indigo-500' :
                  selectedFeature === 'quizzes' ? 'text-purple-500' :
                  'text-emerald-500'
                }`} 
              />
              <h3 className="text-xl font-semibold mb-2">{currentFeature.title}</h3>
              <p>{currentFeature.placeholder}</p>
            </div>
          ) : (
            messages.map((message, index) => (
              <div 
                key={index} 
                className={`max-w-4/5 rounded-lg p-3 mb-3 relative group ${
                  message.sender === 'user' 
                    ? `${currentFeature.theme} text-white ml-auto` 
                    : 'bg-gray-800 text-gray-200'
                }`}
              >
                {renderMessageContent(message, index)}
                
                <div className={`flex items-center mt-1 text-xs ${
                  message.sender === 'user' ? 'justify-end' : 'justify-between'
                }`}>
                  {message.sender === 'bot' && (
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        className="p-1 text-gray-400 hover:text-green-400 transition-colors"
                        title="Helpful"
                      >
                        <FontAwesomeIcon icon={faThumbsUp} />
                      </button>
                      <button 
                        className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                        title="Not helpful"
                      >
                        <FontAwesomeIcon icon={faThumbsDown} />
                      </button>
                    </div>
                  )}
                  <span className="text-gray-500">
                    {formatTimestamp(message.timestamp)}
                  </span>
                </div>
              </div>
            ))
          )}
          
          {isTyping && (
            <div className={`flex items-center p-3 rounded-lg mb-3 ${
              selectedFeature === 'syncbot' ? 'bg-indigo-900' :
              selectedFeature === 'quizzes' ? 'bg-purple-900' :
              'bg-emerald-900'
            } text-gray-300`}>
              <div className="flex space-x-1 mr-3">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
              </div>
              Synchyper is typing...
            </div>
          )}
        </div>
        
        <div className="flex gap-3 items-end">
          <div className="flex-grow relative">
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyPress}
              placeholder={currentFeature.placeholder}
              className="w-full p-3 bg-gray-900 border border-indigo-600 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              rows="1"
              style={{ minHeight: '44px', maxHeight: '150px' }}
            />
            <div className="absolute bottom-2 right-2 text-xs text-gray-500">
              Shift+Enter for new line
            </div>
          </div>
          <button 
            onClick={sendMessage} 
            disabled={!inputValue.trim()}
            title="Send Message"
            className={`p-3 rounded-lg transition duration-300 ${
              inputValue.trim() 
                ? `${currentFeature.theme} hover:bg-opacity-90 text-white` 
                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
            }`}
          >
            <FontAwesomeIcon icon={faPaperPlane} />
          </button>
        </div>
      </div>
      
      {/* Add global styles */}
      <style jsx>{`
        @keyframes fadeInOut {
          0% { opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { opacity: 0; }
        }
        .animate-fade-in-out {
          animation: fadeInOut 2s ease-in-out;
        }
        
        /* Code response styles */
        .code-response {
          background-color: #1e293b;
          border-radius: 0.5rem;
          margin: 1rem 0;
          overflow: hidden;
        }
        
        .code-block {
          position: relative;
        }
        
        .code-block pre {
          margin: 0;
          padding: 1rem;
          overflow-x: auto;
          background-color: #0f172a;
        }
        
        .code-block .copy-btn {
          position: absolute;
          top: 0.5rem;
          right: 0.5rem;
          background-color: #334155;
          color: #e2e8f0;
          border: none;
          border-radius: 0.25rem;
          padding: 0.25rem 0.5rem;
          font-size: 0.75rem;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .code-block .copy-btn:hover {
          background-color: #475569;
          .code-block .copy-btn:hover {
          background-color: #475569;
        }
        
        .code-block .copy-btn.copied {
          background-color: #10b981;
        }
        
        /* Code highlighting override styles */
        .token.comment,
        .token.prolog,
        .token.doctype,
        .token.cdata {
          color: #6b7280;
        }
        
        .token.punctuation {
          color: #e2e8f0;
        }
        
        .token.property,
        .token.tag,
        .token.boolean,
        .token.number,
        .token.constant,
        .token.symbol {
          color: #3b82f6;
        }
        
        .token.selector,
        .token.attr-name,
        .token.string,
        .token.char,
        .token.builtin {
          color: #10b981;
        }
        
        .token.operator,
        .token.entity,
        .token.url,
        .language-css .token.string,
        .style .token.string {
          color: #d946ef;
        }
        
        .token.atrule,
        .token.attr-value,
        .token.keyword {
          color: #8b5cf6;
        }
        
        .token.function,
        .token.class-name {
          color: #f59e0b;
        }
        
        .token.regex,
        .token.important {
          color: #f43f5e;
        }
        
        /* Message content styles */
        .message-content h1,
        .message-content h2,
        .message-content h3 {
          font-weight: 600;
          margin-top: 1rem;
          margin-bottom: 0.5rem;
        }
        
        .message-content p {
          margin-bottom: 0.75rem;
        }
        
        .message-content ul,
        .message-content ol {
          margin-left: 1.5rem;
          margin-bottom: 0.75rem;
        }
        
        .message-content blockquote {
          border-left: 3px solid #4b5563;
          padding-left: 1rem;
          margin: 0.75rem 0;
          color: #9ca3af;
        }
        
        .message-content pre {
          background-color: #1e293b;
          padding: 0.5rem;
          border-radius: 0.25rem;
          overflow-x: auto;
          margin-bottom: 0.75rem;
        }
        
        .message-content code {
          font-family: monospace;
          background-color: #1e293b;
          padding: 0.125rem 0.25rem;
          border-radius: 0.25rem;
        }
      `}</style>
    </div>
  );
}

export default EDU;
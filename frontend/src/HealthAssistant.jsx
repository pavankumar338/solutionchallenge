import React, { useState, useEffect, useRef } from 'react';
import EmergencyServices from './EmergencyServices';

const HealthAssistant = () => {
  const [view, setView] = useState('chat');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [symptoms, setSymptoms] = useState([]);
  const [currentSymptom, setCurrentSymptom] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emergency, setEmergency] = useState(null);
  const [symptomAnalysis, setSymptomAnalysis] = useState(null);
  const [showDietPlan, setShowDietPlan] = useState(false);
  const [dietPlan, setDietPlan] = useState(null);
  const [dietPreferences, setDietPreferences] = useState({
    allergies: '',
    restrictions: '',
    goals: ''
  });
  const messagesEndRef = useRef(null);

  const API_BASE = import.meta.env.VITE_API;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendChatMessage = async () => {
    if (!input.trim()) return;

    const userMessage = {
      text: input,
      sender: 'user',
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE}/mental-health-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: input }),
      });

      const data = await response.json();

      if (data.success) {
        const botMessage = {
          text: data.response,
          sender: 'bot',
          timestamp: new Date().toISOString(),
          sentiment: data.sentiment,
          emergencyGuidance: data.emergency_guidance || null,
          source: data.source,
        };
        setMessages(prev => [...prev, botMessage]);
        
        if (data.sentiment === 'negative') {
          setEmergency({
            message: input,
            advice: [
              "You're not alone - help is available",
              "Reach out to someone you trust right now",
              "This feeling is temporary - hold on"
            ],
            guidance: data.emergency_guidance
          });
        }
      } else {
        throw new Error(data.error || 'Failed to get response');
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = {
        text: "I'm having trouble responding. Please try again later.",
        sender: 'bot',
        timestamp: new Date().toISOString(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const addSymptom = () => {
    if (currentSymptom.trim() && !symptoms.includes(currentSymptom)) {
      setSymptoms(prev => [...prev, currentSymptom.trim()]);
      setCurrentSymptom('');
    }
  };

  const analyzeSymptoms = async () => {
    if (symptoms.length === 0) return;
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE}/analyze-symptoms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ symptoms }),
      });

      const data = await response.json();

      if (data.success) {
        setSymptomAnalysis(data.data);
        setShowDietPlan(false);
      } else {
        setSymptomAnalysis({
          error: data.error || "Failed to analyze symptoms",
          fallbackAdvice: data.fallback_advice || "Please consult a healthcare professional"
        });
      }
    } catch (error) {
      console.error('Analysis error:', error);
      setSymptomAnalysis({
        error: "Failed to analyze symptoms. Please try again later."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateDietPlan = async () => {
    if (!symptoms.length && (!symptomAnalysis || symptomAnalysis.error)) {
      setDietPlan("Please analyze symptoms first");
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch(`${API_BASE}/generate-diet-plan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          symptoms,
          conditions: symptomAnalysis?.conditions?.map(c => c.name) || [],
          allergies: dietPreferences.allergies,
          restrictions: dietPreferences.restrictions,
          goals: dietPreferences.goals
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setDietPlan(data.dietPlan);
        setShowDietPlan(true);
      } else {
        setDietPlan("Failed to generate diet plan. Please try again.");
      }
    } catch (error) {
      console.error('Diet plan error:', error);
      setDietPlan("Error generating diet recommendations");
    } finally {
      setIsLoading(false);
    }
  };

  // Enhanced styling variables
  const primaryColor = 'bg-green-600';
  const primaryHoverColor = 'hover:bg-green-700';
  const secondaryColor = 'bg-blue-600';
  const secondaryHoverColor = 'hover:bg-blue-700';
  const dangerColor = 'bg-red-600';
  const dangerHoverColor = 'hover:bg-red-700';
  const textColor = 'text-gray-800';
  const lightBg = 'bg-gray-50';
  const whiteBg = 'bg-white';
  const rounded = 'rounded-lg';
  const shadow = 'shadow-md';
  const transition = 'transition-all duration-300';

  return (
    <div className={`flex flex-col min-h-screen max-w-4xl mx-auto p-4 ${lightBg}`}>
      {/* Emergency Modal */}
      {emergency && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${whiteBg} ${rounded} p-6 max-w-md w-full ${shadow} animate-fadeIn`}>
            <h3 className="text-xl font-bold text-red-600 mb-2 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Immediate Support Needed
            </h3>
            <p className="mb-4">You mentioned: <span className="font-medium">"{emergency.message}"</span></p>
            <div className="mb-4">
              <h4 className="font-semibold mb-2">Please:</h4>
              <ul className="list-disc pl-5 space-y-1">
                {emergency.advice.map((item, i) => (
                  <li key={i} className="text-gray-700">{item}</li>
                ))}
              </ul>
            </div>
            {emergency.guidance && (
              <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 rounded">
                <p className="text-red-800">{emergency.guidance}</p>
              </div>
            )}
            <button 
              onClick={() => setEmergency(null)}
              className={`w-full ${primaryColor} text-white py-2 ${rounded} ${primaryHoverColor} ${transition} flex items-center justify-center`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              I understand
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="text-center mb-6">
        <h1 className="text-3xl font-bold text-green-800 mb-2 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          Health Companion
        </h1>
        <div className="flex justify-center flex-wrap gap-2 mb-4">
          {['chat', 'symptoms', 'prediction', 'emergency'].map((tab) => (
            <button 
              key={tab}
              onClick={() => setView(tab)} 
              className={`px-4 py-2 ${rounded} capitalize ${transition} ${
                view === tab 
                  ? `${primaryColor} text-white ${shadow}`
                  : `${whiteBg} ${textColor} ${shadow} hover:shadow-lg`
              } flex items-center`}
            >
              {tab === 'chat' && (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              )}
              {tab === 'symptoms' && (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              )}
              {tab === 'emergency' && (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              )}
              {tab.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {view === 'chat' ? (
          <div className="flex flex-col h-full">
            <div className={`flex-1 overflow-y-auto p-4 ${whiteBg} ${rounded} mb-4 shadow-inner`}>
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 p-8 flex flex-col items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  <p className="mb-2">Hello! I'm here to listen and help.</p>
                  <p>Share how you're feeling or ask any health-related questions.</p>
                </div>
              ) : (
                messages.map((msg, index) => (
                  <div 
                    key={index} 
                    className={`flex mb-4 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} ${transition}`}
                  >
                    <div 
                      className={`max-w-xs md:max-w-md lg:max-w-lg ${rounded} p-3 ${shadow} ${
                        msg.isError 
                          ? 'bg-red-100 text-red-800 border-l-4 border-red-500' 
                          : msg.sender === 'user' 
                            ? `${primaryColor} text-white ${shadow}`
                            : `${whiteBg} ${textColor} ${shadow}`
                      } ${transition}`}
                    >
                      <div className="flex items-start">
                        <p className="flex-1">{msg.text}</p>
                        {msg.source === 'Fallback' && (
                          <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">Fallback</span>
                        )}
                      </div>
                      
                      {msg.emergencyGuidance && (
                        <div className="mt-2 p-2 bg-red-50 border-l-4 border-red-500 rounded">
                          <p className="font-semibold flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            Important:
                          </p>
                          <p>{msg.emergencyGuidance}</p>
                        </div>
                      )}
                      
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs opacity-70">
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {msg.sentiment === 'negative' && (
                          <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded-full">
                            Needs attention
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
              {isLoading && (
                <div className="flex justify-start mb-4">
                  <div className={`${whiteBg} ${textColor} ${rounded} p-3 ${shadow} ${transition}`}>
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0s'}}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <form 
              onSubmit={(e) => {
                e.preventDefault();
                sendChatMessage();
              }} 
              className="flex gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="How are you feeling today?"
                disabled={isLoading}
                className={`flex-1 p-3 border border-gray-300 ${rounded} focus:outline-none focus:ring-2 focus:ring-green-500 ${transition}`}
              />
              <button 
                type="submit" 
                disabled={isLoading}
                className={`${primaryColor} text-white px-4 py-2 ${rounded} ${primaryHoverColor} disabled:bg-green-400 ${transition} flex items-center`}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    Send
                  </>
                )}
              </button>
            </form>
          </div>
        ) : view === 'symptoms' ? (
          <div className={`${whiteBg} p-6 ${rounded} ${shadow}`}>
            <h2 className="text-2xl font-bold text-green-800 mb-4 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Symptom Analysis
            </h2>
            <p className="mb-4 text-gray-600">Enter symptoms you're experiencing to get health insights:</p>
            
            <div className="flex gap-2 mb-6">
              <input
                type="text"
                value={currentSymptom}
                onChange={(e) => setCurrentSymptom(e.target.value)}
                placeholder="e.g. headache, nausea, fever"
                onKeyPress={(e) => e.key === 'Enter' && addSymptom()}
                className={`flex-1 p-3 border border-gray-300 ${rounded} focus:outline-none focus:ring-2 focus:ring-green-500 ${transition}`}
              />
              <button 
                onClick={addSymptom}
                className={`${secondaryColor} text-white px-4 py-2 ${rounded} ${secondaryHoverColor} ${transition} flex items-center`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add
              </button>
            </div>
            
            {symptoms.length > 0 && (
              <>
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Your Symptoms:
                  </h3>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {symptoms.map((symptom, index) => (
                      <li 
                        key={index}
                        className={`flex justify-between items-center ${lightBg} p-3 ${rounded} ${shadow} ${transition} hover:shadow-md`}
                      >
                        <span className="font-medium">{symptom}</span>
                        <button 
                          onClick={() => setSymptoms(symptoms.filter((_, i) => i !== index))}
                          className={`text-red-600 hover:text-red-800 ${transition}`}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
                
                {symptomAnalysis && (
                  <div className={`mb-6 p-4 ${lightBg} ${rounded} ${shadow} ${transition}`}>
                    {symptomAnalysis.error ? (
                      <div className="text-red-600">
                        <p>{symptomAnalysis.error}</p>
                        {symptomAnalysis.fallbackAdvice && (
                          <div className="mt-2 p-2 bg-yellow-50 border-l-4 border-yellow-500 rounded">
                            <p>{symptomAnalysis.fallbackAdvice}</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {symptomAnalysis.conditions && (
                          <div>
                            <h4 className="font-semibold flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Possible Conditions:
                            </h4>
                            <ul className="list-disc pl-5 space-y-1 mt-1">
                              {symptomAnalysis.conditions.map((cond, i) => (
                                <li key={i} className="hover:text-green-700 transition-colors">
                                  <strong>{cond.name}</strong> {cond.probability && `(${cond.probability})`}
                                  {cond.description && ` - ${cond.description}`}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {symptomAnalysis.red_flags && (
                          <div>
                            <h4 className="font-semibold text-red-600 flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                              </svg>
                              Red Flags:
                            </h4>
                            <ul className="list-disc pl-5 space-y-1 mt-1">
                              {symptomAnalysis.red_flags.map((flag, i) => (
                                <li key={i} className="text-red-600">{flag}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {symptomAnalysis.recommendations && (
                          <div>
                            <h4 className="font-semibold flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                              </svg>
                              Recommendations:
                            </h4>
                            <ul className="list-disc pl-5 space-y-1 mt-1">
                              {symptomAnalysis.recommendations.map((rec, i) => (
                                <li key={i} className="hover:text-blue-700 transition-colors">{rec}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
                
                <div className="flex flex-col sm:flex-row gap-2">
                  <button 
                    onClick={analyzeSymptoms} 
                    disabled={isLoading}
                    className={`flex-1 ${primaryColor} text-white py-2 ${rounded} ${primaryHoverColor} disabled:bg-green-400 ${transition} flex items-center justify-center`}
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                        </svg>
                        Analyze Symptoms
                      </>
                    )}
                  </button>
                  {symptomAnalysis && !symptomAnalysis.error && (
                    <button
                      onClick={() => setShowDietPlan(!showDietPlan)}
                      className={`flex-1 ${secondaryColor} text-white py-2 ${rounded} ${secondaryHoverColor} ${transition} flex items-center justify-center`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      {showDietPlan ? 'Hide Diet Plan' : 'Show Diet Plan'}
                    </button>
                  )}
                </div>

                {showDietPlan && (
                  <div className="mt-6 space-y-4 animate-fadeIn">
                    {dietPlan ? (
                      <div className={`bg-blue-50 p-4 ${rounded} border border-blue-200 ${shadow} ${transition}`}>
                        <div className="flex justify-between items-center mb-3">
                          <h3 className="text-xl font-semibold text-blue-800 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.701 2.701 0 00-1.5-.454M9 6v2m3-2v2m3-2v2M9 3h.01M12 3h.01M15 3h.01M21 21v-7a2 2 0 00-2-2H5a2 2 0 00-2 2v7h18zm-3-9v-2a2 2 0 00-2-2H8a2 2 0 00-2 2v2h12z" />
                            </svg>
                            Dietary Recommendations
                          </h3>
                          <button 
                            onClick={() => setShowDietPlan(false)}
                            className="text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                        <div className="space-y-4">
                          <div className={`${whiteBg} p-4 ${rounded} ${shadow}`}>
                            <h4 className="font-medium mb-2">Based on your symptoms:</h4>
                            <ul className="list-disc pl-5">
                              {symptoms.map((s, i) => <li key={i}>{s}</li>)}
                            </ul>
                          </div>
                          <div className={`${whiteBg} p-4 ${rounded} ${shadow}`}>
                            <pre className="whitespace-pre-wrap font-sans">{dietPlan}</pre>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Diet Preferences
                        </h3>
                        <div>
                          <label className="block text-sm font-medium mb-1">Allergies</label>
                          <input
                            type="text"
                            value={dietPreferences.allergies}
                            onChange={(e) => setDietPreferences({...dietPreferences, allergies: e.target.value})}
                            className={`w-full p-2 border ${rounded} focus:outline-none focus:ring-2 focus:ring-green-500 ${transition}`}
                            placeholder="e.g., nuts, dairy"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Dietary Restrictions</label>
                          <input
                            type="text"
                            value={dietPreferences.restrictions}
                            onChange={(e) => setDietPreferences({...dietPreferences, restrictions: e.target.value})}
                            className={`w-full p-2 border ${rounded} focus:outline-none focus:ring-2 focus:ring-green-500 ${transition}`}
                            placeholder="e.g., vegetarian, gluten-free"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Health Goals</label>
                          <input
                            type="text"
                            value={dietPreferences.goals}
                            onChange={(e) => setDietPreferences({...dietPreferences, goals: e.target.value})}
                            className={`w-full p-2 border ${rounded} focus:outline-none focus:ring-2 focus:ring-green-500 ${transition}`}
                            placeholder="e.g., weight loss, gut health"
                          />
                        </div>
                        <button
                          onClick={generateDietPlan}
                          disabled={isLoading}
                          className={`w-full ${primaryColor} text-white py-2 ${rounded} ${primaryHoverColor} disabled:bg-gray-400 ${transition} flex items-center justify-center`}
                        >
                          {isLoading ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Generating...
                            </>
                          ) : (
                            <>
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                              </svg>
                              Get Diet Recommendations
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        ) : view === 'prediction' ? (
          <div className={`${whiteBg} p-6 ${rounded} ${shadow} text-center`}>
            <h2 className="text-2xl font-bold text-green-800 mb-4">Prediction Tool</h2>
            <p className="mb-6 text-gray-600">This feature is under development and will be available soon.</p>
            <div className="flex justify-center">
              <div className={`${lightBg} p-4 ${rounded} ${shadow} max-w-md w-full`}>
                <div className="flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <p className="text-gray-700">We're working hard to bring you advanced health prediction capabilities.</p>
                <p className="text-gray-600 mt-2">Check back soon for updates!</p>
              </div>
            </div>
          </div>
        ) : (
          <EmergencyServices />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-6 text-center text-sm text-gray-600">
        <div className={`${whiteBg} p-4 ${rounded} ${shadow}`}>
          <p className="mb-1">ℹ️ Note: This is not a substitute for professional medical advice.</p>
          <p className="flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            In crisis? Contact emergency services immediately.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default HealthAssistant;
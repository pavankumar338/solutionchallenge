import React, { useState, useEffect, useRef } from 'react';
import EmergencyServices from './EmergencyServices';
import Prediction from './Prediction';

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

  // const API_BASE = 'http://localhost:5000/api';
  const API_BASE = import.meta.env.VITE_API


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

  return (
    <div className="flex flex-col min-h-screen max-w-4xl mx-auto p-4 bg-gray-50">
      {emergency && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-red-600 mb-2">🚨 Immediate Support Needed</h3>
            <p className="mb-4">You mentioned: "{emergency.message}"</p>
            <div className="mb-4">
              <h4 className="font-semibold mb-2">Please:</h4>
              <ul className="list-disc pl-5 space-y-1">
                {emergency.advice.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
            <div className="mb-4 p-2 bg-red-100 rounded">
              <p className="text-red-800">{emergency.guidance}</p>
            </div>
            <button 
              onClick={() => setEmergency(null)}
              className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
            >
              I understand
            </button>
          </div>
        </div>
      )}

      <header className="text-center mb-6">
        <h1 className="text-3xl font-bold text-green-800 mb-2">Health Companion</h1>
        <div className="flex justify-center space-x-4 mb-4">
          <button 
            onClick={() => setView('chat')} 
            className={`px-4 py-2 rounded ${view === 'chat' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}
          >
            Chat
          </button>
          <button 
            onClick={() => setView('symptoms')} 
            className={`px-4 py-2 rounded ${view === 'symptoms' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}
          >
            Symptom Checker
          </button>
          <button 
            onClick={() => setView('prediction')} 
            className={`px-4 py-2 rounded ${view === 'prediction' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}
          >
            Prediction Tool
          </button>
          <button 
            onClick={() => setView('emergency')} 
            className={`px-4 py-2 rounded ${view === 'emergency' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}
          >
            Emergency Services
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        {view === 'chat' ? (
          <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto p-4 bg-white rounded-lg mb-4 shadow-inner">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 p-8">
                  <p className="mb-2">Hello! I'm here to listen and help.</p>
                  <p>Share how you're feeling or switch to symptom checker.</p>
                </div>
              ) : (
                messages.map((msg, index) => (
                  <div 
                    key={index} 
                    className={`flex mb-4 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div 
                      className={`max-w-xs md:max-w-md lg:max-w-lg rounded-lg p-3 ${
                        msg.isError ? 'bg-red-100 text-red-800' : 
                        msg.sender === 'user' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-800'
                      }`}
                    >
                      <div className="flex items-start">
                        <p className="flex-1">{msg.text}</p>
                        {msg.source === 'Fallback' && (
                          <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-1 rounded">Fallback</span>
                        )}
                      </div>
                      
                      {msg.emergencyGuidance && (
                        <div className="mt-2 p-2 bg-red-100 text-red-800 rounded">
                          <p className="font-semibold">Important:</p>
                          <p>{msg.emergencyGuidance}</p>
                        </div>
                      )}
                      
                      <span className="text-xs block mt-1 opacity-70">
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
              {isLoading && (
                <div className="flex justify-start mb-4">
                  <div className="bg-gray-200 text-gray-800 rounded-lg p-3">
                    <div className="flex space-x-1">
                      <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></span>
                      <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></span>
                      <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></span>
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
                className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <button 
                type="submit" 
                disabled={isLoading}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-green-400 transition"
              >
                {isLoading ? 'Sending...' : 'Send'}
              </button>
            </form>
          </div>
        ) : view === 'symptoms' ? (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-bold text-green-800 mb-4">Symptom Analysis</h2>
            <p className="mb-4">Enter symptoms you're experiencing:</p>
            
            <div className="flex gap-2 mb-6">
              <input
                type="text"
                value={currentSymptom}
                onChange={(e) => setCurrentSymptom(e.target.value)}
                placeholder="e.g. headache, nausea, fever"
                onKeyPress={(e) => e.key === 'Enter' && addSymptom()}
                className="flex-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <button 
                onClick={addSymptom}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
              >
                Add
              </button>
            </div>
            
            {symptoms.length > 0 && (
              <>
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">Your Symptoms:</h3>
                  <ul className="space-y-2">
                    {symptoms.map((symptom, index) => (
                      <li 
                        key={index}
                        className="flex justify-between items-center bg-gray-100 p-2 rounded"
                      >
                        <span>{symptom}</span>
                        <button 
                          onClick={() => setSymptoms(symptoms.filter((_, i) => i !== index))}
                          className="text-red-600 hover:text-red-800"
                        >
                          ×
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
                
                {symptomAnalysis && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    {symptomAnalysis.error ? (
                      <div className="text-red-600">
                        <p>{symptomAnalysis.error}</p>
                        {symptomAnalysis.fallbackAdvice && (
                          <div className="mt-2 p-2 bg-yellow-100 text-yellow-800 rounded">
                            <p>{symptomAnalysis.fallbackAdvice}</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {symptomAnalysis.conditions && (
                          <div>
                            <h4 className="font-semibold">Possible Conditions:</h4>
                            <ul className="list-disc pl-5 space-y-1 mt-1">
                              {symptomAnalysis.conditions.map((cond, i) => (
                                <li key={i}>
                                  <strong>{cond.name}</strong> {cond.probability && `(${cond.probability})`}
                                  {cond.description && ` - ${cond.description}`}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {symptomAnalysis.red_flags && (
                          <div>
                            <h4 className="font-semibold text-red-600">Red Flags:</h4>
                            <ul className="list-disc pl-5 space-y-1 mt-1">
                              {symptomAnalysis.red_flags.map((flag, i) => (
                                <li key={i} className="text-red-600">{flag}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {symptomAnalysis.recommendations && (
                          <div>
                            <h4 className="font-semibold">Recommendations:</h4>
                            <ul className="list-disc pl-5 space-y-1 mt-1">
                              {symptomAnalysis.recommendations.map((rec, i) => (
                                <li key={i}>{rec}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
                
                <div className="flex gap-2">
                  <button 
                    onClick={analyzeSymptoms} 
                    disabled={isLoading}
                    className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:bg-green-400 transition"
                  >
                    {isLoading ? 'Analyzing...' : 'Analyze Symptoms'}
                  </button>
                  {symptomAnalysis && !symptomAnalysis.error && (
                    <button
                      onClick={() => setShowDietPlan(!showDietPlan)}
                      className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                      {showDietPlan ? 'Hide Diet Plan' : 'Show Diet Plan'}
                    </button>
                  )}
                </div>

                {showDietPlan && (
                  <div className="mt-6 space-y-4">
                    {dietPlan ? (
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <div className="flex justify-between items-center mb-3">
                          <h3 className="text-xl font-semibold text-blue-800">Dietary Recommendations</h3>
                          <button 
                            onClick={() => setShowDietPlan(false)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            ×
                          </button>
                        </div>
                        <div className="space-y-4">
                          <div className="bg-white p-4 rounded shadow">
                            <h4 className="font-medium mb-2">Based on your symptoms:</h4>
                            <ul className="list-disc pl-5">
                              {symptoms.map((s, i) => <li key={i}>{s}</li>)}
                            </ul>
                          </div>
                          <pre className="whitespace-pre-wrap font-sans">{dietPlan}</pre>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Diet Preferences</h3>
                        <div>
                          <label className="block text-sm font-medium mb-1">Allergies</label>
                          <input
                            type="text"
                            value={dietPreferences.allergies}
                            onChange={(e) => setDietPreferences({...dietPreferences, allergies: e.target.value})}
                            className="w-full p-2 border rounded"
                            placeholder="e.g., nuts, dairy"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Dietary Restrictions</label>
                          <input
                            type="text"
                            value={dietPreferences.restrictions}
                            onChange={(e) => setDietPreferences({...dietPreferences, restrictions: e.target.value})}
                            className="w-full p-2 border rounded"
                            placeholder="e.g., vegetarian, gluten-free"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Health Goals</label>
                          <input
                            type="text"
                            value={dietPreferences.goals}
                            onChange={(e) => setDietPreferences({...dietPreferences, goals: e.target.value})}
                            className="w-full p-2 border rounded"
                            placeholder="e.g., weight loss, gut health"
                          />
                        </div>
                        <button
                          onClick={generateDietPlan}
                          disabled={isLoading}
                          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:bg-gray-400"
                        >
                          {isLoading ? 'Generating...' : 'Get Diet Recommendations'}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        ) : view === 'prediction' ? (
          <Prediction />
        ) : (
          <EmergencyServices />
        )}
      </main>

      <footer className="mt-6 text-center text-sm text-gray-600">
        <p>Note: This is not a substitute for professional medical advice.</p>
        <p>In crisis? Contact emergency services immediately.</p>
      </footer>
    </div>
  );
};

export default HealthAssistant;
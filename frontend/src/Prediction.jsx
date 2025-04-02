import React, { useState } from 'react';

const Prediction = () => {
  const [inputValue, setInputValue] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('http://localhost:5001/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ x: inputValue }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Request failed');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message);
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <h2 style={{ color: 'green' }}>Health Prediction</h2>
      
      <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
        <div style={{ marginBottom: '10px' }}>
          <label>
            Input Value:
            <input
              type="number"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              style={{ marginLeft: '10px', padding: '5px' }}
              required
            />
          </label>
        </div>
        <button 
          type="submit" 
          disabled={loading}
          style={{ 
            padding: '8px 15px',
            backgroundColor: loading ? 'gray' : 'green',
            color: 'white',
            border: 'none',
            borderRadius: '4px'
          }}
        >
          {loading ? 'Processing...' : 'Predict'}
        </button>
      </form>

      {error && (
        <div style={{ color: 'red', margin: '10px 0' }}>
          Error: {error}
        </div>
      )}

      {result && (
        <div style={{ marginTop: '20px', border: '1px solid #ddd', padding: '15px' }}>
          <h3>Results</h3>
          <p><strong>Input:</strong> {result.input}</p>
          <p><strong>Prediction:</strong> {result.prediction.toFixed(2)}</p>
          <p><strong>Equation:</strong> {result.equation}</p>
        </div>
      )}
    </div>
  );
};

export default Prediction;
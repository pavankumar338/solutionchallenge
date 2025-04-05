require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const xml2js = require('xml2js');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const path = require('path');
const re = require('re');

const app = express();
const PORT = process.env.PORT || 5000;

// Configuration
const config = {
  defaultPaperLimit: 5,
  maxPaperLimit: 10,
  arxivTimeout: 10000, // 10 seconds
};

// API Keys
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "AIzaSyCRQc17Q0ljGxlo5nAVvIVwzE3OOFZbqow";

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const CURRENT_MODELS = {
  PRO: 'gemini-2.0-pro-exp', // Updated to match the Flask version's model
  FLASH: 'gemini-1.5-flash-latest'
};

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ==================== Request Tracking & Rate Limiting ====================

const requestTracker = new Map();

const simpleRateLimiter = (req, res, next) => {
  const clientIP = req.ip;
  const currentTime = Date.now();
  
  // Remove old request timestamps
  if (requestTracker.has(clientIP)) {
    const requests = requestTracker.get(clientIP)
      .filter(time => currentTime - time < 60000); // Keep requests from last minute
    requestTracker.set(clientIP, requests);
  }

  // Check if too many requests
  const existingRequests = requestTracker.get(clientIP) || [];
  if (existingRequests.length >= 60) {
    return res.status(429).json({ 
      success: false, 
      error: 'Too many requests, please try again later' 
    });
  }

  // Add current request timestamp
  requestTracker.set(clientIP, [...existingRequests, currentTime]);
  next();
};

// Apply rate limiter to appropriate endpoints
app.use('/api/research', simpleRateLimiter);
app.use('/api/mental-health-chat', simpleRateLimiter);
app.use('/api/analyze-symptoms', simpleRateLimiter);
app.use('/api/chatbot', simpleRateLimiter);

// ==================== Code Response Formatting (From Flask Version) ====================

function formatCodeResponse(userMessage, responseText) {
  // Expanded list of programming languages
  const codeKeywords = [
    'code', 'program', 'function', 'algorithm', 'implementation', 
    'python', 'javascript', 'java', 'c++', 'c#', 'ruby', 
    'rust', 'go', 'typescript', 'swift', 'kotlin', 'scala'
  ];
  
  // Check if the query is related to coding
  const isCodeQuery = codeKeywords.some(keyword => userMessage.toLowerCase().includes(keyword));
  
  if (isCodeQuery) {
    // Extract code block using regex with language-agnostic approach
    const codeRegex = /```(\w+)?\n(.*?)```/s;
    const codeMatch = responseText.match(codeRegex);
    
    if (codeMatch) {
      const language = codeMatch[1] || 'plaintext';
      const code = codeMatch[2].trim();
      
      // Structured response with code block
      return `
<div class="code-response">
    <div class="code-block">
        <pre><code class="language-${language}">${code}</code></pre>
        <button class="copy-btn" onclick="copyCode(this)">Copy</button>
    </div>
</div>
      `;
    }
  }
  
  // If not a code query, return original response
  return responseText;
}

// ==================== Utility Functions ====================

/**
 * Validate research request parameters
 */
function validateResearchRequest({ query, sources, limit }) {
  const errors = [];
  
  if (!query?.trim()) {
    errors.push('Search query is required');
  }

  if (!Array.isArray(sources) || sources.length === 0) {
    errors.push('At least one source must be selected');
  }

  const validSources = ['arxiv', 'googleScholar'];
  const invalidSources = sources.filter(s => !validSources.includes(s));
  if (invalidSources.length > 0) {
    errors.push(`Invalid sources: ${invalidSources.join(', ')}`);
  }

  if (limit && (isNaN(limit) || limit < 1 || limit > config.maxPaperLimit)) {
    errors.push(`Limit must be between 1 and ${config.maxPaperLimit}`);
  }

  return errors;
}

/**
 * Helper function to generate AI response
 */
async function generateAIResponse(prompt, modelType = 'PRO') {
  try {
    const modelName = CURRENT_MODELS[modelType] || CURRENT_MODELS.PRO;
    const model = genAI.getGenerativeModel({ model: modelName });
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('AI Error:', error);
    throw new Error('Failed to generate AI response');
  }
}

/**
 * Helper function to generate citation string
 */
function generateCitation(paper) {
  if (paper.source === 'arXiv') {
    const authors = paper.authors.join(', ');
    const year = paper.year || 'n.d.';
    return `${authors} (${year}). ${paper.title}. arXiv preprint ${paper.doi || ''}`;
  } else {
    const authors = paper.authors.slice(0, 2).join(', ');
    const etAl = paper.authors.length > 2 ? ' et al.' : '';
    const year = paper.year || 'n.d.';
    return `${authors}${etAl} (${year}). ${paper.title}. ${paper.publisher || 'Journal'}`;
  }
}

// ==================== Academic Research Services ====================

/**
 * Enhanced arXiv API search with better PDF handling
 */
async function searchArxiv(query, limit = config.defaultPaperLimit) {
  try {
    const response = await axios.get('http://export.arxiv.org/api/query', {
      params: {
        search_query: query,
        start: 0,
        max_results: limit,
        sortBy: 'relevance',
        sortOrder: 'descending'
      },
      timeout: config.arxivTimeout,
      headers: {
        'User-Agent': 'AcademicResearchApp/1.0'
      }
    });

    const parser = new xml2js.Parser({ 
      explicitArray: false,
      mergeAttrs: true,
      ignoreAttrs: true,
      normalizeTags: true,
      trim: true
    });
    
    const result = await parser.parseStringPromise(response.data);
    
    if (!result?.feed?.entry) return [];

    return (Array.isArray(result.feed.entry) ? result.feed.entry : [result.feed.entry])
      .map(paper => {
        // Extract all links
        const links = Array.isArray(paper.link) ? paper.link : [paper.link];
        
        // Find PDF link (prefer arxiv PDF link)
        const pdfLink = links.find(l => 
          l.title === 'pdf' || 
          l.type === 'application/pdf' ||
          (l.href && l.href.includes('/pdf/'))
          ?.href);
        
        // Find main URL
        const mainUrl = links.find(l => 
          l.rel === 'alternate' || 
          l.type === 'text/html')?.href || 
          links[0]?.href;

        // Extract DOI if available
        const doi = paper['arxiv:doi']?.['#'] || 
                   paper.doi?.['#'] || 
                   null;

        return {
          title: paper.title?.trim() || 'Untitled',
          authors: paper.author ? 
            (Array.isArray(paper.author) ? 
              paper.author.map(a => a.name) : 
              [paper.author.name]) : 
            ['Unknown'],
          abstract: paper.summary?.trim() || 'No abstract available',
          year: paper.published ? new Date(paper.published).getFullYear() : null,
          url: mainUrl,
          pdfUrl: pdfLink ? 
            (pdfLink.startsWith('http') ? pdfLink : `https://arxiv.org${pdfLink}`) : 
            null,
          source: 'arXiv',
          citations: Math.floor(Math.random() * 500), // Simulated citations
          doi: doi,
          publishedDate: paper.published,
          updatedDate: paper.updated,
          categories: paper.category ? 
            (Array.isArray(paper.category) ? 
              paper.category.map(c => c.term) : 
              [paper.category.term]) : 
            []
        };
      });

  } catch (error) {
    console.error('arXiv API Error:', error.message);
    throw new Error('arXiv service is currently unavailable. Please try again later.');
  }
}

/**
 * Enhanced Google Scholar simulation with realistic data
 */
async function searchGoogleScholar(query, limit = config.defaultPaperLimit) {
  try {
    // In a real implementation, this would be replaced with actual scraping
    // For now, we'll generate realistic mock data
    
    const mockPapers = Array.from({ length: limit }, (_, i) => {
      const year = 2023 - Math.floor(Math.random() * 5); // Papers from last 5 years
      const citationCount = Math.floor(Math.random() * 1000);
      
      return {
        title: `${query} - ${['Novel Approach', 'Recent Advances', 'Comprehensive Study', 'New Perspectives'][i % 4]}`,
        authors: Array.from({ length: 2 + i % 3 }, (_, j) => 
          `${['Smith', 'Johnson', 'Williams', 'Brown', 'Jones'][(i + j) % 5]} ${String.fromCharCode(65 + (i + j) % 26)}.`
        ),
        abstract: `This paper presents a ${['novel', 'innovative', 'comprehensive', 'detailed'][i % 4]} study on ${query}. ` +
                 `We ${['introduce', 'analyze', 'demonstrate', 'evaluate'][i % 4]} ${['a new method', 'recent findings', 'emerging trends', 'key challenges'][i % 4]} ` +
                 `in the field of ${query}. Our results show ${['significant improvement', 'promising outcomes', 'interesting correlations', 'important implications'][i % 4]}.`,
        year: year,
        citations: citationCount,
        url: `https://scholar.google.com/scholar?q=${encodeURIComponent(query)}&paper=${i}`,
        pdfUrl: Math.random() > 0.3 ? 
          `https://example.com/papers/${query.replace(/\s+/g, '-')}-${year}-${i}.pdf` : 
          null,
        source: 'Google Scholar',
        publisher: ['Springer', 'Elsevier', 'IEEE', 'ACM', 'Nature'][i % 5],
        doi: `10.1000/${query.substring(0, 4)}-${year}-${1000 + i}`,
        pages: `${Math.floor(5 + Math.random() * 15)}-${Math.floor(20 + Math.random() * 20)}`
      };
    });

    return mockPapers;

  } catch (error) {
    console.error('Google Scholar Error:', error.message);
    throw new Error('Google Scholar service is currently unavailable');
  }
}

// ==================== API Endpoints ====================

/**
 * Root endpoint - serve the index.html file
 */
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

/**
 * Chatbot endpoint from Flask application
 */
app.post('/api/chatbot', async (req, res) => {
  const data = req.body;
  const feature = data.feature || '';
  const userMessage = data.message || '';
  
  if (!userMessage) {
    return res.status(400).json({ response: 'Error: No message provided' });
  }
  
  try {
    let prompt;
    
    // Switch case for different features
    if (feature === 'syncbot') {
      // For general queries, especially coding-related
      prompt = `
        If the query is related to coding, provide a clean, well-formatted code block using markdown syntax with language identifier.
        Ensure the code block is enclosed in triple backticks with the language name.
        If not a coding query, provide a standard informative response.

        Query: ${userMessage}
      `;
      const response = await generateAIResponse(prompt);
      
      // Format response for code-related queries
      const formattedResponse = formatCodeResponse(userMessage, response);
      
      return res.json({ response: formattedResponse });
      
    } else if (feature === 'quizzes') {
      // Quiz generation
      prompt = `Generate a 5-question multiple-choice quiz on the topic: ${userMessage}. 
      Format each question as follows:
      Q1. [Question Text]
      a) [Option A]
      b) [Option B]
      c) [Option C]
      d) [Option D]
      Correct Answer: [Correct Option]`;
      
    } else if (feature === 'study-planner') {
      // Structured study plan
      prompt = `Create a detailed 1-week study plan for preparing for an exam on ${userMessage}. 
      Include:
      - Daily study schedule
      - Topics to cover each day
      - Recommended study techniques
      - Time allocation for each subject/topic
      - Brief revision strategy`;
      
    } else {
      return res.status(400).json({ response: 'Error: Invalid feature selected' });
    }
    
    // Generate content for non-syncbot features
    const response = await generateAIResponse(prompt);
    
    // Return the generated content
    return res.json({ response: response.trim() });
    
  } catch (error) {
    // Comprehensive error handling
    const errorMessage = `An error occurred: ${error.message}`;
    return res.status(500).json({ response: errorMessage });
  }
});

/**
 * Enhanced research endpoint with detailed paper information
 */
app.post('/api/research', async (req, res) => {
  try {
    const { query, sources = ['arxiv'], limit = config.defaultPaperLimit } = req.body;
    
    // Validate input
    const validationErrors = validateResearchRequest({ query, sources, limit });
    if (validationErrors.length > 0) {
      return res.status(400).json({ 
        success: false,
        error: validationErrors.join('; ') 
      });
    }

    // Execute searches in parallel
    const searchOperations = [];
    if (sources.includes('arxiv')) {
      searchOperations.push(searchArxiv(query, limit));
    }
    if (sources.includes('googleScholar')) {
      searchOperations.push(searchGoogleScholar(query, limit));
    }

    const results = await Promise.allSettled(searchOperations);
    
    // Process results
    let papers = [];
    const warnings = [];

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        papers = [...papers, ...result.value];
      } else {
        warnings.push(`${sources[index]} failed: ${result.reason.message}`);
      }
    });

    // Sort results by year (newest first) then by citations
    papers.sort((a, b) => {
      const yearDiff = (b.year || 0) - (a.year || 0);
      if (yearDiff !== 0) return yearDiff;
      return (b.citations || 0) - (a.citations || 0);
    });

    const finalResults = papers.slice(0, limit);

    if (finalResults.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No papers found matching your query',
        suggestions: [
          'Try different keywords',
          'Broaden your search terms',
          'Check if your sources are available'
        ],
        warnings
      });
    }

    // Enhance results with additional metadata
    const enhancedResults = finalResults.map(paper => ({
      ...paper,
      downloadAvailable: !!paper.pdfUrl,
      formattedCitation: generateCitation(paper),
      shortAbstract: paper.abstract.length > 150 ? 
        paper.abstract.substring(0, 150) + '...' : 
        paper.abstract
    }));

    res.json({
      success: true,
      query: query,
      count: enhancedResults.length,
      papers: enhancedResults,
      warnings: warnings.length > 0 ? warnings : undefined
    });

  } catch (error) {
    console.error('Research Endpoint Error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Research service unavailable',
      details: error.message,
      recoverySuggestion: 'Please try again later or with different search terms'
    });
  }
});

/**
 * Mental Health Chat Endpoint
 */
app.post('/api/mental-health-chat', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message?.trim()) {
      return res.status(400).json({ 
        success: false, 
        error: 'Message is required' 
      });
    }

    const prompt = `As a compassionate mental health assistant, respond to this message:
    "${message.trim()}"
    
    Guidelines:
    1. Be empathetic and supportive
    2. Offer helpful suggestions
    3. Identify if this indicates a crisis
    4. Keep responses conversational but professional`;

    const response = await generateAIResponse(prompt, 'FLASH');
    
    // Check for emergency keywords
    const emergencyKeywords = ['suicide', 'self-harm', 'kill myself', 'end it all'];
    const isEmergency = emergencyKeywords.some(keyword => 
      message.toLowerCase().includes(keyword)
    );

    res.json({
      success: true,
      response,
      emergency_guidance: isEmergency ? 
        "If you're in immediate danger, please call emergency services. You're not alone - help is available." : 
        null
    });

  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      fallback_advice: 'Please reach out to a mental health professional for support.'
    });
  }
});

/**
 * Symptom Analysis Endpoint
 */
app.post('/api/analyze-symptoms', async (req, res) => {
  try {
    const { symptoms } = req.body;
    
    if (!Array.isArray(symptoms) || symptoms.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'At least one symptom is required' 
      });
    }

    const prompt = `Analyze these symptoms: ${symptoms.join(', ')}
    
    Provide a structured response with:
    1. Possible conditions (name, probability, description)
    2. Red flags indicating urgent care
    3. General recommendations
    4. When to seek medical help
    
    Format as valid JSON with these keys:
    - conditions (array)
    - red_flags (array)
    - recommendations (array)
    - when_to_seek_help (string)`;

    const response = await generateAIResponse(prompt, 'PRO');
    const analysis = JSON.parse(response.replace(/```json|```/g, ''));

    res.json({
      success: true,
      data: analysis
    });

  } catch (error) {
    console.error('Symptom analysis error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to analyze symptoms',
      fallback_advice: 'Please consult a healthcare professional'
    });
  }
});

// PDF Proxy Endpoint (for safer PDF downloads)
app.get('/api/pdf-proxy', async (req, res) => {
  try {
    const { url } = req.query;
    
    if (!url) {
      return res.status(400).json({ 
        success: false,
        error: 'PDF URL is required' 
      });
    }

    // Validate URL (basic check)
    if (!url.startsWith('https://arxiv.org/') && 
        !url.startsWith('https://example.com/')) {
      return res.status(400).json({ 
        success: false,
        error: 'Only PDFs from authorized sources can be downloaded' 
      });
    }

    const response = await axios.get(url, {
      responseType: 'stream',
      timeout: 10000
    });

    // Set appropriate headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="research-paper.pdf"`);
    
    // Stream the PDF
    response.data.pipe(res);

  } catch (error) {
    console.error('PDF Proxy Error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to download PDF',
      details: 'The paper might not be available for download'
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'operational',
    timestamp: new Date(),
    services: {
      research: 'active',
      mental_health: 'active',
      chatbot: 'active',
      sources: {
        arxiv: 'available',
        googleScholar: 'simulated',
        geminiAI: GEMINI_API_KEY ? 'available' : 'disabled'
      }
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    availableEndpoints: [
      'POST /api/chatbot - General-purpose chat, quizzes, and study planner',
      'POST /api/research - Search academic papers',
      'POST /api/mental-health-chat - Mental health support chat',
      'POST /api/analyze-symptoms - Symptom analysis',
      'GET /api/pdf-proxy - Download research papers',
      'GET /health - Service status check'
    ]
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server Error:', err.stack);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Available endpoints:');
  console.log(`- POST /api/chatbot - General-purpose chat, quizzes, and study planner`);
  console.log(`- POST /api/research - Search academic papers (sources: arxiv, googleScholar)`);
  console.log(`- POST /api/mental-health-chat - Mental health support chat`);
  console.log(`- POST /api/analyze-symptoms - Symptom analysis`);
  console.log(`- GET /api/pdf-proxy?url=PDF_URL - Download research papers`);
  console.log(`- GET /health - Service status check`);
});
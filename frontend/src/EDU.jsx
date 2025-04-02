import React, { useState } from 'react';
import axios from 'axios';
import { 
  Container, 
  TextField, 
  Button, 
  Card, 
  CardContent, 
  Typography, 
  Checkbox, 
  FormControlLabel, 
  CircularProgress,
  Chip,
  Box,
  AppBar,
  Toolbar,
  Paper,
  Alert
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function EDU() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sources, setSources] = useState({
    arxiv: true,
    googleScholar: true
  });
  const [error, setError] = useState(null);

  const handleSearch = async () => {
    if (!query.trim()) {
      setError('Please enter a search term');
      return;
    }
    
    setLoading(true);
    setResults([]);
    setError(null);
    
    try {
      const response = await axios.post('http://localhost:5000/api/research', {
        query: query.trim(),
        sources: Object.keys(sources).filter(source => sources[source]),
        limit: 5
      });
      
      if (response.data.error) {
        setError(response.data.error);
      } else {
        setResults(response.data.papers || []);
      }
    } catch (err) {
      console.error('Search error:', err);
      setError(err.response?.data?.message || 'Failed to fetch research papers. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSourceChange = (event) => {
    setSources({
      ...sources,
      [event.target.name]: event.target.checked,
    });
  };

  return (
    <ThemeProvider theme={theme}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Academic Research Assistant
          </Typography>
        </Toolbar>
      </AppBar>
      
      <Container maxWidth="md" sx={{ my: 4 }}>
        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            Search Academic Publications
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField
              fullWidth
              label="Research topic, paper title, or keywords"
              variant="outlined"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setError(null);
              }}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button 
              variant="contained" 
              onClick={handleSearch}
              disabled={loading}
              sx={{ minWidth: 120 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Search'}
            </Button>
          </Box>
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Data Sources:
            </Typography>
            <FormControlLabel
              control={
                <Checkbox
                  checked={sources.arxiv}
                  onChange={handleSourceChange}
                  name="arxiv"
                  color="primary"
                />
              }
              label="arXiv"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={sources.googleScholar}
                  onChange={handleSourceChange}
                  name="googleScholar"
                  color="primary"
                />
              }
              label="Google Scholar"
            />
          </Box>
        </Paper>
        
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
            <Typography variant="body1" sx={{ ml: 2 }}>
              Searching academic databases...
            </Typography>
          </Box>
        )}
        
        {results.length > 0 && (
          <Typography variant="h6" component="h3" gutterBottom>
            Found {results.length} relevant papers:
          </Typography>
        )}
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {results.map((paper, index) => (
            <Card key={`${paper.id || index}`} elevation={2}>
              <CardContent>
                <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {paper.title}
                </Typography>
                
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
                  <Chip 
                    label={paper.source} 
                    size="small" 
                    color="primary"
                    variant="outlined"
                  />
                  {paper.year && (
                    <Chip 
                      label={`${paper.year}`} 
                      size="small" 
                      variant="outlined" 
                    />
                  )}
                  {paper.citations > 0 && (
                    <Chip 
                      label={`${paper.citations} citations`} 
                      size="small" 
                      variant="outlined" 
                    />
                  )}
                </Box>
                
                {paper.authors?.length > 0 && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontStyle: 'italic' }}>
                    {paper.authors.join(', ')}
                  </Typography>
                )}
                
                {paper.abstract && (
                  <Typography variant="body1" paragraph sx={{ mt: 2 }}>
                    {paper.abstract}
                  </Typography>
                )}
                
                <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                  {paper.url && (
                    <Button 
                      variant="outlined" 
                      size="small"
                      href={paper.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      View Paper
                    </Button>
                  )}
                  {paper.pdfUrl && (
                    <Button 
                      variant="contained" 
                      size="small"
                      href={paper.pdfUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      Download PDF
                    </Button>
                  )}
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
        
        {results.length === 0 && !loading && !error && (
          <Paper elevation={0} sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body1">
              Enter a search term to find relevant academic papers
            </Typography>
          </Paper>
        )}
      </Container>
    </ThemeProvider>
  );
}

export default EDU;
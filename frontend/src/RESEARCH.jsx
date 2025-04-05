import React, { useState, useEffect } from 'react';
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
  Alert,
  Fade,
  Grow,
  Slide,
  IconButton,
  Tooltip,
  Divider
} from '@mui/material';
import { createTheme, ThemeProvider, alpha } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import DownloadIcon from '@mui/icons-material/Download';
import ArticleIcon from '@mui/icons-material/Article';
import ScienceIcon from '@mui/icons-material/Science';
import SchoolIcon from '@mui/icons-material/School';
import SortIcon from '@mui/icons-material/Sort';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

const API_BASE = import.meta.env.VITE_API;

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2962ff',
      light: '#768fff',
      dark: '#0039cb',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#6200ea',
      light: '#9d46ff',
      dark: '#0a00b6',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f5f7fa',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 8,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
          },
        },
        contained: {
          '&:hover': {
            transform: 'translateY(-2px)',
            transition: 'all 0.2s ease-in-out',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          overflow: 'hidden',
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 10px 20px rgba(0,0,0,0.12)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        rounded: {
          borderRadius: 12,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
        },
      },
    },
  },
});

function RESEARCH() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sources, setSources] = useState({
    arxiv: true,
    googleScholar: true
  });
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState({});
  const [fadeIn, setFadeIn] = useState(false);
  
  // Control animation on first load
  useEffect(() => {
    setFadeIn(true);
  }, []);

  const handleSearch = async () => {
    if (!query.trim()) {
      setError('Please enter a search term');
      return;
    }
    
    setLoading(true);
    setResults([]);
    setError(null);
    
    try {
      const response = await axios.post(`${API_BASE}/research`, {
        query: query.trim(),
        sources: Object.keys(sources).filter(source => sources[source]),
        limit: 5
      });
      
      if (response.data.error) {
        setError(response.data.error);
      } else {
        // Initialize expanded state for all new results
        const newExpanded = {};
        (response.data.papers || []).forEach((paper, index) => {
          newExpanded[`${paper.id || index}`] = false;
        });
        setExpanded(newExpanded);
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

  const toggleExpand = (id) => {
    setExpanded({
      ...expanded,
      [id]: !expanded[id]
    });
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ flexGrow: 1, minHeight: '100vh', backgroundColor: 'background.default' }}>
        <Fade in={fadeIn} timeout={800}>
          <AppBar position="sticky" elevation={0} sx={{ 
            background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
            borderBottom: '1px solid rgba(255,255,255,0.1)'
          }}>
            <Toolbar>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <ScienceIcon sx={{ mr: 1 }} />
                <Typography variant="h6" component="div">
                  Academic Research Assistant
                </Typography>
              </Box>
            </Toolbar>
          </AppBar>
        </Fade>
        
        <Container maxWidth="md" sx={{ my: 4, pt: 2 }}>
          <Fade in={fadeIn} timeout={1000}>
            <Paper elevation={3} sx={{ 
              p: 4, 
              mb: 4, 
              borderRadius: 3,
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '4px',
                background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
              },
            }}>
              <Typography variant="h5" component="h2" gutterBottom>
                Discover Academic Research
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Search across multiple academic databases to find the most relevant research papers
              </Typography>
              
              {error && (
                <Grow in={!!error}>
                  <Alert 
                    severity="error" 
                    sx={{ mb: 2 }} 
                    onClose={() => setError(null)}
                  >
                    {error}
                  </Alert>
                </Grow>
              )}
              
              <Box sx={{ 
                display: 'flex', 
                gap: 2, 
                mb: 3,
                position: 'relative',
              }}>
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
                  InputProps={{
                    startAdornment: <SearchIcon color="action" sx={{ mr: 1, opacity: 0.6 }} />,
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      transition: 'all 0.3s',
                      '&:hover': {
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                      },
                      '&.Mui-focused': {
                        boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
                      }
                    }
                  }}
                />
                <Button 
                  variant="contained" 
                  onClick={handleSearch}
                  disabled={loading}
                  sx={{ 
                    minWidth: 120,
                    height: 56,
                    boxShadow: '0 4px 12px rgba(41, 98, 255, 0.2)',
                  }}
                >
                  {loading ? <CircularProgress size={24} /> : 'Search'}
                </Button>
              </Box>
              
              <Box sx={{ 
                mb: 2,
                p: 2,
                borderRadius: 2,
                backgroundColor: alpha(theme.palette.primary.main, 0.05),
              }}>
                <Typography variant="subtitle1" gutterBottom sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  fontWeight: 500
                }}>
                  <SchoolIcon sx={{ mr: 1, fontSize: 20 }} />
                  Data Sources:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={sources.arxiv}
                        onChange={handleSourceChange}
                        name="arxiv"
                        color="primary"
                      />
                    }
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body2">arXiv</Typography>
                        <Chip 
                          label="Preprints" 
                          size="small" 
                          sx={{ ml: 1, height: 20, fontSize: '0.7rem' }} 
                        />
                      </Box>
                    }
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
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body2">Google Scholar</Typography>
                        <Chip 
                          label="Citations" 
                          size="small" 
                          sx={{ ml: 1, height: 20, fontSize: '0.7rem' }} 
                        />
                      </Box>
                    }
                  />
                </Box>
              </Box>
            </Paper>
          </Fade>
          
          {loading && (
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center', 
              justifyContent: 'center', 
              my: 8,
              py: 4
            }}>
              <CircularProgress size={48} thickness={4} />
              <Typography variant="body1" sx={{ mt: 2, fontWeight: 500 }}>
                Searching academic databases...
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Retrieving the most relevant papers for your query
              </Typography>
            </Box>
          )}
          
          {results.length > 0 && !loading && (
            <Fade in={true} timeout={800}>
              <Box>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 3 
                }}>
                  <Typography variant="h6" component="h3">
                    Found {results.length} relevant papers
                  </Typography>
                  <Tooltip title="Sort by relevance">
                    <IconButton size="small">
                      <SortIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {results.map((paper, index) => (
                    <Grow
                      in={true}
                      key={`${paper.id || index}`}
                      style={{ transformOrigin: '0 0 0' }}
                      timeout={500 + index * 150}
                    >
                      <Card elevation={2} sx={{
                        position: 'relative',
                        overflow: 'visible',
                        '&::after': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '4px',
                          height: '100%',
                          backgroundColor: theme.palette.primary.main,
                          borderTopLeftRadius: 12,
                          borderBottomLeftRadius: 12,
                        }
                      }}>
                        <CardContent sx={{ p: 3 }}>
                          <Typography variant="h6" component="div" sx={{ 
                            fontWeight: 'bold', 
                            mb: 1,
                            color: theme.palette.primary.dark
                          }}>
                            {paper.title}
                          </Typography>
                          
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                            <Chip 
                              label={paper.source} 
                              size="small" 
                              color="primary"
                              icon={<ArticleIcon fontSize="small" />}
                              sx={{ fontWeight: 500 }}
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
                                icon={<TrendingUpIcon fontSize="small" />}
                                color="secondary"
                              />
                            )}
                          </Box>
                          
                          {paper.authors?.length > 0 && (
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontStyle: 'italic' }}>
                              {paper.authors.join(', ')}
                            </Typography>
                          )}
                          
                          <Divider sx={{ my: 2 }} />
                          
                          {paper.abstract && (
                            <>
                              <Fade in={true}>
                                <Typography variant="body1" paragraph sx={{ 
                                  mt: 2,
                                  mb: 1,
                                  maxHeight: expanded[`${paper.id || index}`] ? 'none' : '100px',
                                  overflow: 'hidden',
                                  position: 'relative',
                                  '&::after': !expanded[`${paper.id || index}`] ? {
                                    content: '""',
                                    position: 'absolute',
                                    bottom: 0,
                                    left: 0,
                                    width: '100%',
                                    height: '40px',
                                    background: 'linear-gradient(rgba(255,255,255,0), rgba(255,255,255,1))',
                                  } : {}
                                }}>
                                  {paper.abstract}
                                </Typography>
                              </Fade>
                              
                              <Button 
                                size="small" 
                                onClick={() => toggleExpand(`${paper.id || index}`)} 
                                endIcon={expanded[`${paper.id || index}`] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                sx={{ mb: 2, fontWeight: 500 }}
                              >
                                {expanded[`${paper.id || index}`] ? 'Show less' : 'Read more'}
                              </Button>
                            </>
                          )}
                          
                          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                            {paper.url && (
                              <Button 
                                variant="outlined" 
                                size="small"
                                href={paper.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                startIcon={<ArticleIcon />}
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
                                startIcon={<DownloadIcon />}
                              >
                                Download PDF
                              </Button>
                            )}
                          </Box>
                        </CardContent>
                      </Card>
                    </Grow>
                  ))}
                </Box>
              </Box>
            </Fade>
          )}
          
          {results.length === 0 && !loading && !error && (
            <Fade in={true} timeout={1000}>
              <Paper elevation={2} sx={{ 
                p: 6, 
                textAlign: 'center',
                borderRadius: 3,
                backgroundColor: alpha(theme.palette.background.paper, 0.8),
                backdropFilter: 'blur(8px)'
              }}>
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <SearchIcon sx={{ fontSize: 60, color: alpha(theme.palette.text.secondary, 0.3), mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Ready to explore research
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Enter a search term to find relevant academic papers
                  </Typography>
                </Box>
              </Paper>
            </Fade>
          )}
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default RESEARCH;
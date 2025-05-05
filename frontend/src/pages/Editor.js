
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import ChatIcon from '@mui/icons-material/Chat';
import GuidelinesViewer from '../components/Guidelines_Viewer'; // Adjust path as needed
import InfoIcon from '@mui/icons-material/Info';
import Tooltip from '@mui/material/Tooltip';
import * as d3 from 'd3';
import Viz from 'viz.js';
import { Autocomplete, TextField } from '@mui/material';
import { Module, render } from 'viz.js/full.render.js';
import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Select,
  MenuItem,
  Grid,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
  Stack,
  CircularProgress,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import CloseIcon from '@mui/icons-material/Close';


const API_URL = process.env.REACT_APP_API_URL;


// Component to render the Graphviz dependency tree
const DependencyTreeViz = ({ tokens }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!tokens || tokens.length === 0 || !containerRef.current) return;

    const dot = generateDotFromTokens(tokens);
    const viz = new Viz({ Module, render });

    viz.renderSVGElement(dot)
      .then(element => {
        while (containerRef.current.firstChild) {
          containerRef.current.removeChild(containerRef.current.firstChild);
        }
        containerRef.current.appendChild(element);
        const svg = d3.select(element);
        svg.attr('width', '100%')
           .attr('height', '100%')
           .attr('preserveAspectRatio', 'xMidYMid meet');
      })
      .catch(error => {
        console.error('Error rendering graph:', error);
      });
  }, [tokens]);

  // Use Paninian columns for the tree visualization
  const generateDotFromTokens = (tokens) => {
    let dotLines = [
      'digraph G {',
      '  rankdir=TB;',
      '  node [shape=box, style=filled, fillcolor=white, fontname="Arial"];',
      '  edge [fontname="Arial", fontsize=10];',
      '  ROOT [label="ROOT", shape=diamond, style=filled, fillcolor=lightgrey];'
    ];

    tokens.forEach(token => {
      dotLines.push(`  node${token.ID} [label="${token.FORM}\\n(${token.UPOS})"];`);
    });

    tokens.forEach(token => {
      // Use HEAD_PANINIAN instead of HEAD
      const head = token.HEAD_PANINIAN === '0' ? 'ROOT' : `node${token.HEAD_PANINIAN}`;
      dotLines.push(`  ${head} -> node${token.ID} [label="${token.DEPREL_PANINIAN || ''}"];`);
    });

    dotLines.push('}');
    return dotLines.join('\n');
  };

  return (
    <Box ref={containerRef} sx={{ width: '100%', height: '100%', overflow: 'auto' }} />
  );
};

const Editor = () => {
  const [allSentences, setAllSentences] = useState([]);
  const [selectedSentence, setSelectedSentence] = useState(null);
  const [editedTokens, setEditedTokens] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deprelOptions, setDeprelOptions] = useState([]);
  const [treeDialogOpen, setTreeDialogOpen] = useState(false);
  const [downloadDialogOpen, setDownloadDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  const [currentFeedback, setCurrentFeedback] = useState({
    sentenceId: null,
    text: ''
  });
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Predefined static DEPREL options
  const STATIC_DEPREL_OPTIONS = [
    "-", "card", "dem", "dur", "extent", "freq", "intf", "jk1",
    "k1", "k1as", "k1s", "k2", "k2g", "k2p", "k2s", "k2as",
    "k3", "k3as", "k4", "k4a", "k4as", "k5", "k5as", "k5prk",
    "k7", "k7a", "k7as", "k7p", "k7t", "krvn", "main", "mk1",
    "mod", "neg", "ord", "pk1", "quant", "quantless", "quantmore",
    "rad", "rask1", "rask2", "rask3", "rask4", "rask5", "rask7",
    "rasnegk1", "rasnegk2", "rbks", "rblak", "rblpk", "rblsk",
    "rcdelim", "rcelab", "rcloc", "rcprop", "rcsamAnakAla", "rd",
    "rdl", "re", "rh", "rhh", "rk", "rmeas", "rn", "rp", "rprop",
    "r6", "rpk", "rs", "rsma", "rsm", "rsk", "rt", "ru", "rv",
    "rvks", "vIpsA", "vkvn"
  ];

  const [guidelinesOpen, setGuidelinesOpen] = useState(false);



  useEffect(() => {
    fetchAllSentences();
  }, []);

  // Reset editedTokens when selecting a new sentence
  useEffect(() => {
    setEditedTokens({});
  }, [selectedSentence?._id]);

  // Update DEPREL options whenever a sentence is selected
  useEffect(() => {
    if (selectedSentence && selectedSentence.tokens) {
      // Extract unique DEPREL values from the current sentence
      const existingDeprels = new Set();
      selectedSentence.tokens.forEach(token => {
        if (token.DEPREL_PANINIAN && token.DEPREL_PANINIAN !== '') {
          existingDeprels.add(token.DEPREL_PANINIAN);
        }
      });

      // Combine existing DEPRELs with static options, removing duplicates
      const combinedOptions = [...existingDeprels, ...STATIC_DEPREL_OPTIONS];
      const uniqueOptions = [...new Set(combinedOptions)].sort();
      
      setDeprelOptions(uniqueOptions);
    }
  }, [selectedSentence]);

  const fetchAllSentences = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/sentences`);
      setAllSentences(res.data);
    } catch (error) {
      console.error('Error fetching sentences:', error);
      showSnackbar('Failed to fetch sentences', 'error');
    }
  };

  const handleDownload = async (format) => {
    try {
      const response = await axios.get(`${API_URL}/api/sentences/download`, {
        params: { format },
        responseType: 'blob' // Important for file downloads
      });

      // Create a download link and trigger it
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `sentences.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      showSnackbar(`Downloaded sentences in ${format} format`, 'success');
    } catch (error) {
      console.error('Error downloading sentences:', error);
      showSnackbar('Failed to download sentences', 'error');
    }
  };

  const handleDeleteAllSentences = async () => {
    try {
      await axios.delete(`${API_URL}/api/sentences`);
      setAllSentences([]);
      setSelectedSentence(null);
      showSnackbar('All sentences deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting sentences:', error);
      showSnackbar('Failed to delete sentences', 'error');
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  const handleOpenGuidelines = () => {
    setGuidelinesOpen(true);
  };
  
  const handleCloseGuidelines = () => {
    setGuidelinesOpen(false);
  };
  


  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await axios.post(`${API_URL}/api/tokens/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      fetchAllSentences();
      if (res.data.sentence_ids?.length > 0) {
        handleSentenceSelect(res.data.sentence_ids[0]);
      }
      showSnackbar('File uploaded successfully', 'success');
    } catch (error) {
      console.error('Error uploading file:', error);
      showSnackbar('Error uploading file', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSentenceSelect = async (sentenceId) => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/sentences/${sentenceId}`);
      setSelectedSentence(res.data);
    } catch (error) {
      console.error('Error fetching sentence details:', error);
      showSnackbar('Failed to fetch sentence details', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (tokenId, field, value) => {
    setEditedTokens(prev => ({
      ...prev,
      [tokenId]: {
        ...prev[tokenId],
        [field]: value
      }
    }));
  };

  const saveChanges = async () => {
    if (!selectedSentence || Object.keys(editedTokens).length === 0) return;

    setSaving(true);
    try {
      const updates = Object.entries(editedTokens).map(([tokenId, changes]) => {
        return axios.put(
          `${API_URL}/api/tokens/${selectedSentence._id}/token/${tokenId}`,
          changes
        );
      });

      await Promise.all(updates);
      
      // Fetch updated sentence data
      const res = await axios.get(`${API_URL}/api/sentences/${selectedSentence._id}`);
      setSelectedSentence(res.data);
      
      // Clear edited tokens
      setEditedTokens({});
      showSnackbar('Changes saved successfully', 'success');
    } catch (error) {
      console.error('Error saving changes:', error);
      showSnackbar('Failed to save changes', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleOpenFeedbackDialog = (sentenceId, currentFeedback = '') => {
    setCurrentFeedback({
      sentenceId,
      text: currentFeedback
    });
    setFeedbackDialogOpen(true);
  };

  const handleCloseFeedbackDialog = () => {
    setFeedbackDialogOpen(false);
    setCurrentFeedback({
      sentenceId: null,
      text: ''
    });
  };

  const handleFeedbackChange = (e) => {
    setCurrentFeedback(prev => ({
      ...prev,
      text: e.target.value
    }));
  };

  const submitFeedback = async () => {
    if (!currentFeedback.sentenceId) return;
  
    setFeedbackLoading(true);
    try {
      const response = await axios.put(
        `${API_URL}/api/sentences/${currentFeedback.sentenceId}/feedback`,
        { feedback: currentFeedback.text }
      );
      
      // Update both allSentences and selectedSentence
      setAllSentences(prev => prev.map(sentence => 
        sentence._id === currentFeedback.sentenceId 
          ? { ...sentence, feedback: currentFeedback.text }
          : sentence
      ));
      
      if (selectedSentence && selectedSentence._id === currentFeedback.sentenceId) {
        setSelectedSentence(prev => ({ 
          ...prev, 
          feedback: currentFeedback.text 
        }));
      }
  
      showSnackbar('Feedback saved successfully', 'success');
      handleCloseFeedbackDialog();
    } catch (error) {
      console.error('Error saving feedback:', error);
      showSnackbar('Failed to save feedback', 'error');
    } finally {
      setFeedbackLoading(false);
    }
  };

  const getTokenValue = (token, field) => {
    // Return edited value if exists, otherwise return original value
    if (editedTokens[token.ID] && editedTokens[token.ID][field] !== undefined) {
      return editedTokens[token.ID][field];
    }
    return token[field] || '';
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleOpenTreeDialog = () => {
    setTreeDialogOpen(true);
  };

  const handleCloseTreeDialog = () => {
    setTreeDialogOpen(false);
  };

  // Check if there are any unsaved changes
  const hasUnsavedChanges = Object.keys(editedTokens).length > 0;

  // Preview tokens for visualization that includes unsaved changes
  const previewTokens = selectedSentence?.tokens 
    ? selectedSentence.tokens.map(token => {
        if (editedTokens[token.ID]) {
          return { ...token, ...editedTokens[token.ID] };
        }
        return token;
      })
    : [];

      

  return (
    <Container maxWidth="xl" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        CoNLL-U Syntax Tree Editor
      </Typography>

      <Stack direction="row" spacing={2} sx={{ mb: 3 }} alignItems="center">
        <LoadingButton
          variant="contained"
          component="label"
          loading={loading}
        >
          Upload CoNLL-U File
          <input type="file" hidden accept=".txt,.conllu" onChange={handleFileChange} />
        </LoadingButton>
        <Typography variant="body2" color="text.secondary">
          Accepts .conllu or .txt format
        </Typography>

       


        <Button 
          variant="contained" 
          color="primary"
          onClick={() => setDownloadDialogOpen(true)}
        >
          Download Sentences
        </Button>
        
        <Button 
          variant="contained" 
          color="error"
          onClick={() => setDeleteDialogOpen(true)}
        >
          Delete All Sentences
        </Button>

        <Tooltip title="View Annotation Guidelines">
  <Button
    variant="contained"
    color="secondary"
    startIcon={<InfoIcon />}
    onClick={() => window.open('/dependencies_manual.pdf', '_blank')}
  >
    Guidelines
  </Button>
</Tooltip>
      
      </Stack>

      <Dialog open={downloadDialogOpen} onClose={() => setDownloadDialogOpen(false)}>
        <DialogTitle>Download Sentences</DialogTitle>
        <DialogContent>
          <Typography>Select download format:</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            handleDownload('txt');
            setDownloadDialogOpen(false);
          }}>
            Download as TXT
          </Button>
          <Button onClick={() => {
            handleDownload('json');
            setDownloadDialogOpen(false);
          }}>
            Download as JSON
          </Button>
          <Button onClick={() => setDownloadDialogOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete ALL sentences? This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleDeleteAllSentences}
            color="error"
            variant="contained"
          >
            Delete All
          </Button>
        </DialogActions>
      </Dialog> 

      {/* Feedback Dialog */}
<Dialog open={feedbackDialogOpen} onClose={handleCloseFeedbackDialog}>
  <DialogTitle>
    Add Feedback for Sentence
    <IconButton
      aria-label="close"
      onClick={handleCloseFeedbackDialog}
      sx={{
        position: 'absolute',
        right: 8,
        top: 8,
        color: (theme) => theme.palette.grey[500],
      }}
    >
      <CloseIcon />
    </IconButton>
  </DialogTitle>
  <DialogContent>
    <TextField
      autoFocus
      margin="dense"
      label="Feedback"
      fullWidth
      variant="outlined"
      multiline
      rows={4}
      value={currentFeedback.text}
      onChange={handleFeedbackChange}
    />
  </DialogContent>
  <DialogActions>
    <Button onClick={handleCloseFeedbackDialog}>Cancel</Button>
    <LoadingButton
      onClick={submitFeedback}
      loading={feedbackLoading}
      variant="contained"
    >
      Save Feedback
    </LoadingButton>
  </DialogActions>
</Dialog>

      {/* Guidelines Viewer Dialog */}

      <GuidelinesViewer open={guidelinesOpen} onClose={handleCloseGuidelines} />
      

      <Grid container spacing={3}>
        <Grid item xs={3}>
          <Paper sx={{ p: 2, height: '100%', overflowY: 'auto' }}>
            <Typography variant="h6">Sentence List</Typography>
            <Divider sx={{ my: 1 }} />
            <List dense>
              {allSentences.length === 0 ? (
                <ListItem><ListItemText primary="No sentences available" /></ListItem>
              ) : (
                allSentences.map(sentence => (
                  <ListItem key={sentence._id} disablePadding>
                  <ListItemButton
                    selected={selectedSentence?._id === sentence._id}
                    onClick={() => handleSentenceSelect(sentence._id)}
                  >
                    <ListItemText 
                      primary={sentence.sent_id || `Sentence ${sentence._id}`} 
                      secondary={sentence.feedback ? `Feedback: ${sentence.feedback}` : null}
                      secondaryTypographyProps={{
                        style: {
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          maxWidth: '200px'
                        }
                      }}
                    />
                    <IconButton
                      edge="end"
                      aria-label="feedback"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenFeedbackDialog(sentence._id, sentence.feedback);
                      }}
                      color={sentence.feedback ? "primary" : "default"}
                      sx={{
                        color: sentence.feedback ? 'primary.main' : 'inherit'
                      }}
                    >
                      <ChatIcon color={sentence.feedback ? "primary" : "inherit"} />
                    </IconButton>
                  </ListItemButton>
                </ListItem>
                )))}
            </List>
          </Paper>
        </Grid>

        <Grid item xs={9}>
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" height="400px">
              <CircularProgress />
            </Box>
          ) : selectedSentence ? (
            <>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, alignItems: 'center' }}>
              <Box>
    <Typography variant="h6">
      {selectedSentence.sent_id ? `Sentence ID: ${selectedSentence.sent_id}` : 'Sentence Details'}
    </Typography>
    {selectedSentence.text && (
      <Typography variant="body1" sx={{ mt: 1 }}>
        {selectedSentence.text}
      </Typography>
    )}
  </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button 
                    variant="outlined" 
                    color="primary" 
                    onClick={handleOpenTreeDialog}
                    disabled={!selectedSentence?.tokens?.length}
                  >
                    Show Tree
                  </Button>
                  <LoadingButton 
                    variant="contained" 
                    color="primary" 
                    onClick={saveChanges}
                    disabled={!hasUnsavedChanges}
                    loading={saving}
                  >
                    Save Changes
                  </LoadingButton>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ width: '100%' }}>
                  <TableContainer component={Paper} elevation={3}>
                    <Table size="small" sx={{ tableLayout: 'auto' }}>
                      <TableHead>
                        <TableRow>
                          <TableCell align="center">ID</TableCell>
                          <TableCell align="center">FORM</TableCell>
                          <TableCell align="center">LEMMA</TableCell>
                          <TableCell align="center">UPOS</TableCell>
                          <TableCell align="center">XPOS</TableCell>
                          <TableCell align="center">FEATS</TableCell>
                          <TableCell align="center">HEAD_PANINIAN</TableCell>
                          <TableCell align="center">DEPREL_PANINIAN</TableCell>
                          <TableCell align="center">HEAD_UD</TableCell>
                          <TableCell align="center">DEPREL_UD</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedSentence.tokens && selectedSentence.tokens.map((token) => {
                          // Check if token has been edited
                          const isEdited = editedTokens[token.ID] !== undefined;
                          
                          return (
                            <TableRow 
                              key={token.ID} 
                              sx={{ 
                                backgroundColor: isEdited ? 'rgba(255, 243, 224, 0.4)' : 'inherit' 
                              }}
                            >
                              <TableCell align="center">{token.ID}</TableCell>
                              <TableCell align="center">{token.FORM}</TableCell>
                              <TableCell align="center">{token.LEMMA}</TableCell>
                              <TableCell align="center">{token.UPOS}</TableCell>
                              <TableCell align="center">{token.XPOS}</TableCell>
                              <TableCell align="center">{token.FEATS}</TableCell>
                              <TableCell align="center">
                                <Select
                                  size="small"
                                  value={getTokenValue(token, 'HEAD_PANINIAN') || "0"}
                                  onChange={(e) => handleInputChange(token.ID, 'HEAD_PANINIAN', e.target.value)}
                                >
                                  {selectedSentence.tokens.map((opt) => (
                                    <MenuItem key={opt.ID} value={opt.ID}>{opt.ID}</MenuItem>
                                  ))}
                                  <MenuItem value="0">0 (root)</MenuItem>
                                </Select>
                              </TableCell>
                              <TableCell align="center">
                                <Autocomplete
                                  size="small"
                                  options={deprelOptions}
                                  value={getTokenValue(token, 'DEPREL_PANINIAN')}
                                  onChange={(e, newValue) => {
                                    handleInputChange(token.ID, 'DEPREL_PANINIAN', newValue || '');
                                  }}
                                  renderInput={(params) => (
                                    <TextField {...params} variant="standard" placeholder="DEPREL" />
                                  )}
                                  sx={{ width: 150 }}
                                  freeSolo
                                />
                              </TableCell>
                              <TableCell align="center">{token.HEAD_UD}</TableCell>
                              <TableCell align="center">{token.DEPREL_UD}</TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              </Box>
            </>
          ) : (
            <Typography variant="body1">
              Please select a sentence from the list or upload a new file
            </Typography>
          )}
        </Grid>
      </Grid>

      {/* Tree Visualization Dialog */}
     {/* Tree Visualization Dialog */}
<Dialog
  open={treeDialogOpen}
  onClose={handleCloseTreeDialog}
  maxWidth="lg"
  fullWidth
  aria-labelledby="dependency-tree-dialog-title"
>
  <DialogTitle id="dependency-tree-dialog-title">
    <Box>
      <Typography variant="h6" component="div">
        Dependency Tree (Paninian View)
        {hasUnsavedChanges && ' - Preview with unsaved changes'}
      </Typography>
      {selectedSentence && (
        <Box sx={{ mt: 1 }}>
          <Typography variant="subtitle1">
            <strong>Sentence ID:</strong> {selectedSentence.sent_id || 'N/A'}
          </Typography>
          {selectedSentence.text && (
            <Typography variant="body1">
              <strong>Text:</strong> {selectedSentence.text}
            </Typography>
          )}
        </Box>
      )}
    </Box>
    <IconButton
      aria-label="close"
      onClick={handleCloseTreeDialog}
      sx={{
        position: 'absolute',
        right: 8,
        top: 8,
      }}
    >
      <CloseIcon />
    </IconButton>
  </DialogTitle>
  <DialogContent dividers sx={{ height: '70vh' }}>
    {previewTokens?.length > 0 ? (
      <DependencyTreeViz tokens={previewTokens} />
    ) : (
      <Typography align="center" variant="body1" sx={{ pt: 10 }}>
        No tokens available to display in tree
      </Typography>
    )}
  </DialogContent>
  <DialogActions>
    <Button onClick={handleCloseTreeDialog}>Close</Button>
  </DialogActions>
</Dialog>

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};



export default Editor;


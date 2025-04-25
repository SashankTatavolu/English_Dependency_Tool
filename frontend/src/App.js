// import React, { useState, useEffect, useRef } from 'react';
// import axios from 'axios';
// import * as d3 from 'd3';
// import Viz from 'viz.js';
// import { Module, render } from 'viz.js/full.render.js';
// import {
//   Container,
//   Typography,
//   Box,
//   Button,
//   Paper,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   Select,
//   MenuItem,
//   Grid,
//   List,
//   ListItem,
//   ListItemButton,
//   ListItemText,
//   Divider,
//   Stack,
//   CircularProgress
// } from '@mui/material';
// import { LoadingButton } from '@mui/lab';

// // Component to render the Graphviz dependency tree
// const DependencyTreeViz = ({ tokens }) => {
//   const containerRef = useRef(null);

//   useEffect(() => {
//     if (!tokens || tokens.length === 0 || !containerRef.current) return;

//     const dot = generateDotFromTokens(tokens);
//     const viz = new Viz({ Module, render });

//     viz.renderSVGElement(dot)
//       .then(element => {
//         while (containerRef.current.firstChild) {
//           containerRef.current.removeChild(containerRef.current.firstChild);
//         }
//         containerRef.current.appendChild(element);
//         const svg = d3.select(element);
//         svg.attr('width', '100%')
//            .attr('height', '100%')
//            .attr('preserveAspectRatio', 'xMidYMid meet');
//       })
//       .catch(error => {
//         console.error('Error rendering graph:', error);
//       });
//   }, [tokens]);

//   const generateDotFromTokens = (tokens) => {
//     let dotLines = [
//       'digraph G {',
//       '  rankdir=TB;',
//       '  node [shape=box, style=filled, fillcolor=white, fontname="Arial"];',
//       '  edge [fontname="Arial", fontsize=10];',
//       '  ROOT [label="ROOT", shape=diamond, style=filled, fillcolor=lightgrey];'
//     ];

//     tokens.forEach(token => {
//       dotLines.push(`  node${token.ID} [label="${token.FORM}\\n(${token.UPOS})"];`);
//     });

//     tokens.forEach(token => {
//       const head = token.HEAD === '0' ? 'ROOT' : `node${token.HEAD}`;
//       dotLines.push(`  ${head} -> node${token.ID} [label="${token.DEPREL || ''}"];`);
//     });

//     dotLines.push('}');
//     return dotLines.join('\n');
//   };

//   return (
//     <Box ref={containerRef} sx={{ width: '100%', height: '100%', overflow: 'auto' }} />
//   );
// };

// const App = () => {
//   const [allSentences, setAllSentences] = useState([]);
//   const [selectedSentence, setSelectedSentence] = useState(null);
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     fetchAllSentences();
//   }, []);

//   const fetchAllSentences = async () => {
//     try {
//       const res = await axios.get('http://localhost:5000/api/sentences');
//       setAllSentences(res.data);
//     } catch (error) {
//       console.error('Error fetching sentences:', error);
//     }
//   };

//   const handleFileChange = async (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     setLoading(true);
//     const formData = new FormData();
//     formData.append('file', file);

//     try {
//       const res = await axios.post('http://localhost:5000/api/tokens/upload', formData, {
//         headers: { 'Content-Type': 'multipart/form-data' },
//       });

//       fetchAllSentences();
//       if (res.data.sentence_ids?.length > 0) {
//         handleSentenceSelect(res.data.sentence_ids[0]);
//       }
//     } catch (error) {
//       console.error('Error uploading file:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSentenceSelect = async (sentenceId) => {
//     setLoading(true);
//     try {
//       const res = await axios.get(`http://localhost:5000/api/sentences/${sentenceId}`);
//       setSelectedSentence(res.data);
//     } catch (error) {
//       console.error('Error fetching sentence details:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDropdownChange = async (tokenId, field, value) => {
//     if (!selectedSentence) return;

//     try {
//       const res = await axios.put(
//         `http://localhost:5000/api/tokens/${selectedSentence._id}/token/${tokenId}`,
//         { [field]: value }
//       );
//       setSelectedSentence(res.data);
//     } catch (error) {
//       console.error('Error updating token:', error);
//     }
//   };

//   return (
//     <Container maxWidth="xl" sx={{ mt: 4 }}>
//       <Typography variant="h4" gutterBottom>
//         CoNLL-U Syntax Tree Editor
//       </Typography>

//       <Stack direction="row" spacing={2} sx={{ mb: 3 }} alignItems="center">
//         <LoadingButton
//           variant="contained"
//           component="label"
//           loading={loading}
//         >
//           Upload CoNLL-U File
//           <input type="file" hidden accept=".txt,.conllu" onChange={handleFileChange} />
//         </LoadingButton>
//         <Typography variant="body2" color="text.secondary">
//           Accepts .conllu or .txt format
//         </Typography>
//       </Stack>

//       <Grid container spacing={3}>
//         <Grid item xs={3}>
//           <Paper sx={{ p: 2, height: '100%', overflowY: 'auto' }}>
//             <Typography variant="h6">Sentence List</Typography>
//             <Divider sx={{ my: 1 }} />
//             <List dense>
//               {allSentences.length === 0 ? (
//                 <ListItem><ListItemText primary="No sentences available" /></ListItem>
//               ) : (
//                 allSentences.map(sentence => (
//                   <ListItem key={sentence._id} disablePadding>
//                     <ListItemButton
//                       selected={selectedSentence?._id === sentence._id}
//                       onClick={() => handleSentenceSelect(sentence._id)}
//                     >
//                       <ListItemText primary={sentence.sent_id || `Sentence ${sentence._id.slice(0, 6)}...`} />
//                     </ListItemButton>
//                   </ListItem>
//                 ))
//               )}
//             </List>
//           </Paper>
//         </Grid>

//         <Grid item xs={9}>
//   {loading ? (
//     <Typography>Loading...</Typography>
//   ) : selectedSentence ? (
//     <>
//       <Typography variant="h6" gutterBottom>
//         {selectedSentence.sent_id ? `Sentence: ${selectedSentence.sent_id}` : 'Sentence Details'}
//       </Typography>

//       <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
//         {/* Table - full width, no scroll */}
//         <Box sx={{ width: '100%' }}>
//           <TableContainer component={Paper} elevation={3}>
//             <Table size="small" sx={{ tableLayout: 'auto' }}>
//               <TableHead>
//                 <TableRow>
//                   {["ID", "FORM", "LEMMA", "UPOS", "XPOS", "FEATS", "HEAD", "DEPREL", "DEPS", "MISC"].map((head) => (
//                     <TableCell key={head} align="center">{head}</TableCell>
//                   ))}
//                 </TableRow>
//               </TableHead>
//               <TableBody>
//                 {selectedSentence.tokens && selectedSentence.tokens.map((token) => (
//                   <TableRow key={token.ID}>
//                     <TableCell align="center">{token.ID}</TableCell>
//                     <TableCell align="center">{token.FORM}</TableCell>
//                     <TableCell align="center">{token.LEMMA}</TableCell>
//                     <TableCell align="center">{token.UPOS}</TableCell>
//                     <TableCell align="center">{token.XPOS}</TableCell>
//                     <TableCell align="center">{token.FEATS}</TableCell>
//                     <TableCell align="center">
//                       <Select
//                         size="small"
//                         value={token.HEAD || "0"}
//                         onChange={(e) => handleDropdownChange(token.ID, 'HEAD', e.target.value)}
//                       >
//                         {selectedSentence.tokens.map((opt) => (
//                           <MenuItem key={opt.ID} value={opt.ID}>{opt.ID}</MenuItem>
//                         ))}
//                         <MenuItem value="0">0 (root)</MenuItem>
//                       </Select>
//                     </TableCell>
//                     <TableCell align="center">
//                       <Select
//                         size="small"
//                         value={token.DEPREL || ""}
//                         onChange={(e) => handleDropdownChange(token.ID, 'DEPREL', e.target.value)}
//                       >
//                         {["nsubj", "obj", "cop", "det", "root", "case", "mark", "amod", "advmod", "conj", "cc", "punct", "obl", "aux", "k1", "k2", "k7", "TAM", "main", "mod"].map((label) => (
//                           <MenuItem key={label} value={label}>{label}</MenuItem>
//                         ))}
//                       </Select>
//                     </TableCell>
//                     <TableCell align="center">{token.DEPS}</TableCell>
//                     <TableCell align="center">{token.MISC}</TableCell>
//                   </TableRow>
//                 ))}
//               </TableBody>
//             </Table>
//           </TableContainer>
//         </Box>

//         {/* Dependency tree */}
//         <Box sx={{ minHeight: 400, mt: 2 }}>
//           <Typography variant="h6">Dependency Tree</Typography>
//           {selectedSentence.tokens?.length > 0 ? (
//             <DependencyTreeViz tokens={selectedSentence.tokens} />
//           ) : (
//             <Typography align="center" variant="body1" sx={{ pt: 10 }}>
//               No tokens available to display in tree
//             </Typography>
//           )}
//         </Box>
//       </Box>
//     </>
//   ) : (
//     <Typography variant="body1">
//       Please select a sentence from the list or upload a new file
//     </Typography>
//   )}
// </Grid>

//       </Grid>
//     </Container>
//   );
// };

// export default App;



import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import Editor from './pages/Editor';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';

const App = () => {
  return (
    <AuthProvider>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route 
          path="/editor" 
          element={
            <ProtectedRoute>
              <Editor />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </AuthProvider>
  );
};

export default App;
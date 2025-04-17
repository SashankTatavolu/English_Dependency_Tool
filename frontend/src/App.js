import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Tree from 'react-d3-tree';
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
  MenuItem
} from '@mui/material';

const App = () => {
  const [sentence, setSentence] = useState(null);

  // Handle file upload
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await axios.post('http://localhost:5000/api/tokens/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('File uploaded successfully:', res.data);
      setSentence({ tokens: res.data.tokens });
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  // Handle dropdown changes for HEAD and DEPREL
  const handleDropdownChange = async (tokenId, field, value) => {
    const res = await axios.put(
      `http://localhost:5000/api/tokens/${sentence._id}/token/${tokenId}`,
      { [field]: value }
    );
    setSentence(res.data);
  };

  // Build the dependency tree
  const buildTree = () => {
    if (!sentence) return null;

    const idToNode = {};
    sentence.tokens.forEach(t => {
      idToNode[t.ID] = { name: `${t.FORM} (${t.DEPREL})`, children: [] };
    });

    let root = null;
    sentence.tokens.forEach(t => {
      if (t.HEAD === '0') root = idToNode[t.ID];
      else idToNode[t.HEAD]?.children.push(idToNode[t.ID]);
    });

    return root ? [root] : [];
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        CoNLL-U Editor
      </Typography>

      <Box sx={{ mb: 3 }}>
        <Button variant="contained" component="label">
          Upload File
          <input type="file" hidden accept=".txt,.conllu" onChange={handleFileChange} />
        </Button>
      </Box>

      {sentence && (
        <>
          <Typography variant="h6" gutterBottom>
            Editable Table
          </Typography>

          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  {["ID", "FORM", "LEMMA", "UPOS", "XPOS", "FEATS", "HEAD", "DEPREL", "DEPS", "MISC"].map((head) => (
                    <TableCell key={head} align="center">{head}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {sentence.tokens.map((token) => (
                  <TableRow key={token.ID}>
                    <TableCell align="center">{token.ID}</TableCell>
                    <TableCell align="center">{token.FORM}</TableCell>
                    <TableCell align="center">{token.LEMMA}</TableCell>
                    <TableCell align="center">{token.UPOS}</TableCell>
                    <TableCell align="center">{token.XPOS}</TableCell>
                    <TableCell align="center">{token.FEATS}</TableCell>
                    <TableCell align="center">
                      <Select
                        size="small"
                        value={token.HEAD}
                        onChange={(e) =>
                          handleDropdownChange(token.ID, 'HEAD', e.target.value)
                        }
                      >
                        {sentence.tokens.map((opt) => (
                          <MenuItem key={opt.ID} value={opt.ID}>{opt.ID}</MenuItem>
                        ))}
                        <MenuItem value={0}>0 (root)</MenuItem>
                      </Select>
                    </TableCell>
                    <TableCell align="center">
                      <Select
                        size="small"
                        value={token.DEPREL}
                        onChange={(e) =>
                          handleDropdownChange(token.ID, 'DEPREL', e.target.value)
                        }
                      >
                        {["nsubj", "obj", "cop", "det", "root", "case", "mark", "amod", "advmod", "conj", "cc", "punct"].map((label, i) => (
                          <MenuItem key={i} value={label}>{label}</MenuItem>
                        ))}
                      </Select>
                    </TableCell>
                    <TableCell align="center">{token.DEPS}</TableCell>
                    <TableCell align="center">{token.MISC}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Typography variant="h6" sx={{ mt: 5 }}>
            Dependency Tree
          </Typography>
          <Box sx={{ border: '1px solid #ccc', height: '500px', mt: 2, p: 2 }}>
            <Tree data={buildTree()} orientation="vertical" />
          </Box>
        </>
      )}
    </Container>
  );
};

export default App;

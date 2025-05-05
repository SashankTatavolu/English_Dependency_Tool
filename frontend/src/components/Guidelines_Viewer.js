import React, { useState } from 'react';
import DescriptionIcon from '@mui/icons-material/Description';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Box,
  Typography,
  Tooltip
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

// PDF Guidelines component
const GuidelinesViewer = ({ open, onClose }) => {
  // You can host your PDF on your server or use a public URL
  // Alternatively, import it through webpack if you want to bundle it with your app
  const pdfUrl = process.env.PUBLIC_URL + '/dependencies_manual.pdf'; // Adjust path based on where you store the PDF
  
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      aria-labelledby="guidelines-dialog-title"
    >
      <DialogTitle id="guidelines-dialog-title">
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <DescriptionIcon sx={{ mr: 1 }} />
          <Typography variant="h6" component="div">
            Annotation Guidelines
          </Typography>
        </Box>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ height: '80vh', p: 0 }}>
        {open && (  // Only render iframe when dialog is open
         <iframe
         src={`${pdfUrl}#view=fitH`}
         title="Guidelines PDF"
         width="100%"
         height="100%"
         style={{ border: 'none' }}
         onError={(e) => {
           e.target.innerHTML = `
             <div style="padding: 20px; text-align: center;">
               <h3>Failed to load PDF</h3>
               <p>Please check if the file exists at: ${pdfUrl}</p>
               <a href="${pdfUrl}" target="_blank">Try opening directly</a>
             </div>
           `;
         }}
       />
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        <Button 
          variant="contained" 
          color="primary" 
          href={pdfUrl} 
          target="_blank"
          download="guidelines.pdf"
        >
          Download PDF
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Export the component to be used in your Editor component
export default GuidelinesViewer;
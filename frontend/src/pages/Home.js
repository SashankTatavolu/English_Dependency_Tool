// src/pages/Home.js
import React from 'react';
import { Link } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Paper,
} from '@mui/material';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import EditIcon from '@mui/icons-material/Edit';

const Home = () => {
  return (
    <Container maxWidth="lg">
      <Box
        sx={{
          my: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography variant="h3" component="h1" gutterBottom>
          Welcome to English Dependency Tree Editor
        </Typography>
        
        <Paper elevation={3} sx={{ p: 4, my: 4, bgcolor: 'primary.light', color: 'white', width: '100%' }}>
          <Typography variant="h5" component="h2" gutterBottom>
            Powerful Visualization and Editing for Dependency Trees
          </Typography>
          <Typography variant="body1" paragraph>
            An intuitive tool for linguists and NLP researchers to visualize, 
            analyze, and edit syntactic dependency structures.
          </Typography>
          <Box sx={{ mt: 2 }}>
            <Button 
              component={Link} 
              to="/register" 
              variant="contained" 
              size="large"
              sx={{ mr: 2, bgcolor: 'white', color: 'primary.main' }}
            >
              Get Started
            </Button>
            <Button 
              component={Link} 
              to="/login" 
              variant="outlined"
              size="large"
              sx={{ color: 'white', borderColor: 'white' }}
            >
              Log In
            </Button>
          </Box>
        </Paper>

        <Grid container spacing={4} sx={{ mt: 2 }}>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                  <AccountTreeIcon sx={{ fontSize: 60, color: 'primary.main' }} />
                </Box>
                <Typography gutterBottom variant="h5" component="h2" align="center">
                  Visualize Dependencies
                </Typography>
                <Typography>
                  Interactive graphical representation of dependency relations. 
                  Easily understand syntactic structures with our visual tree diagrams.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                  <CloudUploadIcon sx={{ fontSize: 60, color: 'primary.main' }} />
                </Box>
                <Typography gutterBottom variant="h5" component="h2" align="center">
                  Import CoNLL-U Files
                </Typography>
                <Typography>
                  Upload your CoNLL-U format files to visualize and edit them. 
                  Support for standard Universal Dependencies formatting.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                  <EditIcon sx={{ fontSize: 60, color: 'primary.main' }} />
                </Box>
                <Typography gutterBottom variant="h5" component="h2" align="center">
                  Edit Dependency Relations
                </Typography>
                <Typography>
                  Easily modify HEAD and DEPREL values. See changes 
                  reflected immediately in the dependency tree visualization.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default Home;
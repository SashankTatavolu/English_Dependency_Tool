// // src/pages/Login.js
// import React, { useState, useContext } from 'react';
// import { useNavigate, Link as RouterLink, useLocation } from 'react-router-dom';
// import {
//   Container,
//   Typography,
//   Box,
//   TextField,
//   Button,
//   Paper,
//   Link,
//   Alert,
//   CircularProgress,
// } from '@mui/material';
// import { AuthContext } from '../contexts/AuthContext';

// const Login = () => {
//   const [formData, setFormData] = useState({
//     email: '',
//     password: '',
//   });
//   const [errors, setErrors] = useState({});
//   const [serverError, setServerError] = useState('');
//   const [loading, setLoading] = useState(false);
  
//   const { login } = useContext(AuthContext);
//   const navigate = useNavigate();
//   const location = useLocation();

//   const handleChange = (e) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value,
//     });
    
//     // Clear field error when user starts typing again
//     if (errors[e.target.name]) {
//       setErrors({
//         ...errors,
//         [e.target.name]: '',
//       });
//     }

//     // Clear server error when user starts typing
//     if (serverError) {
//       setServerError('');
//     }
//   };

//   const validateForm = () => {
//     const newErrors = {};
    
//     if (!formData.email.trim()) {
//       newErrors.email = 'Email is required';
//     }
    
//     if (!formData.password) {
//       newErrors.password = 'Password is required';
//     }
    
//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     if (!validateForm()) return;
    
//     setLoading(true);
//     setServerError('');
    
//     try {
//       const success = await login(formData.email, formData.password);
      
//       if (success) {
//         // Navigate to the page user was trying to access, or to editor by default
//         const redirectPath = location.state?.from?.pathname || '/editor';
//         navigate(redirectPath);
//       } else {
//         setServerError('Invalid email or password');
//       }
//     } catch (error) {
//       setServerError('An unexpected error occurred. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Container component="main" maxWidth="sm">
//       <Box
//         sx={{
//           marginTop: 8,
//           display: 'flex',
//           flexDirection: 'column',
//           alignItems: 'center',
//         }}
//       >
//         <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
//           <Typography component="h1" variant="h5" align="center" gutterBottom>
//             Sign In
//           </Typography>
          
//           {serverError && (
//             <Alert severity="error" sx={{ mb: 2 }}>
//               {serverError}
//             </Alert>
//           )}
          
//           <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
//             <TextField
//               margin="normal"
//               required
//               fullWidth
//               id="email"
//               label="Email Address"
//               name="email"
//               autoComplete="email"
//               autoFocus
//               value={formData.email}
//               onChange={handleChange}
//               error={!!errors.email}
//               helperText={errors.email}
//               disabled={loading}
//             />
//             <TextField
//               margin="normal"
//               required
//               fullWidth
//               name="password"
//               label="Password"
//               type="password"
//               id="password"
//               autoComplete="current-password"
//               value={formData.password}
//               onChange={handleChange}
//               error={!!errors.password}
//               helperText={errors.password}
//               disabled={loading}
//             />
//             <Button
//               type="submit"
//               fullWidth
//               variant="contained"
//               sx={{ mt: 3, mb: 2 }}
//               disabled={loading}
//             >
//               {loading ? <CircularProgress size={24} /> : 'Sign In'}
//             </Button>
//             <Box sx={{ textAlign: 'center', mt: 2 }}>
//               <Typography variant="body2">
//                 Don't have an account?{' '}
//                 <Link component={RouterLink} to="/register" variant="body2">
//                   Register
//                 </Link>
//               </Typography>
//             </Box>
//           </Box>
//         </Paper>
//       </Box>
//     </Container>
//   );
// };

// export default Login;


// src/pages/Login.js
import React, { useState, useContext } from 'react';
import { useNavigate, Link as RouterLink, useLocation } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Paper,
  Link,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { AuthContext } from '../contexts/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [forgotPasswordError, setForgotPasswordError] = useState('');
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState('');
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [resetPasswordOpen, setResetPasswordOpen] = useState(false);
  const [resetPasswordData, setResetPasswordData] = useState({
    token: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [resetPasswordErrors, setResetPasswordErrors] = useState({});
  const [resetPasswordServerError, setResetPasswordServerError] = useState('');
  const [resetPasswordSuccess, setResetPasswordSuccess] = useState('');
  const [resetPasswordLoading, setResetPasswordLoading] = useState(false);
  
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    
    // Clear field error when user starts typing again
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: '',
      });
    }

    // Clear server error when user starts typing
    if (serverError) {
      setServerError('');
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setServerError('');
    
    try {
      const success = await login(formData.email, formData.password);
      
      if (success) {
        // Navigate to the page user was trying to access, or to editor by default
        const redirectPath = location.state?.from?.pathname || '/editor';
        navigate(redirectPath);
      } else {
        setServerError('Invalid email or password');
      }
    } catch (error) {
      setServerError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPasswordOpen = () => {
    setForgotPasswordOpen(true);
    setForgotPasswordEmail('');
    setForgotPasswordError('');
    setForgotPasswordSuccess('');
  };

  const handleForgotPasswordClose = () => {
    setForgotPasswordOpen(false);
  };

  const handleForgotPasswordSubmit = async () => {
    if (!forgotPasswordEmail.trim()) {
      setForgotPasswordError('Email is required');
      return;
    }

    setForgotPasswordLoading(true);
    setForgotPasswordError('');
    setForgotPasswordSuccess('');

    try {
      const response = await fetch('http://localhost:5003/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: forgotPasswordEmail }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send reset password email');
      }

      setForgotPasswordSuccess('Password reset link has been sent to your email (check the response for testing)');
      // In a real app, you would just show a message that the email was sent
      // For testing purposes, we'll show the token in an alert
      alert(`For testing purposes, here's your reset token: ${data.reset_token}\nIn production, this would be sent via email.`);
      setForgotPasswordOpen(false);
      setResetPasswordOpen(true);
      setResetPasswordData(prev => ({ ...prev, token: data.reset_token }));
    } catch (error) {
      setForgotPasswordError(error.message);
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  const handleResetPasswordOpen = () => {
    setResetPasswordOpen(true);
  };

  const handleResetPasswordClose = () => {
    setResetPasswordOpen(false);
  };

  const handleResetPasswordChange = (e) => {
    setResetPasswordData({
      ...resetPasswordData,
      [e.target.name]: e.target.value,
    });

    if (resetPasswordErrors[e.target.name]) {
      setResetPasswordErrors({
        ...resetPasswordErrors,
        [e.target.name]: '',
      });
    }
  };

  const validateResetPasswordForm = () => {
    const newErrors = {};

    if (!resetPasswordData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (resetPasswordData.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters';
    }

    if (!resetPasswordData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (resetPasswordData.newPassword !== resetPasswordData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setResetPasswordErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleResetPasswordSubmit = async () => {
    if (!validateResetPasswordForm()) return;

    setResetPasswordLoading(true);
    setResetPasswordServerError('');
    setResetPasswordSuccess('');

    try {
      const response = await fetch('http://localhost:5003/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: resetPasswordData.token,
          password: resetPasswordData.newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reset password');
      }

      setResetPasswordSuccess('Password has been reset successfully. You can now login with your new password.');
      setTimeout(() => {
        setResetPasswordOpen(false);
      }, 2000);
    } catch (error) {
      setResetPasswordServerError(error.message);
    } finally {
      setResetPasswordLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          <Typography component="h1" variant="h5" align="center" gutterBottom>
            Sign In
          </Typography>
          
          {serverError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {serverError}
            </Alert>
          )}
          
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={formData.email}
              onChange={handleChange}
              error={!!errors.email}
              helperText={errors.email}
              disabled={loading}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              error={!!errors.password}
              helperText={errors.password}
              disabled={loading}
            />
            <Box sx={{ textAlign: 'right', mt: 1 }}>
              <Link 
                component="button" 
                variant="body2" 
                onClick={handleForgotPasswordOpen}
                sx={{ textDecoration: 'none' }}
              >
                Forgot password?
              </Link>
            </Box>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Sign In'}
            </Button>
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Typography variant="body2">
                Don't have an account?{' '}
                <Link component={RouterLink} to="/register" variant="body2">
                  Register
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>

      {/* Forgot Password Dialog */}
      <Dialog open={forgotPasswordOpen} onClose={handleForgotPasswordClose}>
        <DialogTitle>
          Reset Password
          <IconButton
            aria-label="close"
            onClick={handleForgotPasswordClose}
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
          <Typography variant="body1" sx={{ mb: 2 }}>
            Enter your email address and we'll send you a link to reset your password.
          </Typography>
          {forgotPasswordError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {forgotPasswordError}
            </Alert>
          )}
          {forgotPasswordSuccess && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {forgotPasswordSuccess}
            </Alert>
          )}
          <TextField
            autoFocus
            margin="dense"
            id="forgotPasswordEmail"
            label="Email Address"
            type="email"
            fullWidth
            variant="standard"
            value={forgotPasswordEmail}
            onChange={(e) => setForgotPasswordEmail(e.target.value)}
            error={!!forgotPasswordError}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleForgotPasswordClose}>Cancel</Button>
          <Button 
            onClick={handleForgotPasswordSubmit}
            disabled={forgotPasswordLoading}
          >
            {forgotPasswordLoading ? <CircularProgress size={24} /> : 'Send Reset Link'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={resetPasswordOpen} onClose={handleResetPasswordClose}>
        <DialogTitle>
          Set New Password
          <IconButton
            aria-label="close"
            onClick={handleResetPasswordClose}
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
          {resetPasswordServerError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {resetPasswordServerError}
            </Alert>
          )}
          {resetPasswordSuccess && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {resetPasswordSuccess}
            </Alert>
          )}
          <TextField
            margin="dense"
            id="newPassword"
            name="newPassword"
            label="New Password"
            type="password"
            fullWidth
            variant="standard"
            value={resetPasswordData.newPassword}
            onChange={handleResetPasswordChange}
            error={!!resetPasswordErrors.newPassword}
            helperText={resetPasswordErrors.newPassword}
            disabled={resetPasswordLoading}
            sx={{ mt: 2 }}
          />
          <TextField
            margin="dense"
            id="confirmPassword"
            name="confirmPassword"
            label="Confirm New Password"
            type="password"
            fullWidth
            variant="standard"
            value={resetPasswordData.confirmPassword}
            onChange={handleResetPasswordChange}
            error={!!resetPasswordErrors.confirmPassword}
            helperText={resetPasswordErrors.confirmPassword}
            disabled={resetPasswordLoading}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleResetPasswordClose}>Cancel</Button>
          <Button 
            onClick={handleResetPasswordSubmit}
            disabled={resetPasswordLoading || !!resetPasswordSuccess}
          >
            {resetPasswordLoading ? <CircularProgress size={24} /> : 'Reset Password'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Login;
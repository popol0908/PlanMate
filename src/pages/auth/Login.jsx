// In src/pages/auth/Login.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Container, 
  TextField, 
  Button, 
  Typography, 
  Box, 
  Paper,
  Link as MuiLink,
  Alert,
  FormControlLabel,
  Checkbox,
  Grid,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  IconButton,
  InputAdornment
} from '@mui/material';
import { 
  Close as CloseIcon, 
  Google as GoogleIcon, 
  LockReset as LockResetIcon,
  Visibility,
  VisibilityOff 
} from '@mui/icons-material';
import { signInWithGoogle } from '../../config/firebase';
import { authTheme, authPageStyles as styles } from '../../theme/authTheme';
import { ThemeProvider } from '@mui/material/styles';

// Replace with your actual logo
const AppLogo = () => (
  <Box sx={styles.logoContainer}>
    <Box 
      component="img" 
      src="/images/Logo.png" 
      alt="PlanMate" 
      sx={styles.logo} 
      onError={(e) => {
        // Fallback to text if image fails to load
        e.target.style.display = 'none';
        e.target.nextSibling.style.display = 'block';
      }} 
    />
    <Typography variant="h4" component="div" sx={{
      display: 'none',
      ...styles.logoText
    }}>
      PlanMate
    </Typography>
  </Box>
);

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, resetPassword } = useAuth();
  const navigate = useNavigate();
  const [isResetPassword, setIsResetPassword] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setError('');
      setLoading(true);
      
      // Basic client-side validation
      if (!email) {
        throw new Error('Please enter your email address');
      }
      if (!password) {
        throw new Error('Please enter your password');
      }
      
      await login(email, password, rememberMe);
      
      // Clear sensitive data from state
      setPassword('');
      
      // Navigate to home page after successful login
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Login error:', error);
      
      // Use the error message from the auth function or a fallback message
      setError(error.message || 'An unexpected error occurred. Please try again.');
      
      // Focus the email or password field based on the error
      try {
        if (error.message.toLowerCase().includes('email')) {
          const emailInput = document.getElementById('email-input');
          if (emailInput) emailInput.focus();
        } else if (error.message.toLowerCase().includes('password')) {
          const passwordInput = document.getElementById('password-input');
          if (passwordInput) passwordInput.focus();
        }
      } catch (focusError) {
        console.warn('Could not focus input:', focusError);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handlePasswordReset(e) {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    try {
      setLoading(true);
      await resetPassword(email);
      setResetEmailSent(true);
      setError('');
    } catch (error) {
      console.error('Password reset error:', error);
      setError(error.message || 'Failed to send password reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      setGoogleLoading(true);
      setError('');
      await signInWithGoogle();
      navigate('/');
    } catch (error) {
      console.error('Google sign in error:', error);
      // Don't show error if user closed the popup
      if (error.code !== 'auth/popup-closed-by-user') {
        setError(error.message || 'Failed to sign in with Google. Please try again.');
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleOpenResetDialog = () => {
    setResetDialogOpen(true);
    setResetEmail(email);
    setResetSuccess(false);
  };

  const handleCloseResetDialog = () => {
    setResetDialogOpen(false);
    setResetSuccess(false);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!resetEmail) {
      setError('Please enter your email address');
      return;
    }

    try {
      setResetLoading(true);
      setError('');
      await resetPassword(resetEmail);
      setResetSuccess(true);
    } catch (error) {
      console.error('Password reset error:', error);
      setError(error.message || 'Failed to send password reset email. Please try again.');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <ThemeProvider theme={authTheme}>
      <Box sx={styles.container}>
        <Paper elevation={0} sx={styles.paper}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <AppLogo />
            <Typography variant="h4" component="h1" sx={styles.title}>
              Welcome!
            </Typography>
            <Typography variant="body1" sx={styles.subtitle}>
              Sign in to your account to continue
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={styles.form}>
            <TextField
              id="email-input"
              fullWidth
              label="Email address"
              variant="outlined"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              type="email"
              autoComplete="username"
              autoFocus
              InputLabelProps={{
                shrink: true,
              }}
              error={error.toLowerCase().includes('email')}
            />

            <TextField
              id="password-input"
              fullWidth
              label="Password"
              variant="outlined"
              type={showPassword ? 'text' : 'password'}
              value={password}
              autoComplete="current-password"
              error={error.toLowerCase().includes('password')}
              onChange={(e) => setPassword(e.target.value)}
              required
              InputLabelProps={{
                shrink: true,
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      size="large"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              mb: 2
            }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    color="primary"
                    size="small"
                  />
                }
                label={
                  <Typography variant="body2">
                    Remember me
                  </Typography>
                }
                sx={{ m: 0 }}
              />
              
              <MuiLink 
                component="button" 
                type="button" 
                onClick={handleOpenResetDialog}
                sx={styles.link}
                variant="body2"
              >
                Forgot password?
              </MuiLink>
            </Box>

            <Button
              fullWidth
              variant="contained"
              size="large"
              type="submit"
              disabled={loading}
              sx={styles.submitButton}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>

            <Divider sx={styles.divider}>
              <Typography variant="body2" color="text.secondary">
                OR CONTINUE WITH
              </Typography>
            </Divider>

            <Button
              fullWidth
              variant="outlined"
              onClick={handleGoogleSignIn}
              disabled={googleLoading || loading}
              startIcon={<GoogleIcon />}
              sx={styles.googleButton}
            >
              {googleLoading ? 'Signing in...' : 'Continue with Google'}
            </Button>

            <Box sx={styles.footer}>
              <Typography variant="body2">
                Don't have an account?{' '}
                <MuiLink component={Link} to="/signup" sx={styles.link}>
                  Sign up
                </MuiLink>
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* Password Reset Dialog */}
        <Dialog 
          open={resetDialogOpen} 
          onClose={handleCloseResetDialog}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              p: 1
            }
          }}
        >
          <DialogTitle sx={{ pb: 1 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Reset Password
              </Typography>
              <IconButton 
                edge="end" 
                onClick={handleCloseResetDialog}
                aria-label="close"
                size="large"
              >
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>
          <form onSubmit={handleResetPassword}>
            <DialogContent sx={{ pt: 0 }}>
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}
              {resetSuccess ? (
                <Box sx={{ textAlign: 'center', py: 2 }}>
                  <LockResetIcon color="success" sx={{ fontSize: 48, mb: 2 }} />
                  <Typography variant="body1" gutterBottom>
                    Check your email
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    We've sent a password reset link to
                  </Typography>
                  <Typography variant="subtitle1" fontWeight={600}>
                    {resetEmail}
                  </Typography>
                </Box>
              ) : (
                <>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Enter your email address and we'll send you a link to reset your password.
                  </Typography>
                  <TextField
                    autoFocus
                    margin="normal"
                    fullWidth
                    label="Email address"
                    type="email"
                    variant="outlined"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    required
                    InputLabelProps={{
                      shrink: true,
                    }}
                    sx={{ mt: 2 }}
                  />
                </>
              )}
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3, pt: 0 }}>
              {!resetSuccess ? (
                <>
                  <Button 
                    onClick={handleCloseResetDialog}
                    color="inherit"
                    disabled={resetLoading}
                    sx={{ mr: 1 }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    variant="contained" 
                    color="primary"
                    disabled={!resetEmail || resetLoading}
                    fullWidth
                  >
                    {resetLoading ? 'Sending...' : 'Send reset link'}
                  </Button>
                </>
              ) : (
                <Button 
                  onClick={handleCloseResetDialog}
                  variant="contained"
                  color="primary"
                  fullWidth
                >
                  Back to Login
                </Button>
              )}
            </DialogActions>
          </form>
        </Dialog>
      </Box>
    </ThemeProvider>
  );
}

export default LoginPage;
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Box,
  Typography,
  TextField,
  Button,
  Link as MuiLink,
  Paper,
  Alert,
  IconButton,
  InputAdornment,
  Divider,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import { Visibility, VisibilityOff, Google as GoogleIcon } from '@mui/icons-material';
import { signInWithGoogle } from '../../config/firebase';
import { authTheme, authPageStyles as styles } from '../../theme/authTheme';
import { ThemeProvider } from '@mui/material/styles';

// Reuse the AppLogo component from Login
const AppLogo = () => (
  <Box sx={styles.logoContainer}>
    <Box 
      component="img" 
      src="/images/Logo.png" 
      alt="PlanMate" 
      sx={styles.logo} 
      onError={(e) => {
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

function SignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();

    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }

    try {
      setError('');
      setLoading(true);
      await signup(email, password);
      navigate('/');
    } catch (err) {
      setError('Failed to create an account: ' + err.message);
    }

    setLoading(false);
  }

  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogleSignUp = async () => {
    try {
      setGoogleLoading(true);
      setError('');
      await signInWithGoogle();
      navigate('/');
    } catch (error) {
      console.error('Google sign up error:', error);
      // Don't show error if user closed the popup
      if (error.code !== 'auth/popup-closed-by-user') {
        setError(error.message || 'Failed to sign up with Google. Please try again.');
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <ThemeProvider theme={authTheme}>
      <Box sx={styles.container}>
        <Paper elevation={0} sx={styles.paper}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <AppLogo />
            <Typography variant="h4" component="h1" sx={styles.title}>
              Create an account
            </Typography>
            <Typography variant="body1" sx={styles.subtitle}>
              Get started with your free account
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={styles.form}>
            <TextField
              fullWidth
              label="Email address"
              variant="outlined"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              autoFocus
              InputLabelProps={{
                shrink: true,
              }}
            />

            <TextField
              fullWidth
              label="Password"
              variant="outlined"
              type={showPassword ? 'text' : 'password'}
              value={password}
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

            <TextField
              fullWidth
              label="Confirm Password"
              variant="outlined"
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              InputLabelProps={{
                shrink: true,
              }}
              error={!!(password && confirmPassword && password !== confirmPassword)}
              helperText={
                password && confirmPassword && password !== confirmPassword 
                  ? "Passwords don't match" 
                  : ""
              }
            />

            <Button
              fullWidth
              variant="contained"
              size="large"
              type="submit"
              disabled={loading}
              sx={styles.submitButton}
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>

            <Divider sx={styles.divider}>
              <Typography variant="body2" color="text.secondary">
                OR CONTINUE WITH
              </Typography>
            </Divider>

            <Button
              fullWidth
              variant="outlined"
              onClick={handleGoogleSignUp}
              disabled={googleLoading || loading}
              startIcon={<GoogleIcon />}
              sx={styles.googleButton}
            >
              {googleLoading ? 'Signing up...' : 'Continue with Google'}
            </Button>

            <Box sx={styles.footer}>
              <Typography variant="body2">
                Already have an account?{' '}
                <MuiLink component={Link} to="/login" sx={styles.link}>
                  Sign in
                </MuiLink>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    </ThemeProvider>
  );
}

export default SignUpPage;
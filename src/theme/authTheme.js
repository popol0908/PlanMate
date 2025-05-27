import { createTheme } from '@mui/material/styles';

export const authTheme = createTheme({
  palette: {
    primary: {
      main: '#4361ee',
      light: '#eef2ff',
      dark: '#3730a3',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#7c3aed',
      light: '#ede9fe',
      dark: '#5b21b6',
    },
    background: {
      default: '#f9fafb',
      paper: '#ffffff',
    },
    text: {
      primary: '#111827',
      secondary: '#6b7280',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '2rem',
    },
    h2: {
      fontWeight: 600,
      fontSize: '1.5rem',
    },
    body1: {
      fontSize: '0.9375rem',
      lineHeight: 1.6,
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
      fontSize: '0.9375rem',
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          padding: '10px 20px',
          borderRadius: 8,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(67, 97, 238, 0.2)',
          },
        },
        contained: {
          '&:hover': {
            boxShadow: '0 4px 12px rgba(67, 97, 238, 0.3)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            '& fieldset': {
              borderColor: '#e5e7eb',
            },
            '&:hover fieldset': {
              borderColor: '#9ca3af',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#4361ee',
              boxShadow: '0 0 0 3px rgba(67, 97, 238, 0.1)',
            },
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.03)',
          border: '1px solid rgba(0, 0, 0, 0.03)',
        },
      },
    },
  },
});

export const authPageStyles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    p: 3,
    background: 'linear-gradient(135deg, #f6f7ff 0%, #f0f2ff 100%)',
  },
  paper: {
    p: 4,
    width: '100%',
    maxWidth: 440,
    position: 'relative',
    overflow: 'hidden',
  },
  logo: {
    width: 160,
    height: 'auto',
    mb: 3,
    maxWidth: '100%',
  },
  title: {
    mb: 0.5,
    color: 'text.primary',
    fontWeight: 700,
  },
  subtitle: {
    mb: 4,
    color: 'text.secondary',
  },
  form: {
    mt: 3,
    '& .MuiFormControl-root': {
      mb: 2,
    },
  },
  submitButton: {
    mt: 2,
    py: 1.5,
    fontSize: '1rem',
    fontWeight: 600,
  },
  divider: {
    my: 3,
    color: 'text.secondary',
    '&:before, &:after': {
      borderColor: '#e5e7eb',
    },
  },
  footer: {
    mt: 3,
    textAlign: 'center',
    color: 'text.secondary',
  },
  link: {
    color: 'primary.main',
    fontWeight: 500,
    textDecoration: 'none',
    '&:hover': {
      textDecoration: 'underline',
    },
  },
  googleButton: {
    backgroundColor: 'white',
    color: '#374151',
    border: '1px solid #e5e7eb',
    mb: 3,
    '&:hover': {
      backgroundColor: '#f9fafb',
      borderColor: '#d1d5db',
    },
  },
};

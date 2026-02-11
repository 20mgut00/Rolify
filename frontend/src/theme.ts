import { createTheme } from '@mui/material/styles';

// RPG Character Creator Theme
export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#D4AF37', // Gold
      light: '#E5C158',
      dark: '#B8941F',
      contrastText: '#1A1A2E',
    },
    secondary: {
      main: '#8B4513', // Brown
      light: '#A0522D',
      dark: '#6B3410',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#0F0F23', // Very dark blue
      paper: '#16213E', // Dark blue
    },
    text: {
      primary: '#F5E6D3', // Light parchment
      secondary: '#D4AF37', // Gold
    },
    error: {
      main: '#DC143C',
    },
    success: {
      main: '#228B22',
    },
    warning: {
      main: '#FFD700',
    },
  },
  typography: {
    fontFamily: '"Cinzel", "Georgia", serif',
    h1: {
      fontFamily: '"Cinzel", serif',
      fontWeight: 700,
      fontSize: '3rem',
      letterSpacing: '0.05em',
    },
    h2: {
      fontFamily: '"Cinzel", serif',
      fontWeight: 600,
      fontSize: '2.5rem',
      letterSpacing: '0.04em',
    },
    h3: {
      fontFamily: '"Cinzel", serif',
      fontWeight: 600,
      fontSize: '2rem',
      letterSpacing: '0.03em',
    },
    h4: {
      fontFamily: '"Cinzel", serif',
      fontWeight: 600,
      fontSize: '1.75rem',
    },
    h5: {
      fontFamily: '"Cinzel", serif',
      fontWeight: 500,
      fontSize: '1.5rem',
    },
    h6: {
      fontFamily: '"Cinzel", serif',
      fontWeight: 500,
      fontSize: '1.25rem',
    },
    body1: {
      fontFamily: '"Georgia", serif',
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontFamily: '"Georgia", serif',
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
    button: {
      fontFamily: '"Cinzel", serif',
      fontWeight: 500,
      letterSpacing: '0.05em',
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 12px rgba(212, 175, 55, 0.3)',
          },
        },
        contained: {
          background: 'linear-gradient(135deg, #D4AF37 0%, #B8941F 100%)',
          boxShadow: '0 2px 8px rgba(212, 175, 55, 0.2)',
          '&:hover': {
            background: 'linear-gradient(135deg, #E5C158 0%, #D4AF37 100%)',
          },
        },
        outlined: {
          borderWidth: 2,
          '&:hover': {
            borderWidth: 2,
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: '#D4AF37',
              borderWidth: 2,
            },
            '&:hover fieldset': {
              borderColor: '#E5C158',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#D4AF37',
            },
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.5)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 8px 24px rgba(212, 175, 55, 0.2)',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          fontFamily: '"Cinzel", serif',
          '&:hover': {
            backgroundColor: 'rgba(212, 175, 55, 0.1)',
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          '&:hover': {
            transform: 'scale(1.1)',
          },
        },
      },
    },
  },
});

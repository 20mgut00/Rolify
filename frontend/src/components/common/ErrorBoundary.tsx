import { Component, ReactNode } from 'react';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { AlertTriangle } from 'lucide-react';
import i18next from 'i18next';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            padding: 4,
            backgroundColor: '#F5F1E8',
          }}
        >
          <AlertTriangle size={64} color="#D9A441" />
          <Typography
            variant="h4"
            sx={{ mt: 3, mb: 2, color: '#0F2B3A', fontWeight: 'bold' }}
          >
            {i18next.t('errors.somethingWentWrong')}
          </Typography>
          <Typography
            variant="body1"
            sx={{ mb: 4, color: '#5B6470', textAlign: 'center', maxWidth: 600 }}
          >
            {i18next.t('errors.errorDescription')}
          </Typography>
          {import.meta.env.DEV && this.state.error && (
            <Box
              sx={{
                mb: 3,
                p: 2,
                backgroundColor: '#FFF3CD',
                borderRadius: 1,
                maxWidth: 600,
                width: '100%',
              }}
            >
              <Typography variant="caption" sx={{ color: '#856404', fontFamily: 'monospace' }}>
                {this.state.error.toString()}
              </Typography>
            </Box>
          )}
          <Button
            variant="contained"
            onClick={this.handleReset}
            sx={{
              backgroundColor: '#D9A441',
              color: '#0F2B3A',
              '&:hover': { backgroundColor: '#C7923A' },
              textTransform: 'none',
              fontSize: '1rem',
              padding: '12px 32px',
            }}
          >
            {i18next.t('errors.returnToHome')}
          </Button>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

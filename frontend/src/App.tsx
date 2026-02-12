import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider, CssBaseline, CircularProgress, Box } from '@mui/material';
import { theme } from './theme';
import Header from './components/Header';

// Lazy load route components for code splitting
const Hero = lazy(() => import('./components/Hero'));
const CharacterForm = lazy(() => import('./components/character/CharacterForm'));
const CharacterLibrary = lazy(() => import('./components/character/CharacterLibrary'));
const CharacterViewer = lazy(() => import('./components/character/CharacterViewer'));
const PublicGallery = lazy(() => import('./components/gallery/PublicGallery'));
const Settings = lazy(() => import('./components/settings/Settings'));
const Statistics = lazy(() => import('./components/settings/Statistics'));
const VerifyEmail = lazy(() => import('./components/auth/VerifyEmail'));
const ResetPassword = lazy(() => import('./components/auth/ResetPassword'));
const OAuthCallback = lazy(() => import('./components/auth/OAuthCallback'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Loading fallback component for lazy routes
function RouteLoader() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#F5F1E8',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 3,
      }}
    >
      <CircularProgress size={60} sx={{ color: '#D9A441' }} />
      <Box sx={{ textAlign: 'center' }}>
        <p className="text-primary-dark text-xl font-semibold">Loading...</p>
        <p className="text-primary-dark/60 text-sm mt-2">Preparing your adventure</p>
      </Box>
    </Box>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <div className="min-h-screen bg-primary-light">
            <Header />

            <Suspense fallback={<RouteLoader />}>
              <Routes>
                <Route path="/" element={<Hero />} />
                <Route path="/create" element={<CharacterForm />} />
                <Route path="/library" element={<CharacterLibrary />} />
                <Route path="/character/:id" element={<CharacterViewer />} />
                <Route path="/gallery" element={<PublicGallery />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/statistics" element={<Statistics />} />
                <Route path="/verify-email" element={<VerifyEmail />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/oauth/callback" element={<OAuthCallback />} />
              </Routes>
            </Suspense>

            <Toaster position="top-right" />
          </div>
        </BrowserRouter>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;

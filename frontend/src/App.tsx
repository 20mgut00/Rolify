import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { theme } from './theme';
import Header from './components/Header';
import Hero from './components/Hero';
import CharacterForm from './components/character/CharacterForm';
import CharacterLibrary from './components/character/CharacterLibrary';
import CharacterViewer from './components/character/CharacterViewer';
import PublicGallery from './components/gallery/PublicGallery';
import Settings from './components/settings/Settings';
import Statistics from './components/settings/Statistics';
import VerifyEmail from './components/auth/VerifyEmail';
import ResetPassword from './components/auth/ResetPassword';
import OAuthCallback from './components/auth/OAuthCallback';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <div className="min-h-screen bg-primary-light">
            <Header />

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

            <Toaster position="top-right" />
          </div>
        </BrowserRouter>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;

import { lazy, Suspense, useEffect } from 'react';
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider, CssBaseline, CircularProgress, Box } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { theme } from './theme';
import Header from './components/Header';
import { useAccessibilityStore } from './store';

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
  const { t } = useTranslation();
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
        <p className="text-primary-dark text-xl font-semibold">{t('common.loading')}</p>
        <p className="text-primary-dark/60 text-sm mt-2">{t('common.preparingAdventure')}</p>
      </Box>
    </Box>
  );
}

function AppLayout() {
  const { darkMode, reducedMotion, largeText, language } = useAccessibilityStore();
  const { i18n } = useTranslation();

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    root.classList.toggle('reduce-motion', reducedMotion);
    root.classList.toggle('text-large', largeText);
    root.style.colorScheme = darkMode ? 'dark' : 'light';
  }, [darkMode, reducedMotion, largeText]);

  useEffect(() => {
    if (i18n.language !== language) {
      i18n.changeLanguage(language);
    }
  }, [language, i18n]);

  return (
    <div className="h-dvh flex flex-col bg-primary-light [&_button]:cursor-pointer [&_button:disabled]:cursor-not-allowed [&_button:disabled]:opacity-60 [&_button.bg-accent-gold]:transition-all [&_button.bg-accent-gold]:duration-200 [&_button.bg-accent-gold]:transform-gpu [&_button.bg-accent-gold:hover:not(:disabled)]:scale-[1.02] [&_button.bg-accent-gold:hover:not(:disabled)]:-translate-y-px [&_button.bg-accent-gold:hover:not(:disabled)]:brightness-105 [&_a.bg-accent-gold]:transition-all [&_a.bg-accent-gold]:duration-200 [&_a.bg-accent-gold]:transform-gpu [&_a.bg-accent-gold:hover]:scale-[1.02] [&_a.bg-accent-gold:hover]:-translate-y-px [&_a.bg-accent-gold:hover]:brightness-105">
      <Header />

      <div className="flex-1 overflow-y-auto min-h-0">
        <Suspense fallback={<RouteLoader />}>
          <Outlet />
        </Suspense>
      </div>

      <Toaster position="top-right" />
    </div>
  );
}

const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { path: '/', element: <Hero /> },
      { path: '/create', element: <CharacterForm /> },
      { path: '/library', element: <CharacterLibrary /> },
      { path: '/character/:id', element: <CharacterViewer /> },
      { path: '/gallery', element: <PublicGallery /> },
      { path: '/settings', element: <Settings /> },
      { path: '/statistics', element: <Statistics /> },
      { path: '/verify-email', element: <VerifyEmail /> },
      { path: '/reset-password', element: <ResetPassword /> },
      { path: '/oauth/callback', element: <OAuthCallback /> },
    ],
  },
]);

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;

import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import LogoTFG from '../assets/LogoTFG.svg?react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Box,
  Avatar,
  Divider,
  Select,
  FormControl,
  useTheme,
} from '@mui/material';
import {
  Person,
  Logout,
  Settings,
  BarChart,
  Add,
  LibraryBooks,
  Public,
  Warning,
  DarkMode,
  LightMode,
  Language,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useAccessibilityStore, useAuthStore, useUIStore } from '../store';
import LoginModal from './auth/LoginModal';

export default function Header() {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const navigate = useNavigate();
  const { darkMode, setDarkMode, language, setLanguage } = useAccessibilityStore();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { selectedSystem, setSelectedSystem } = useUIStore();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    i18n.changeLanguage(lang);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <AppBar position="sticky" sx={{ bgcolor: 'background.paper' }}>
        <Toolbar sx={{ py: 1, display: 'flex', justifyContent: 'space-between' }}>
          {/* Logo */}
          <Box
            component={RouterLink}
            to="/"
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              textDecoration: 'none',
              color: 'inherit',
              width: 150,
            }}
          >
            <LogoTFG
              style={{
                height: 50,
                width: 'auto',
                color: theme.palette.primary.main,
              }}
            />
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }} >

          {/* System Selector */}
          <FormControl size="small" sx={{ minWidth: 120, mr: 2 }}>
            <Select
              value={selectedSystem}
              onChange={(e) => setSelectedSystem(e.target.value)}
              MenuProps={{ disableScrollLock: true }}
              sx={{
                fontFamily: 'Cinzel',
                fontWeight: 500,
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'primary.main',
                  borderWidth: 2,
                },
              }}
            >
              <MenuItem value="Root" sx={{ fontFamily: 'Cinzel' }}>Root</MenuItem>
              <MenuItem value="Cyberpunk Red" sx={{ fontFamily: 'Cinzel' }}>Cyberpunk Red</MenuItem>
              {/* Future systems */}
            </Select>
          </FormControl>

          {/* Action Buttons */}
          <Button
            component={RouterLink}
            to="/create"
            variant="contained"
            startIcon={<Add />}
            sx={{ mr: 1, px: 2 }}
          >
            {t('header.newCharacter')}
          </Button>

          <Button
            component={RouterLink}
            to="/library"
            variant="outlined"
            startIcon={<LibraryBooks />}
            sx={{ mr: 1, px: 2 }}
          >
            {t('header.library')}
          </Button>

          <Button
            component={RouterLink}
            to="/gallery"
            variant="outlined"
            startIcon={<Public />}
            sx={{ mr: 2, px: 2 }}
          >
            {t('header.gallery')}
          </Button>

          <FormControl size="small" sx={{ minWidth: 80 }}>
            <Select
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value)}
              MenuProps={{ disableScrollLock: true }}
              startAdornment={<Language sx={{ mr: 0.5, fontSize: 18, color: 'primary.main' }} />}
              sx={{
                fontFamily: 'Cinzel',
                fontWeight: 500,
                fontSize: '0.85rem',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'primary.main',
                  borderWidth: 2,
                },
              }}
            >
              <MenuItem value="es" sx={{ fontFamily: 'Cinzel' }}>ES</MenuItem>
              <MenuItem value="en" sx={{ fontFamily: 'Cinzel' }}>EN</MenuItem>
            </Select>
          </FormControl>

          <IconButton
            onClick={() => setDarkMode(!darkMode)}
            aria-label={darkMode ? t('header.switchToLight') : t('header.switchToDark')}
            title={darkMode ? t('header.lightMode') : t('header.darkMode')}
            sx={{
              mr: 1,
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              '&:hover': {
                bgcolor: 'primary.light',
              },
            }}
          >
            {darkMode ? <LightMode /> : <DarkMode />}
          </IconButton>

          {/* User Menu */}
          {isAuthenticated && user ? (
            <>
              <IconButton
                onClick={handleMenuOpen}
                sx={{
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  '&:hover': {
                    bgcolor: 'primary.light',
                  },
                }}
              >
                {user.avatarUrl ? (
                  <Avatar src={user.avatarUrl} alt={user.name} sx={{ width: 32, height: 32 }} />
                ) : (
                  <Person />
                )}
              </IconButton>

              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                slotProps={{
                  paper: {
                    sx: {
                      mt: 1,
                      minWidth: 220,
                    },
                  },
                }}
              >
                <Box sx={{ px: 2, py: 1.5 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {user.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                    {user.email}
                  </Typography>
                  {!user.emailVerified && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                      <Warning sx={{ fontSize: 14, color: 'error.main' }} />
                      <Typography variant="caption" color="error">
                        {t('header.emailNotVerified')}
                      </Typography>
                    </Box>
                  )}
                </Box>

                <Divider />

                <MenuItem
                  component={RouterLink}
                  to="/statistics"
                  onClick={handleMenuClose}
                  sx={{ py: 1.5 }}
                >
                  <BarChart sx={{ mr: 1.5, fontSize: 20 }} />
                  {t('header.statistics')}
                </MenuItem>

                <MenuItem
                  component={RouterLink}
                  to="/settings"
                  onClick={handleMenuClose}
                  sx={{ py: 1.5 }}
                >
                  <Settings sx={{ mr: 1.5, fontSize: 20 }} />
                  {t('header.settings')}
                </MenuItem>

                <Divider />

                <MenuItem
                  onClick={() => {
                    logout();
                    handleMenuClose();
                    navigate('/');
                  }}
                  sx={{
                    py: 1.5,
                    color: 'error.main',
                    '&:hover': {
                      bgcolor: 'rgba(220, 20, 60, 0.08)',
                    },
                  }}
                >
                  <Logout sx={{ mr: 1.5, fontSize: 20 }} />
                  {t('header.logout')}
                </MenuItem>
              </Menu>
            </>
          ) : (
            <>
              <IconButton
                onClick={handleMenuOpen}
                sx={{
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  '&:hover': {
                    bgcolor: 'primary.light',
                  },
                }}
              >
                <Person />
              </IconButton>

              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                slotProps={{
                  paper: {
                    sx: {
                      mt: 1,
                      minWidth: 180,
                    },
                  },
                }}
              >
                <MenuItem
                  component={RouterLink}
                  to="/settings"
                  onClick={handleMenuClose}
                  sx={{ py: 1.5 }}
                >
                  <Settings sx={{ mr: 1.5, fontSize: 20 }} />
                  {t('header.settings')}
                </MenuItem>

                <Divider />

                <MenuItem
                  onClick={() => {
                    handleMenuClose();
                    setShowLoginModal(true);
                  }}
                  sx={{ py: 1.5 }}
                >
                  <Person sx={{ mr: 1.5, fontSize: 20 }} />
                  {t('header.login')}
                </MenuItem>
              </Menu>
            </>
          )}
          </Box>
        </Toolbar>
      </AppBar>

      <LoginModal open={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </>
  );
}

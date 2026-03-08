import { useState, useMemo, useEffect } from 'react';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  TextField,
  Button,
  Typography,
  Box,
  InputAdornment,
  IconButton,
  Divider,
  CircularProgress,
} from '@mui/material';
import {
  Close,
  Email,
  Lock,
  Person,
  Visibility,
  VisibilityOff,
  Google,
} from '@mui/icons-material';
import toast from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';
import { authAPI, characterAPI } from '../../services/api';
import { useAuthStore, useCharacterStore } from '../../store';
import type { Character } from '../../types';

type LoginFormData = { email: string; password: string };
type RegisterFormData = { name: string; email: string; password: string };
type ForgotPasswordFormData = { email: string };

interface LoginModalProps {
  onClose: () => void;
  open: boolean;
}

export default function LoginModal({ onClose, open }: LoginModalProps) {
  const { t } = useTranslation();
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { setAuth } = useAuthStore();
  const { sessionCharacters, clearSessionCharacters } = useCharacterStore();
  const queryClient = useQueryClient();

  const migrateSessionCharacters = async () => {
    if (sessionCharacters.length === 0) return;
    await Promise.allSettled(
      sessionCharacters.map(({ id: _id, ...char }) =>
        characterAPI.create(char as Partial<Character>)
      )
    );
    clearSessionCharacters();
    queryClient.invalidateQueries({ queryKey: ['myCharacters'] });
  };

  const loginSchema = useMemo(() => z.object({
    email: z.string().email(t('validation.emailInvalid')),
    password: z.string().min(1, t('validation.passwordRequired')),
  }), [t]);

  const registerSchema = useMemo(() => z.object({
    name: z.string().min(2, t('validation.nameMinLength')),
    email: z.string().email(t('validation.emailInvalid')),
    password: z.string().min(8, t('validation.passwordMinLength')),
  }), [t]);

  const forgotPasswordSchema = useMemo(() => z.object({
    email: z.string().email(t('validation.emailInvalid')),
  }), [t]);

  const {
    register: loginRegister,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors },
    reset: resetLogin,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const {
    register: signupRegister,
    handleSubmit: handleSignupSubmit,
    formState: { errors: signupErrors },
    reset: resetSignup,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const {
    register: forgotRegister,
    handleSubmit: handleForgotSubmit,
    formState: { errors: forgotErrors },
    reset: resetForgot,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const getErrorMessage = (error: unknown, fallback: string): string => {
    if (axios.isAxiosError(error)) {
      return error.response?.data?.message || error.response?.data?.error || fallback;
    }
    return fallback;
  };

  const onLogin = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const response = await authAPI.login(data);
      setAuth(response.token, response.refreshToken, response.user);
      await migrateSessionCharacters();
      toast.success(t('auth.welcomeBackToast'));
      onClose();
    } catch (error) {
      toast.error(getErrorMessage(error, t('errors.loginFailed')));
    } finally {
      setIsLoading(false);
    }
  };

  const onRegister = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      const response = await authAPI.register(data);
      setAuth(response.token, response.refreshToken, response.user);
      await migrateSessionCharacters();
      toast.success(t('auth.registrationSuccess'));
      onClose();
    } catch (error) {
      const message = getErrorMessage(error, t('errors.registrationFailed'));
      const isGoogleAccount = axios.isAxiosError(error) &&
        error.response?.data?.message?.toLowerCase().includes('google');
      if (isGoogleAccount) {
        switchMode('login');
        toast.error(message, { duration: 6000 });
      } else {
        toast.error(message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const onForgotPassword = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    try {
      await authAPI.forgotPassword(data.email);
      toast.success(t('auth.resetEmailSent'));
      setMode('login');
      resetForgot();
    } catch (error) {
      toast.error(getErrorMessage(error, t('errors.sendResetEmailFailed')));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // Get base URL from API_URL (remove /api suffix)
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
    const baseUrl = apiUrl.replace(/\/api$/, '');
    window.location.href = `${baseUrl}/oauth2/authorization/google`;
  };

  useEffect(() => {
    if (open) {
      setMode('login');
      setShowPassword(false);
      resetLogin();
      resetSignup();
      resetForgot();
    }
  }, [open]);

  const switchMode = (newMode: 'login' | 'register' | 'forgot') => {
    setMode(newMode);
    setShowPassword(false);
    resetLogin();
    resetSignup();
    resetForgot();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      disableScrollLock
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6)',
          }
        }
      }}

    >
      <DialogTitle sx={{ position: 'relative', pb: 1 }}>
        <Typography variant="h4" component="div" sx={{ fontFamily: 'Cinzel' }}>
          {mode === 'login' && t('auth.welcomeBack')}
          {mode === 'register' && t('auth.createAccount')}
          {mode === 'forgot' && t('auth.resetPassword')}
        </Typography>
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: 'text.secondary',
          }}
        >
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        {/* Login Form */}
        {mode === 'login' && (
          <Box component="form" onSubmit={handleLoginSubmit(onLogin)} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label={t('auth.email')}
              type="email"
              margin="normal"
              {...loginRegister('email')}
              error={!!loginErrors.email}
              helperText={loginErrors.email?.message}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email />
                    </InputAdornment>
                  ),
                }
              }}
            />

            <TextField
              fullWidth
              label={t('auth.password')}
              type={showPassword ? 'text' : 'password'}
              margin="normal"
              {...loginRegister('password')}
              error={!!loginErrors.password}
              helperText={loginErrors.password?.message}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }
              }}
            />

            <Box sx={{ mt: 1, mb: 2 }}>
              <Button
                onClick={() => switchMode('forgot')}
                sx={{
                  textTransform: 'none',
                  color: 'primary.main',
                  '&:hover': { textDecoration: 'underline' }
                }}
              >
                {t('auth.forgotPassword')}
              </Button>
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={isLoading}
              sx={{ mb: 2, py: 1.5 }}
            >
              {isLoading ? <CircularProgress size={24} /> : t('header.login')}
            </Button>

            <Divider sx={{ my: 2 }}>
              <Typography variant="body2" color="text.secondary">
                {t('auth.orContinueWith')}
              </Typography>
            </Divider>

            <Button
              fullWidth
              variant="outlined"
              size="large"
              onClick={handleGoogleLogin}
              startIcon={<Google />}
              sx={{
                py: 1.5,
                borderColor: 'primary.main',
                color: 'text.primary',
                '&:hover': {
                  borderColor: 'primary.light',
                  backgroundColor: 'rgba(212, 175, 55, 0.08)',
                },
              }}
            >
              {t('auth.signInWithGoogle')}
            </Button>

            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                {t('auth.dontHaveAccount')}{' '}
                <Button
                  onClick={() => switchMode('register')}
                  sx={{
                    textTransform: 'none',
                    color: 'primary.main',
                    '&:hover': { textDecoration: 'underline' }
                  }}
                >
                  {t('auth.signUp')}
                </Button>
              </Typography>
            </Box>
          </Box>
        )}

        {/* Register Form */}
        {mode === 'register' && (
          <Box component="form" onSubmit={handleSignupSubmit(onRegister)} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label={t('auth.name')}
              type="text"
              margin="normal"
              {...signupRegister('name')}
              error={!!signupErrors.name}
              helperText={signupErrors.name?.message}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person />
                    </InputAdornment>
                  ),
                }
              }}
            />

            <TextField
              fullWidth
              label={t('auth.email')}
              type="email"
              margin="normal"
              {...signupRegister('email')}
              error={!!signupErrors.email}
              helperText={signupErrors.email?.message}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email />
                    </InputAdornment>
                  ),
                }
              }}
            />

            <TextField
              fullWidth
              label={t('auth.password')}
              type={showPassword ? 'text' : 'password'}
              margin="normal"
              {...signupRegister('password')}
              error={!!signupErrors.password}
              helperText={signupErrors.password?.message}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={isLoading}
              sx={{ mt: 3, py: 1.5 }}
            >
              {isLoading ? <CircularProgress size={24} /> : t('auth.createAccount')}
            </Button>

            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                {t('auth.alreadyHaveAccount')}{' '}
                <Button
                  onClick={() => switchMode('login')}
                  sx={{
                    textTransform: 'none',
                    color: 'primary.main',
                    '&:hover': { textDecoration: 'underline' }
                  }}
                >
                  {t('header.login')}
                </Button>
              </Typography>
            </Box>
          </Box>
        )}

        {/* Forgot Password Form */}
        {mode === 'forgot' && (
          <Box component="form" onSubmit={handleForgotSubmit(onForgotPassword)} sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {t('auth.forgotPasswordDesc')}
            </Typography>

            <TextField
              fullWidth
              label={t('auth.email')}
              type="email"
              margin="normal"
              {...forgotRegister('email')}
              error={!!forgotErrors.email}
              helperText={forgotErrors.email?.message}

              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email />
                    </InputAdornment>
                  ),
                }
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={isLoading}
              sx={{ mt: 3, py: 1.5 }}
            >
              {isLoading ? <CircularProgress size={24} /> : t('auth.sendResetLink')}
            </Button>

            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Button
                onClick={() => switchMode('login')}
                sx={{
                  textTransform: 'none',
                  color: 'primary.main',
                  '&:hover': { textDecoration: 'underline' }
                }}
              >
                {t('auth.backToLogin')}
              </Button>
            </Box>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}

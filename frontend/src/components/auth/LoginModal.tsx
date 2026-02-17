import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import { authAPI } from '../../services/api';
import { useAuthStore } from '../../store';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;
type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

interface LoginModalProps {
  onClose: () => void;
  open: boolean;
}

export default function LoginModal({ onClose, open }: LoginModalProps) {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { setAuth } = useAuthStore();

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

  const onLogin = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const response = await authAPI.login(data);
      setAuth(response.token, response.refreshToken, response.user);
      toast.success('Welcome back!');
      onClose();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const onRegister = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      const response = await authAPI.register(data);
      setAuth(response.token, response.refreshToken, response.user);
      toast.success('Registration successful! Please verify your email.');
      onClose();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const onForgotPassword = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    try {
      await authAPI.forgotPassword(data.email);
      toast.success('Password reset email sent! Check your inbox.');
      setMode('login');
      resetForgot();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send reset email';
      toast.error(errorMessage);
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
          {mode === 'login' && 'Welcome Back'}
          {mode === 'register' && 'Create Account'}
          {mode === 'forgot' && 'Reset Password'}
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
              label="Email"
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
              label="Password"
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
                Forgot password?
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
              {isLoading ? <CircularProgress size={24} /> : 'Login'}
            </Button>

            <Divider sx={{ my: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Or continue with
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
              Sign in with Google
            </Button>

            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Don't have an account?{' '}
                <Button
                  onClick={() => switchMode('register')}
                  sx={{
                    textTransform: 'none',
                    color: 'primary.main',
                    '&:hover': { textDecoration: 'underline' }
                  }}
                >
                  Sign up
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
              label="Name"
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
              label="Email"
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
              label="Password"
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
              {isLoading ? <CircularProgress size={24} /> : 'Create Account'}
            </Button>

            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Already have an account?{' '}
                <Button
                  onClick={() => switchMode('login')}
                  sx={{
                    textTransform: 'none',
                    color: 'primary.main',
                    '&:hover': { textDecoration: 'underline' }
                  }}
                >
                  Login
                </Button>
              </Typography>
            </Box>
          </Box>
        )}

        {/* Forgot Password Form */}
        {mode === 'forgot' && (
          <Box component="form" onSubmit={handleForgotSubmit(onForgotPassword)} sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Enter your email address and we'll send you a link to reset your password.
            </Typography>

            <TextField
              fullWidth
              label="Email"
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
              {isLoading ? <CircularProgress size={24} /> : 'Send Reset Link'}
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
                Back to login
              </Button>
            </Box>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}

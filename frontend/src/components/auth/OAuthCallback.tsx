import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuthStore } from '../../store';
import toast from 'react-hot-toast';

export default function OAuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setAuth } = useAuthStore();

  useEffect(() => {
    const handleCallback = async () => {
      const token = searchParams.get('token');
      const refreshToken = searchParams.get('refreshToken');
      const error = searchParams.get('error');

      if (error) {
        toast.error(`Login failed: ${error}`);
        navigate('/');
        return;
      }

      if (token && refreshToken) {
        try {
          // Get user info with the token
          const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/me`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (!response.ok) {
            throw new Error('Failed to get user info');
          }

          const user = await response.json();

          setAuth(token, refreshToken, user);
          toast.success('Welcome! Logged in with Google');
          navigate('/');
        } catch (error) {
          console.error('OAuth callback error:', error);
          toast.error('Failed to complete login');
          navigate('/');
        }
      } else {
        toast.error('Missing authentication tokens');
        navigate('/');
      }
    };

    handleCallback();
  }, [searchParams, navigate, setAuth]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary-light">
      <div className="text-center">
        <Loader2 size={60} className="text-accent-gold animate-spin mx-auto mb-4" />
        <h2 className="font-cinzel text-2xl font-semibold text-primary-dark">
          Completing login...
        </h2>
      </div>
    </div>
  );
}

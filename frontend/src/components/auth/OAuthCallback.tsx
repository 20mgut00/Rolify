import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store';
import toast from 'react-hot-toast';

export default function OAuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setAuth } = useAuthStore();
  const { t } = useTranslation();

  useEffect(() => {
    const handleCallback = async () => {
      const token = searchParams.get('token');
      const refreshToken = searchParams.get('refreshToken');
      const error = searchParams.get('error');

      if (error) {
        toast.error(t('auth.loginFailed', { error }));
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
          toast.success(t('auth.loggedInWithGoogle'));
          navigate('/');
        } catch {
          toast.error(t('auth.loginError'));
          navigate('/');
        }
      } else {
        toast.error(t('auth.missingTokens'));
        navigate('/');
      }
    };

    handleCallback();
  }, [searchParams, navigate, setAuth, t]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary-light">
      <div className="text-center">
        <Loader2 size={60} className="text-accent-gold animate-spin mx-auto mb-4" />
        <h2 className="font-cinzel text-2xl font-semibold text-primary-dark">
          {t('auth.completingLogin')}
        </h2>
      </div>
    </div>
  );
}

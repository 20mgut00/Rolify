import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { authAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');

      if (!token) {
        setStatus('error');
        setMessage('Invalid verification link');
        return;
      }

      try {
        await authAPI.verifyEmail(token);
        setStatus('success');
        setMessage('Email verified successfully!');
        toast.success('Email verified! You can now use all features.');

        // Redirect to home after 3 seconds
        setTimeout(() => {
          navigate('/');
        }, 3000);
      } catch (error) {
        setStatus('error');
        const errorMessage = error instanceof Error ? error.message : 'Verification failed. The link may have expired.';
        setMessage(errorMessage);
        toast.error('Email verification failed');
      }
    };

    verifyEmail();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-primary-light">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        {status === 'loading' && (
          <>
            <Loader2 size={64} className="text-accent-gold animate-spin mx-auto mb-4" />
            <h2 className="font-cinzel text-2xl font-bold text-primary-dark mb-2">
              Verifying Email
            </h2>
            <p className="text-primary-dark/70">
              Please wait while we verify your email address...
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle size={64} className="text-green-600 mx-auto mb-4" />
            <h2 className="font-cinzel text-2xl font-bold text-primary-dark mb-2">
              Email Verified!
            </h2>
            <p className="text-primary-dark/70 mb-3">{message}</p>
            <p className="text-primary-dark/50 text-sm">
              Redirecting to home page...
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle size={64} className="text-red-600 mx-auto mb-4" />
            <h2 className="font-cinzel text-2xl font-bold text-primary-dark mb-2">
              Verification Failed
            </h2>
            <p className="text-primary-dark/70 mb-6">{message}</p>
            <button
              onClick={() => navigate('/')}
              className="bg-accent-gold text-primary-dark px-6 py-3 rounded-lg font-cinzel font-medium hover:bg-opacity-90 transition"
            >
              Go to Home
            </button>
          </>
        )}
      </div>
    </div>
  );
}

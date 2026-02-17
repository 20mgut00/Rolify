import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Lock, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { authAPI } from '../../services/api';
import toast from 'react-hot-toast';

const resetPasswordSchema = z.object({
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const token = searchParams.get('token');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      toast.error('Invalid reset link');
      return;
    }

    setIsLoading(true);
    try {
      await authAPI.resetPassword(token, data.newPassword);
      setIsSuccess(true);
      toast.success('Password reset successfully!');

      // Redirect to home after 3 seconds
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to reset password. The link may have expired.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-primary-light">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center dark-shared-panel">
          <h2 className="font-cinzel text-2xl font-bold text-primary-dark mb-3">
            Invalid Reset Link
          </h2>
          <p className="text-primary-dark/70 mb-6">
            The password reset link is invalid or has expired.
          </p>
          <button
            onClick={() => navigate('/')}
            className="bg-accent-gold text-primary-dark px-6 py-3 rounded-lg font-cinzel font-medium hover:bg-opacity-90 transition"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-primary-light">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center dark-shared-panel">
          <CheckCircle size={64} className="text-green-600 mx-auto mb-4" />
          <h2 className="font-cinzel text-2xl font-bold text-primary-dark mb-2">
            Password Reset Successfully!
          </h2>
          <p className="text-primary-dark/70 mb-3">
            Your password has been changed. You can now login with your new password.
          </p>
          <p className="text-primary-dark/50 text-sm">
            Redirecting to home page...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-primary-light">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 dark-shared-panel">
        <h1 className="font-cinzel text-3xl font-bold text-primary-dark mb-1">
          Reset Password
        </h1>
        <p className="text-primary-dark/70 mb-6">Enter your new password below.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-primary-dark">
              New Password
            </label>
            <div className="relative flex items-center">
              <Lock size={20} className="absolute left-3 text-primary-dark pointer-events-none" />
              <input
                {...register('newPassword')}
                type={showPassword ? 'text' : 'password'}
                className="w-full pl-10 pr-10 py-2 border border-primary-dark/20 rounded-lg focus:ring-2 focus:ring-accent-gold focus:border-transparent text-primary-dark"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 text-primary-dark hover:text-accent-gold transition"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.newPassword && (
              <p className="text-red-600 text-sm mt-1">{errors.newPassword.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-primary-dark">
              Confirm Password
            </label>
            <div className="relative flex items-center">
              <Lock size={20} className="absolute left-3 text-primary-dark pointer-events-none" />
              <input
                {...register('confirmPassword')}
                type={showConfirmPassword ? 'text' : 'password'}
                className="w-full pl-10 pr-10 py-2 border border-primary-dark/20 rounded-lg focus:ring-2 focus:ring-accent-gold focus:border-transparent text-primary-dark"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 text-primary-dark hover:text-accent-gold transition"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-red-600 text-sm mt-1">{errors.confirmPassword.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-accent-gold text-primary-dark py-3 rounded-lg font-cinzel font-medium hover:bg-opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Resetting...' : 'Reset Password'}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="text-accent-gold hover:underline font-medium"
            >
              Back to home
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Lock, User, Mail, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { authAPI } from '../../services/api';
import { useAuthStore } from '../../store';
import { useNavigate } from 'react-router-dom';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

export default function Settings() {
  // React 19 feature: Dynamic document title
  useDocumentTitle('Settings - RPG Character Creator');

  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
  });

  const onChangePassword = async (data: ChangePasswordFormData) => {
    setIsChangingPassword(true);
    try {
      await authAPI.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      toast.success('Password changed successfully!');
      reset();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to change password';
      toast.error(errorMessage);
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete your account? This action cannot be undone and all your characters will be permanently deleted.'
    );

    if (confirmed) {
      const doubleCheck = window.prompt(
        'Type "DELETE" to confirm account deletion:'
      );

      if (doubleCheck === 'DELETE') {
        try {
          await authAPI.deleteAccount();
          toast.success('Account deleted successfully');
          logout();
          navigate('/');
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to delete account';
          toast.error(errorMessage);
        }
      }
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="font-cinzel text-4xl font-bold text-primary-dark mb-4">
            Settings
          </h1>
          <p className="text-primary-dark/70 mb-6">
            You need to be logged in to access settings.
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

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="font-cinzel text-4xl font-bold text-primary-dark mb-8">
          Settings
        </h1>

        {/* Account Information */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="font-cinzel text-2xl font-bold text-primary-dark mb-4 flex items-center gap-2">
            <User size={24} />
            Account Information
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-primary-dark/70 mb-1">
                Name
              </label>
              <p className="text-lg text-primary-dark">{user.name}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-primary-dark/70 mb-1">
                Email
              </label>
              <div className="flex items-center gap-2">
                <Mail size={18} className="text-primary-dark/50" />
                <p className="text-lg text-primary-dark">{user.email}</p>
                {user.emailVerified ? (
                  <span className="text-green-600 flex items-center gap-1 text-sm">
                    <CheckCircle size={16} />
                    Verified
                  </span>
                ) : (
                  <span className="text-yellow-600 flex items-center gap-1 text-sm">
                    <AlertCircle size={16} />
                    Not verified
                  </span>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* Change Password */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="font-cinzel text-2xl font-bold text-primary-dark mb-4 flex items-center gap-2">
            <Lock size={24} />
            Change Password
          </h2>
          
          <form onSubmit={handleSubmit(onChangePassword)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-primary-dark">
                Current Password
              </label>
              <div className="relative flex items-center">
                <Lock size={20} className="absolute left-3 text-primary-dark pointer-events-none" />
                <input
                  {...register('currentPassword')}
                  type={showPassword ? 'text' : 'password'}
                  className="w-full pl-10 pr-10 py-2 border border-primary-dark/20 rounded-lg focus:ring-2 focus:ring-accent-gold focus:border-transparent text-primary-dark placeholder-primary-dark/50"
                  placeholder="current password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-primary-dark hover:text-accent-gold transition"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.currentPassword && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.currentPassword.message as string}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-primary-dark">
                New Password
              </label>
              <div className="relative flex items-center">
                <Lock size={20} className="absolute left-3 text-primary-dark pointer-events-none" />
                <input
                  {...register('newPassword')}
                  type={showPassword ? 'text' : 'password'}
                  className="w-full pl-10 pr-10 py-2 border border-primary-dark/20 rounded-lg focus:ring-2 focus:ring-accent-gold focus:border-transparent text-primary-dark placeholder-primary-dark/50"
                  placeholder="new password"
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
                <p className="text-red-600 text-sm mt-1">
                  {errors.newPassword.message as string}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-primary-dark">
                Confirm New Password
              </label>
              <div className="relative flex items-center">
                <Lock size={20} className="absolute left-3 text-primary-dark pointer-events-none" />
                <input
                  {...register('confirmPassword')}
                  type={showPassword ? 'text' : 'password'}
                  className="w-full pl-10 pr-10 py-2 border border-primary-dark/20 rounded-lg focus:ring-2 focus:ring-accent-gold focus:border-transparent text-primary-dark placeholder-primary-dark/50"
                  placeholder="new password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-primary-dark hover:text-accent-gold transition"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.confirmPassword.message as string}
                </p>
              )}
            </div>


            <button
              type="submit"
              disabled={isChangingPassword}
              className="w-full bg-accent-gold text-primary-dark py-3 rounded-lg font-cinzel font-medium hover:bg-opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isChangingPassword ? 'Changing...' : 'Change Password'}
            </button>
          </form>
        </div>

        {/* Danger Zone */}
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6">
          <h2 className="font-cinzel text-2xl font-bold text-red-600 mb-4 flex items-center gap-2">
            <AlertCircle size={24} />
            Danger Zone
          </h2>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm text-red-600 mb-3">
                Once you delete your account, there is no going back. All your characters will be permanently deleted.
              </p>
              <button
                onClick={handleDeleteAccount}
                className="bg-white border-2 border-red-600 text-red-600 px-6 py-2 rounded-lg font-semibold hover:bg-red-50 hover:border-red-700 transition"
              >
                Delete Account
              </button>
            </div>

            <div className="pt-4 border-t border-red-200">
              <p className="text-sm text-primary-dark/70 mb-3">
                Sign out of your account
              </p>
              <button
                onClick={() => {
                  logout();
                  navigate('/');
                  toast.success('Logged out successfully');
                }}
                className="bg-primary-dark text-primary-light px-6 py-2 rounded-lg font-medium hover:bg-opacity-90 transition"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Lock, User, Mail, AlertCircle, CheckCircle, Eye, EyeOff, Globe } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { authAPI } from '../../services/api';
import { useAccessibilityStore, useAuthStore } from '../../store';
import { useNavigate } from 'react-router-dom';
import ConfirmModal from '../common/ConfirmModal';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

type ChangePasswordFormData = { currentPassword: string; newPassword: string; confirmPassword: string };

export default function Settings() {
  const { t, i18n } = useTranslation();

  useDocumentTitle(`${t('settings.title')} - RPG Character Creator`);

  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const {
    darkMode,
    reducedMotion,
    largeText,
    language,
    setDarkMode,
    setReducedMotion,
    setLargeText,
    setLanguage,
  } = useAccessibilityStore();
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const changePasswordSchema = useMemo(() => z.object({
    currentPassword: z.string().min(1, t('validation.currentPasswordRequired')),
    newPassword: z.string().min(8, t('validation.passwordMinLength')),
    confirmPassword: z.string(),
  }).refine((data) => data.newPassword === data.confirmPassword, {
    message: t('validation.passwordsDontMatch'),
    path: ['confirmPassword'],
  }), [t]);

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
      toast.success(t('settings.passwordChanged'));
      reset();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t('errors.changePasswordFailed');
      toast.error(errorMessage);
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await authAPI.deleteAccount();
      toast.success(t('settings.accountDeleted'));
      logout();
      navigate('/');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t('errors.deleteAccountFailed');
      toast.error(errorMessage);
    }
  };

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    i18n.changeLanguage(lang);
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="font-cinzel text-4xl font-bold text-primary-dark mb-8">
          {t('settings.title')}
        </h1>

        {/* Account Information - only when logged in */}
        {user && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6 dark-shared-panel">
            <h2 className="font-cinzel text-2xl font-bold text-primary-dark mb-4 flex items-center gap-2">
              <User size={24} />
              {t('settings.accountInfo')}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-primary-dark/70 mb-1">
                  {t('settings.name')}
                </label>
                <p className="text-lg text-primary-dark">{user.name}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-primary-dark/70 mb-1">
                  {t('settings.email')}
                </label>
                <div className="flex items-center gap-2">
                  <Mail size={18} className="text-primary-dark/50" />
                  <p className="text-lg text-primary-dark">{user.email}</p>
                  {user.emailVerified ? (
                    <span className="text-green-600 flex items-center gap-1 text-sm">
                      <CheckCircle size={16} />
                      {t('settings.verified')}
                    </span>
                  ) : (
                    <span className="text-yellow-600 flex items-center gap-1 text-sm">
                      <AlertCircle size={16} />
                      {t('settings.notVerified')}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Change Password - only when logged in */}
        {user && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6 dark-shared-panel">
            <h2 className="font-cinzel text-2xl font-bold text-primary-dark mb-4 flex items-center gap-2">
              <Lock size={24} />
              {t('settings.changePassword')}
            </h2>

            <form onSubmit={handleSubmit(onChangePassword)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-primary-dark">
                  {t('settings.currentPassword')}
                </label>
                <div className="relative flex items-center">
                  <Lock size={20} className="absolute left-3 text-primary-dark pointer-events-none" />
                  <input
                    {...register('currentPassword')}
                    type={showPassword ? 'text' : 'password'}
                    className="w-full pl-10 pr-10 py-2 border border-primary-dark/20 rounded-lg focus:ring-2 focus:ring-accent-gold focus:border-transparent text-primary-dark placeholder-primary-dark/50"
                    placeholder={t('settings.currentPasswordPlaceholder')}
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
                  {t('settings.newPassword')}
                </label>
                <div className="relative flex items-center">
                  <Lock size={20} className="absolute left-3 text-primary-dark pointer-events-none" />
                  <input
                    {...register('newPassword')}
                    type={showPassword ? 'text' : 'password'}
                    className="w-full pl-10 pr-10 py-2 border border-primary-dark/20 rounded-lg focus:ring-2 focus:ring-accent-gold focus:border-transparent text-primary-dark placeholder-primary-dark/50"
                    placeholder={t('settings.newPasswordPlaceholder')}
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
                  {t('settings.confirmNewPassword')}
                </label>
                <div className="relative flex items-center">
                  <Lock size={20} className="absolute left-3 text-primary-dark pointer-events-none" />
                  <input
                    {...register('confirmPassword')}
                    type={showPassword ? 'text' : 'password'}
                    className="w-full pl-10 pr-10 py-2 border border-primary-dark/20 rounded-lg focus:ring-2 focus:ring-accent-gold focus:border-transparent text-primary-dark placeholder-primary-dark/50"
                    placeholder={t('settings.newPasswordPlaceholder')}
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
                {isChangingPassword ? t('settings.changing') : t('settings.changePassword')}
              </button>
            </form>
          </div>
        )}

        {/* Language */}
        <div className="bg-white rounded-lg shadow-lg p-6 mt-6 dark-shared-panel">
          <h2 className="font-cinzel text-2xl font-bold text-primary-dark mb-4 flex items-center gap-2">
            <Globe size={24} />
            {t('settings.language')}
          </h2>

          <div className="space-y-4">
            <p className="text-sm text-primary-dark/70">{t('settings.languageDesc')}</p>
            <select
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="w-full px-4 py-3 border border-primary-dark/20 rounded-lg focus:ring-2 focus:ring-accent-gold focus:border-transparent text-primary-dark bg-white appearance-none cursor-pointer dark-field"
            >
              <option value="en">{t('settings.english')}</option>
              <option value="es">{t('settings.spanish')}</option>
            </select>
          </div>
        </div>

        {/* Accessibility */}
        <div className="bg-white rounded-lg shadow-lg p-6 mt-6 dark-shared-panel">
          <h2 className="font-cinzel text-2xl font-bold text-primary-dark mb-4">
            {t('settings.accessibility')}
          </h2>

          <div className="space-y-4">
            <label className="flex items-center justify-between gap-4 p-3 rounded-lg border border-primary-dark/15">
              <div>
                <p className="font-medium text-primary-dark">{t('settings.darkMode')}</p>
                <p className="text-sm text-primary-dark/70">{t('settings.darkModeDesc')}</p>
              </div>
              <input
                type="checkbox"
                checked={darkMode}
                onChange={(e) => setDarkMode(e.target.checked)}
                className="w-5 h-5 rounded border-primary-dark/30 text-accent-gold focus:ring-accent-gold"
              />
            </label>

            <label className="flex items-center justify-between gap-4 p-3 rounded-lg border border-primary-dark/15">
              <div>
                <p className="font-medium text-primary-dark">{t('settings.reduceMotion')}</p>
                <p className="text-sm text-primary-dark/70">{t('settings.reduceMotionDesc')}</p>
              </div>
              <input
                type="checkbox"
                checked={reducedMotion}
                onChange={(e) => setReducedMotion(e.target.checked)}
                className="w-5 h-5 rounded border-primary-dark/30 text-accent-gold focus:ring-accent-gold"
              />
            </label>

            <label className="flex items-center justify-between gap-4 p-3 rounded-lg border border-primary-dark/15">
              <div>
                <p className="font-medium text-primary-dark">{t('settings.largerText')}</p>
                <p className="text-sm text-primary-dark/70">{t('settings.largerTextDesc')}</p>
              </div>
              <input
                type="checkbox"
                checked={largeText}
                onChange={(e) => setLargeText(e.target.checked)}
                className="w-5 h-5 rounded border-primary-dark/30 text-accent-gold focus:ring-accent-gold"
              />
            </label>
          </div>
        </div>

        {/* Danger Zone - only when logged in */}
        {user && (
          <div className="bg-red-50 border-2 border-red-200 dark:bg-red-950/30 dark:border-red-900 rounded-lg p-6 mt-6">
            <h2 className="font-cinzel text-2xl font-bold text-red-600 dark:text-red-300 mb-4 flex items-center gap-2">
              <AlertCircle size={24} />
              {t('settings.dangerZone')}
            </h2>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-red-600 dark:text-red-300/90 mb-3">
                  {t('settings.deleteAccountWarning')}
                </p>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="bg-white border-2 border-red-600 text-red-600 dark:bg-red-950/45 dark:border-red-500 dark:text-red-300 px-6 py-2 rounded-lg font-semibold hover:bg-red-50 dark:hover:bg-red-900/55 hover:border-red-700 dark:hover:border-red-400 transition"
                >
                  {t('settings.deleteAccount')}
                </button>
                <ConfirmModal
                  isOpen={showDeleteModal}
                  onClose={() => setShowDeleteModal(false)}
                  onConfirm={handleDeleteAccount}
                  title={t('settings.deleteAccount')}
                  message={t('settings.deleteAccountConfirm')}
                  confirmText={t('settings.deleteAccount')}
                  variant="danger"
                  requireTypedConfirmation="DELETE"
                />
              </div>

              <div className="pt-4 border-t border-red-200 dark:border-red-900">
                <p className="text-sm text-primary-dark/70 mb-3">
                  {t('settings.signOutDesc')}
                </p>
                <button
                  onClick={() => {
                    logout();
                    navigate('/');
                    toast.success(t('settings.loggedOut'));
                  }}
                  className="bg-primary-dark text-primary-light px-6 py-2 rounded-lg font-medium hover:bg-opacity-90 transition"
                >
                  {t('settings.signOut')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

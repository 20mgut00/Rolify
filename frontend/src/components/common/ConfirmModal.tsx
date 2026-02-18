import { useState, useEffect, useRef } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning';
  /** If set, user must type this exact text to enable the confirm button */
  requireTypedConfirmation?: string;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  cancelText,
  variant = 'danger',
  requireTypedConfirmation,
}: ConfirmModalProps) {
  const { t } = useTranslation();
  const resolvedConfirmText = confirmText ?? t('common.confirm');
  const resolvedCancelText = cancelText ?? t('common.cancel');
  const [typedValue, setTypedValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTypedValue('');
      // Focus input if confirmation typing is required
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const canConfirm = requireTypedConfirmation
    ? typedValue === requireTypedConfirmation
    : true;

  const confirmBtnClass =
    variant === 'danger'
      ? 'bg-red-600 text-white hover:bg-red-700 disabled:bg-red-300'
      : 'bg-yellow-500 text-white hover:bg-yellow-600 disabled:bg-yellow-300';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-primary-dark/40 hover:text-primary-dark transition"
        >
          <X size={20} />
        </button>

        {/* Icon */}
        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
          variant === 'danger' ? 'bg-red-100' : 'bg-yellow-100'
        }`}>
          <AlertTriangle
            size={24}
            className={variant === 'danger' ? 'text-red-600' : 'text-yellow-600'}
          />
        </div>

        {/* Content */}
        <h3 className="font-cinzel text-xl font-bold text-primary-dark mb-2">
          {title}
        </h3>
        <p className="text-primary-dark/70 text-sm mb-6">
          {message}
        </p>

        {/* Typed confirmation input */}
        {requireTypedConfirmation && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-primary-dark mb-2">
              <Trans i18nKey="common.typeToConfirm" values={{ text: requireTypedConfirmation }}>
                Type <span className="font-mono font-bold text-red-600">{'{{text}}'}</span> to confirm:
              </Trans>
            </label>
            <input
              ref={inputRef}
              type="text"
              value={typedValue}
              onChange={(e) => setTypedValue(e.target.value)}
              className="w-full px-4 py-2 border border-primary-dark/20 rounded-lg focus:ring-2 focus:ring-red-400 focus:border-transparent text-primary-dark"
              placeholder={requireTypedConfirmation}
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg font-medium text-primary-dark bg-primary-dark/10 hover:bg-primary-dark/20 transition"
          >
            {resolvedCancelText}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            disabled={!canConfirm}
            className={`px-5 py-2.5 rounded-lg font-medium transition disabled:cursor-not-allowed ${confirmBtnClass}`}
          >
            {resolvedConfirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

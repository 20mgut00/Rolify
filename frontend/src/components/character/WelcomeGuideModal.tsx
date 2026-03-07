import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { BookOpen, X, Lightbulb } from 'lucide-react';

interface WelcomeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WelcomeGuideModal({ isOpen, onClose }: WelcomeGuideModalProps) {
  const { t } = useTranslation();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const steps = [
    { label: t('welcomeGuide.step1Label'), desc: t('welcomeGuide.step1Desc') },
    { label: t('welcomeGuide.step2Label'), desc: t('welcomeGuide.step2Desc') },
    { label: t('welcomeGuide.step3Label'), desc: t('welcomeGuide.step3Desc') },
    { label: t('welcomeGuide.step4Label'), desc: t('welcomeGuide.step4Desc') },
    { label: t('welcomeGuide.step5Label'), desc: t('welcomeGuide.step5Desc') },
    { label: t('welcomeGuide.step6Label'), desc: t('welcomeGuide.step6Desc') },
    { label: t('welcomeGuide.step7Label'), desc: t('welcomeGuide.step7Desc') },
    { label: t('welcomeGuide.step8Label'), desc: t('welcomeGuide.step8Desc') },
    { label: t('welcomeGuide.step9Label'), desc: t('welcomeGuide.step9Desc') },
    { label: t('welcomeGuide.step10Label'), desc: t('welcomeGuide.step10Desc') },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal — bg-primary-light + dark-shared-panel adapts to dark mode */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="welcome-guide-title"
        aria-describedby="welcome-guide-subtitle"
        className="relative bg-primary-light dark-shared-panel rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col animate-in fade-in zoom-in duration-200 border border-accent-gold/20"
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-primary-dark/40 hover:text-primary-dark transition z-10"
          aria-label={t('common.cancel')}
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="p-6 pb-4 border-b border-accent-gold/20">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-accent-gold/15 flex items-center justify-center shrink-0">
              <BookOpen size={20} className="text-accent-gold" />
            </div>
            <div>
              <h3 id="welcome-guide-title" className="font-cinzel text-lg font-bold text-primary-dark leading-tight">
                {t('welcomeGuide.title')}
              </h3>
              <p id="welcome-guide-subtitle" className="text-sm text-primary-dark/60 mt-0.5">
                {t('welcomeGuide.subtitle')}
              </p>
            </div>
          </div>
        </div>

        {/* Steps list — scrollable */}
        <div className="overflow-y-auto flex-1 px-6 py-4">
          <ol className="space-y-3">
            {steps.map((step, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-accent-gold/20 border border-accent-gold/40 flex items-center justify-center text-xs font-bold text-accent-gold shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <div>
                  <p className="text-sm font-semibold text-primary-dark leading-snug">{step.label}</p>
                  <p className="text-xs text-primary-dark/60 mt-0.5">{step.desc}</p>
                </div>
              </li>
            ))}
          </ol>

          {/* Tip — uses theme colors instead of hardcoded purple */}
          <div className="mt-4 flex items-start gap-2 bg-accent-gold/10 border border-accent-gold/30 rounded-lg p-3">
            <Lightbulb size={15} className="text-accent-gold shrink-0 mt-0.5" />
            <p className="text-xs text-primary-dark/80">{t('welcomeGuide.tip')}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-accent-gold/20">
          <button
            type="button"
            onClick={onClose}
            className="w-full px-5 py-2.5 rounded-lg font-bold text-primary-dark bg-accent-gold hover:bg-accent-gold/90 transition"
          >
            {t('welcomeGuide.startButton')}
          </button>
        </div>
      </div>
    </div>
  );
}

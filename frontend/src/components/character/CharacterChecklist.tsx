import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, Circle, ClipboardList, X } from 'lucide-react';

export interface ChecklistStep {
  label: string;
  completed: boolean;
}

interface CharacterChecklistProps {
  steps: ChecklistStep[];
}

export default function CharacterChecklist({ steps }: CharacterChecklistProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const doneCount = steps.filter((s) => s.completed).length;
  const total = steps.length;
  const allDone = doneCount === total;

  return (
    <>
      {/* Backdrop — mobile only, starts below the header */}
      {isOpen && (
        <div
          className="fixed inset-x-0 top-16.5 bottom-0 bg-black/40 z-1098 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Side panel — top-16.5 = 66px (MUI Toolbar minHeight 64px + py:1) */}
      <div
        className={`
          fixed top-16.5 right-0 h-[calc(100vh-66px)] w-full sm:w-72 z-1099
          bg-white bg-panel-solid border-l border-accent-gold/20 shadow-2xl
          flex flex-col
          transition-transform duration-300
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
        aria-hidden={!isOpen}
      >
        {/* Panel header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-accent-gold/20 shrink-0">
          <div className="flex items-center gap-2">
            <ClipboardList size={16} className="text-accent-gold" />
            <span className="font-cinzel font-bold text-sm text-primary-dark">
              {t('checklist.title')}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
              allDone
                ? 'bg-green-100 border-green-300 text-green-700'
                : 'bg-accent-gold/15 border-accent-gold/40 text-accent-gold'
            }`}>
              {t('checklist.progress', { done: doneCount, total })}
            </span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-primary-dark/40 hover:text-primary-dark transition"
              aria-label={t('common.cancel')}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="px-5 pt-3 shrink-0">
          <div className="w-full h-1.5 bg-primary-dark/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-accent-gold rounded-full transition-all duration-500"
              style={{ width: `${(doneCount / total) * 100}%` }}
            />
          </div>
        </div>

        {/* Steps list */}
        <ol className="flex-1 overflow-y-auto px-5 py-4 space-y-1">
          {steps.map((step, i) => (
            <li
              key={i}
              className={`flex items-center gap-3 py-2 px-3 rounded-lg transition-colors ${
                step.completed ? 'bg-green-500/8' : 'hover:bg-primary-dark/5'
              }`}
            >
              {step.completed ? (
                <CheckCircle2 size={17} className="text-green-500 shrink-0" />
              ) : (
                <Circle size={17} className="text-primary-dark/25 shrink-0" />
              )}
              <span className={`text-sm leading-snug ${
                step.completed
                  ? 'text-primary-dark/50 line-through'
                  : 'text-primary-dark font-medium'
              }`}>
                <span className="text-xs text-primary-dark/40 mr-1.5">{i + 1}.</span>
                {step.label}
              </span>
            </li>
          ))}
        </ol>
      </div>

      {/* FAB — only visible when panel is closed */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label={t('checklist.openLabel')}
          className={`
            fixed bottom-6 right-6 z-1099
            flex items-center gap-2 px-4 py-2.5 rounded-full shadow-lg
            font-semibold text-sm transition-all duration-200
            hover:scale-105 hover:shadow-xl
            ${allDone
              ? 'bg-green-500 text-white'
              : 'bg-accent-gold text-primary-dark'
            }
          `}
        >
          <ClipboardList size={16} />
          <span>{doneCount}/{total}</span>
        </button>
      )}
    </>
  );
}

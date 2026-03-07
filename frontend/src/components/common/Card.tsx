import Tooltip from '@mui/material/Tooltip';
import { HelpCircle } from 'lucide-react';

interface CardProps {
  label?: string;
  desc?: string;
  helpText?: string;
  children: React.ReactNode;
  className?: string;
  required?: boolean;
  error?: string;
}

export default function Card({ label, desc, helpText, children, className, required, error }: CardProps) {
  return (
    <div className={className}>
      <label className="block text-start text-primary-dark font-semibold mb-2">
        <span className="inline-flex items-center gap-1.5">
          {label}
          {required && <span className="text-red-500">*</span>}
          {helpText && (
            <Tooltip title={helpText} arrow placement="top">
              <button type="button" className="text-primary-dark/40 hover:text-accent-gold transition cursor-help">
                <HelpCircle size={14} />
              </button>
            </Tooltip>
          )}
        </span>
        {desc && (
          <span className="block text-sm text-primary-dark/70 font-normal mt-1">
            {desc}
          </span>
        )}
      </label>

      <div className={`w-full px-4 py-3 rounded-lg border-2 bg-white shadow-sm dark-shared-panel ${error ? 'border-red-400' : 'border-accent-gold/30'}`}>
        {children}
      </div>
      {error && (
        <p className="text-red-500 text-sm mt-1">{error}</p>
      )}
    </div>
  );
}

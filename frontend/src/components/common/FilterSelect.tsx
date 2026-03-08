import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface Option {
  value: string;
  label: string;
}

interface FilterSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  icon: React.ReactNode;
}

export default function FilterSelect({ value, onChange, options, icon }: FilterSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selected = options.find((o) => o.value === value);

  return (
    <div ref={ref} className="relative w-full">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="w-full flex items-center gap-3 pl-3 pr-3 py-3 border border-primary-dark/20 rounded-lg bg-white dark-field text-primary-dark text-left cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent-gold"
      >
        <span className="shrink-0 text-primary-dark/50">{icon}</span>
        <span className="flex-1 min-w-0 truncate text-sm sm:text-base">{selected?.label}</span>
        <ChevronDown
          size={16}
          className={`shrink-0 text-primary-dark/50 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <ul className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-900 border border-primary-dark/20 rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto py-1">
          {options.map((option) => (
            <li key={option.value}>
              <button
                type="button"
                onClick={() => { onChange(option.value); setOpen(false); }}
                className={`w-full px-4 py-2.5 text-left text-sm cursor-pointer transition-colors ${
                  option.value === value
                    ? 'bg-accent-gold/20 text-accent-gold font-semibold'
                    : 'text-primary-dark dark:text-white hover:bg-accent-gold/10'
                }`}
              >
                {option.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

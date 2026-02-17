type ButtonProps = {
  onClick: () => void;
  label: string;
  verticalPadding?: string;
  horizontalPadding?: string;
  hoverEffect?: string;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
};

export default function Button({
  onClick,
  label,
  verticalPadding,
  horizontalPadding,
  type = 'button',
  disabled = false,
}: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${horizontalPadding} ${verticalPadding} cursor-pointer rounded-lg transition-all duration-200 transform-gpu shadow-xl text-xl bg-accent-gold text-primary-dark hover:opacity-90 hover:scale-[1.02] hover:-translate-y-px hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100 disabled:hover:translate-y-0 disabled:hover:brightness-100`}
    >
      <h3 className="font-semibold text-lg">{label}</h3>
    </button>
  );
}

<button
  onClick={() => {}}
  className="px-8 py-4 cursor-pointer rounded-lg transition-all duration-200 transform-gpu hover:opacity-90 hover:scale-[1.02] hover:-translate-y-px hover:brightness-105 shadow-xl text-xl bg-accent-gold text-primary-dark disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100 disabled:hover:translate-y-0 disabled:hover:brightness-100"
>
  Start Creating Your Character Now
</button>;

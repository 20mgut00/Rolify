type ButtonProps = {
  onClick: () => void;
  label: string;
  verticalPadding?: string;
  horizontalPadding?: string;
  hoverEffect?: string;
  type?: 'button' | 'submit' | 'reset';
};

export default function Button({
  onClick,
  label,
  verticalPadding,
  horizontalPadding,
  type = 'button',
}: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`${horizontalPadding} ${verticalPadding} rounded-lg transition-all hover:opacity-90 hover:scale-105 shadow-xl text-xl bg-accent-gold text-primary-dark`}
    >
      <h3 className="font-semibold text-lg">{label}</h3>
    </button>
  );
}

<button
  onClick={() => {}}
  className="px-8 py-4 rounded-lg transition-all hover:opacity-90 hover:scale-105 shadow-xl text-xl bg-accent-gold text-primary-dark"
>
  Start Creating Your Character Now
</button>;

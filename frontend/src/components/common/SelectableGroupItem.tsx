type SelectableGroupProps = {
  type: "radio" | "checkbox";
  label: string;
  groupName: string;
  checked?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  description: string;
};

export default function SelectableGroup({
  type,
  label,
  groupName,
  checked,
  onChange,
  description,
}: SelectableGroupProps) {
  return (
    <div>
      <label className="text-xl text-primary-dark font-semibold">
        <input
          type={type}
          value={label}
          name={groupName}
          checked={checked}
          onChange={onChange}
          className="mr-2"
        />
        {label}
      </label>
      <p className="text-sm text-primary-dark text-opacity-70">{description}</p>
    </div>
  );
}

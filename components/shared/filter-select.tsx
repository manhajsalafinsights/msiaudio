import { Select } from "@/components/ui/select";

type Option = { value: string; label: string };

type FilterSelectProps = {
  label?: string;
  name: string;
  value: string;
  options: Option[];
  onChange: (value: string) => void;
};

/** Dropdown filter — dipakai di FilterPanel & AudioFilterPanel (desktop & mobile sheet). */
export function FilterSelect({ label, name, value, options, onChange }: FilterSelectProps) {
  return (
    <label className="flex flex-col gap-1.5">
      {label && <span className="text-xs font-medium text-muted">{label}</span>}
      <Select
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </Select>
    </label>
  );
}

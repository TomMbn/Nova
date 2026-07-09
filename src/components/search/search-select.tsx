import { ChevronDown } from "lucide-react";

type Option = { id: string; name: string };

export function SearchSelect({
  name,
  label,
  value,
  options,
}: {
  name: string;
  label: string;
  value?: string;
  options: Option[];
}) {
  return (
    <div className="relative">
      <select
        name={name}
        defaultValue={value ?? ""}
        className="w-full h-[52px] appearance-none rounded-2xl border border-[#e8e8e8] bg-transparent pl-4 pr-10 text-[14px] text-foreground outline-none focus-visible:border-[#1e1e1e]"
      >
        <option value="">{label}</option>
        {options.map((opt) => (
          <option key={opt.id} value={opt.id}>
            {opt.name}
          </option>
        ))}
      </select>
      <ChevronDown
        size={18}
        strokeWidth={1.8}
        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#888]"
      />
    </div>
  );
}

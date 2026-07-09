"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

type Option = { id: string; name: string };

function buildHref(current: URLSearchParams, paramName: string, id: string) {
  const params = new URLSearchParams(current.toString());
  if (params.get(paramName) === id) {
    params.delete(paramName);
  } else {
    params.set(paramName, id);
  }
  const qs = params.toString();
  return qs ? `/recherche?${qs}` : "/recherche";
}

export function FilterChips({
  paramName,
  label,
  options,
}: {
  paramName: string;
  label: string;
  options: Option[];
}) {
  const searchParams = useSearchParams();
  const activeId = searchParams.get(paramName);

  if (options.length === 0) return null;

  return (
    <div className="flex flex-col gap-1.5 px-[14px]">
      <span className="text-[11px] font-bold text-[#888] uppercase tracking-wide">
        {label}
      </span>
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {options.map((opt) => (
          <Link
            key={opt.id}
            href={buildHref(searchParams, paramName, opt.id)}
            scroll={false}
            className={cn(
              "shrink-0 px-[10px] py-1 h-6 rounded-[10px] text-[12px] font-bold whitespace-nowrap transition-colors",
              activeId === opt.id
                ? "bg-[#1e1e1e] text-[#e8e8e8]"
                : "bg-[#e8e8e8] text-foreground"
            )}
          >
            {opt.name}
          </Link>
        ))}
      </div>
    </div>
  );
}

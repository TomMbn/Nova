"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

type Option = { id: string; name: string };

/**
 * Groupe de chips sélectionnables (catégorie en simple sélection,
 * thématiques/compétences en sélection multiple — la logique de bascule
 * reste côté appelant via `onToggle`).
 *
 * N'affiche que les `initialVisible` premières options ; le bouton "+"
 * déplie le reste, pour matcher la maquette Figma sans dépendre d'une
 * recherche/popover que le MVP n'a pas encore.
 */
export function ChipGroup({
  options,
  selected,
  onToggle,
  initialVisible = 5,
}: {
  options: Option[];
  selected: string[];
  onToggle: (id: string) => void;
  initialVisible?: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const hasMore = options.length > initialVisible;
  const visible = expanded ? options : options.slice(0, initialVisible);

  return (
    <div className="flex flex-wrap gap-2">
      {visible.map((opt) => {
        const isSelected = selected.includes(opt.id);
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onToggle(opt.id)}
            className={cn(
              "px-[14px] h-8 rounded-[10px] text-[13px] font-bold leading-none transition-colors border",
              isSelected
                ? "bg-[#1e1e1e] border-[#1e1e1e] text-[#e8e8e8]"
                : "bg-background border-[#e8e8e8] text-foreground hover:bg-muted"
            )}
          >
            {opt.name}
          </button>
        );
      })}
      {hasMore && !expanded && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          aria-label="Afficher plus d'options"
          className="flex items-center justify-center size-8 rounded-[10px] border border-[#e8e8e8] hover:bg-muted transition-colors shrink-0"
        >
          <Plus size={16} strokeWidth={1.8} />
        </button>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";

type Option = { id: string; name: string };

// Le composant est remonté via `key={value}` par l'appelant à chaque
// changement d'URL (ex. lien "Réinitialiser les filtres") : c'est ce qui
// resynchronise la sélection plutôt qu'un useEffect (state dérivé d'une
// prop → remount, cf. doc React "You Might Not Need An Effect").
export function FilterChipGroup({
  name,
  options,
  value,
}: {
  name: string;
  options: Option[];
  value?: string;
}) {
  const [selected, setSelected] = useState(value ?? null);

  return (
    <div className="flex w-0 flex-1 min-w-0 gap-2 overflow-x-auto overscroll-x-contain no-scrollbar pb-1 [contain:layout]">
      {options.map((opt) => (
        <label key={opt.id} className="shrink-0">
          <input
            type="radio"
            name={name}
            value={opt.id}
            checked={selected === opt.id}
            onChange={() => setSelected(opt.id)}
            onClick={() => {
              // Un radio natif ne peut pas se décocher par un second clic :
              // en contrôlé, si l'option cliquée était déjà sélectionnée,
              // onChange ne se déclenche pas — on le gère ici.
              if (selected === opt.id) setSelected(null);
            }}
            className="peer sr-only"
          />
          <span className="block cursor-pointer whitespace-nowrap rounded-full border border-border px-4 py-2 text-[13px] font-medium text-foreground transition-colors peer-checked:border-foreground peer-checked:bg-foreground peer-checked:text-background">
            {opt.name}
          </span>
        </label>
      ))}
    </div>
  );
}

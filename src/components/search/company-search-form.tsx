import { Search } from "lucide-react";

export function CompanySearchForm({ q }: { q?: string }) {
  return (
    <form action="/recherche" className="flex flex-col gap-6 px-[18px] pt-4">
      <input type="hidden" name="tab" value="entreprises" />

      <div className="relative">
        <Search
          size={18}
          strokeWidth={1.8}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <input
          type="text"
          name="q"
          defaultValue={q ?? ""}
          placeholder="Rechercher une entreprise..."
          className="w-full h-[52px] rounded-2xl border border-border bg-transparent pl-11 pr-4 text-[14px] outline-none placeholder:text-muted-foreground focus-visible:border-foreground"
        />
      </div>

      <button
        type="submit"
        className="h-14 w-full rounded-full bg-primary text-[14px] font-bold text-primary-foreground transition-opacity active:opacity-80"
      >
        Voir les résultats
      </button>
    </form>
  );
}

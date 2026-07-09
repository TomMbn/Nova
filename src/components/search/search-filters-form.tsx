import Link from "next/link";
import { Search } from "lucide-react";
import { SearchSelect } from "./search-select";

type Option = { id: string; name: string };

export function SearchFiltersForm({
  q,
  roleId,
  skillId,
  companyId,
  roles,
  skills,
  companies,
  hasActiveFilters,
}: {
  q?: string;
  roleId?: string;
  skillId?: string;
  companyId?: string;
  roles: Option[];
  skills: Option[];
  companies: Option[];
  hasActiveFilters: boolean;
}) {
  return (
    <form action="/recherche" className="flex flex-col gap-6 px-[18px] pt-4">
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
          placeholder="Rechercher un membre"
          className="w-full h-[52px] rounded-2xl border border-border bg-transparent pl-11 pr-4 text-[14px] outline-none placeholder:text-muted-foreground focus-visible:border-foreground"
        />
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-[16px] font-bold">Filtres</h2>

        <SearchSelect name="companyId" label="Entreprise" value={companyId} options={companies} />
        <SearchSelect name="skillId" label="Compétence" value={skillId} options={skills} />
        <SearchSelect name="roleId" label="Statut membre" value={roleId} options={roles} />
      </div>

      <div className="flex flex-col items-center gap-4">
        <button
          type="submit"
          className="w-full h-[48px] rounded-2xl bg-muted text-[14px] font-bold text-foreground transition-opacity active:opacity-70"
        >
          Voir les résultats
        </button>

        {hasActiveFilters && (
          <Link href="/recherche" className="text-[13px] text-muted-foreground hover:underline">
            Réinitialiser les filtres
          </Link>
        )}
      </div>
    </form>
  );
}

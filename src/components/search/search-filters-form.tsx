import Link from "next/link";
import { Search } from "lucide-react";
import { FilterChipGroup } from "./filter-chip-group";

type Option = { id: string; name: string };

export function SearchFiltersForm({
  q,
  roleId,
  skillId,
  classId,
  companyId,
  companyName,
  roles,
  skills,
  classes,
  hasActiveFilters,
}: {
  q?: string;
  roleId?: string;
  skillId?: string;
  classId?: string;
  companyId?: string;
  companyName?: string;
  roles: Option[];
  skills: Option[];
  classes: Option[];
  hasActiveFilters: boolean;
}) {
  return (
    <form action="/recherche" className="flex flex-col gap-6 px-[18px] pt-4">
      {companyId && <input type="hidden" name="companyId" value={companyId} />}

      {companyName && (
        <p className="text-[13px] text-muted-foreground">
          Membres ayant travaillé chez <span className="font-bold text-foreground">{companyName}</span>
        </p>
      )}

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
          placeholder="Nom, compétence, promotion..."
          className="w-full h-[52px] rounded-2xl border border-border bg-transparent pl-11 pr-4 text-[14px] outline-none placeholder:text-muted-foreground focus-visible:border-foreground"
        />
      </div>

      <FilterChipGroup key={roleId ?? "roleId-none"} name="roleId" options={roles} value={roleId} />

      <div className="flex flex-col gap-3">
        <span className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
          Compétence
        </span>
        <FilterChipGroup key={skillId ?? "skillId-none"} name="skillId" options={skills} value={skillId} />
      </div>

      <div className="flex flex-col gap-3">
        <span className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
          Promotion
        </span>
        <FilterChipGroup key={classId ?? "classId-none"} name="classId" options={classes} value={classId} />
      </div>

      <div className="flex flex-col items-center gap-4">
        <button
          type="submit"
          className="h-14 w-full rounded-full bg-primary text-[14px] font-bold text-primary-foreground transition-opacity active:opacity-80"
        >
          Voir les résultats
        </button>

        {hasActiveFilters && (
          <Link href="/recherche?tab=membres" className="text-[13px] text-muted-foreground hover:underline">
            Réinitialiser les filtres
          </Link>
        )}
      </div>
    </form>
  );
}

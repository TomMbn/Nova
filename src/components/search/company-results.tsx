import Link from "next/link";
import { Building2 } from "lucide-react";

export type Company = { id: string; name: string };

function CompanyCard({ company }: { company: Company }) {
  return (
    <Link
      href={`/recherche?companyId=${company.id}`}
      className="flex items-center gap-3 border border-border rounded-[10px] p-[10px] transition-colors hover:bg-muted/40"
    >
      <div className="size-[46px] rounded-[10px] bg-muted flex items-center justify-center shrink-0">
        <Building2 size={22} strokeWidth={1.5} className="text-muted-foreground" />
      </div>
      <p className="text-[14px] font-bold">{company.name}</p>
    </Link>
  );
}

export function CompanyResults({ companies }: { companies: Company[] }) {
  if (companies.length === 0) {
    return (
      <p className="text-center text-sm text-muted-foreground py-12">
        Aucune entreprise trouvée.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {companies.map((company) => (
        <CompanyCard key={company.id} company={company} />
      ))}
    </div>
  );
}

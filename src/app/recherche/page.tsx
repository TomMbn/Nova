import { searchUsers } from "@/queries/users";
import { getRoles, getSkills, getClasses, getCompanies } from "@/queries/referentials";
import { prisma } from "@/lib/prisma";
import { toBigInt } from "@/lib/bigint";
import { BottomNav } from "@/components/bottom-nav";
import { TopBar } from "@/components/feed/top-bar";
import { SearchTabs } from "@/components/search/search-tabs";
import { SearchFiltersForm } from "@/components/search/search-filters-form";
import { MemberResults, type Member } from "@/components/search/member-results";
import { CompanySearchForm } from "@/components/search/company-search-form";
import { CompanyResults } from "@/components/search/company-results";

type SearchParams = {
  tab?: string;
  q?: string;
  roleId?: string;
  skillId?: string;
  classId?: string;
  companyId?: string;
};

// Labels plus informels que les noms de rôle en base, et on ne propose que
// les 3 statuts les plus recherchés dans l'annuaire (pas "Équipe pédagogique").
const ROLE_LABELS: Record<string, string> = {
  "Élève": "Étudiants",
  "Alumni": "Alumni",
  "Intervenant": "Intervenants",
};

export default async function RecherchePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { tab, q, roleId, skillId, classId, companyId } = await searchParams;
  const activeTab = tab === "entreprises" ? "entreprises" : "membres";

  return (
    <>
      <div className="flex flex-col min-h-full pb-20">
        <TopBar />

        <div className="flex flex-col gap-4 px-[18px] pt-5">
          <h1 className="text-[22px] font-bold">Rechercher</h1>
          <SearchTabs active={activeTab} />
        </div>

        {activeTab === "entreprises" ? (
          <EntreprisesTab q={q} />
        ) : (
          <MembresTab
            q={q}
            roleId={roleId}
            skillId={skillId}
            classId={classId}
            companyId={companyId}
          />
        )}
      </div>
      <BottomNav />
    </>
  );
}

async function MembresTab({
  q,
  roleId,
  skillId,
  classId,
  companyId,
}: {
  q?: string;
  roleId?: string;
  skillId?: string;
  classId?: string;
  companyId?: string;
}) {
  const hasActiveFilters = Boolean(q || roleId || skillId || classId || companyId);

  const [roles, skills, classes, company] = await Promise.all([
    getRoles(),
    getSkills(),
    getClasses(),
    companyId ? findCompanyName(companyId) : Promise.resolve(undefined),
  ]);

  const roleOptions = roles
    .filter((r) => r.name in ROLE_LABELS)
    .map((r) => ({ id: String(r.id), name: ROLE_LABELS[r.name] }));

  const members: Member[] | null = hasActiveFilters
    ? (await searchUsers({ name: q, roleId, skillId, classId, companyId })).map((user) => ({
        id: String(user.id),
        name: user.name,
        avatarUrl: user.avatarUrl,
        role: user.role.name,
        className: user.currentClass?.name ?? null,
        skills: user.skills.map((s) => s.skill.name),
      }))
    : null;

  return (
    <>
      <SearchFiltersForm
        q={q}
        roleId={roleId}
        skillId={skillId}
        classId={classId}
        companyId={companyId}
        companyName={company}
        roles={roleOptions}
        skills={skills.map((s) => ({ id: String(s.id), name: s.name }))}
        classes={classes.map((c) => ({ id: String(c.id), name: c.name }))}
        hasActiveFilters={hasActiveFilters}
      />

      {members && (
        <main className="flex-1 px-3 pt-6">
          <MemberResults members={members} />
        </main>
      )}
    </>
  );
}

async function EntreprisesTab({ q }: { q?: string }) {
  const hasQuery = Boolean(q);
  const companies = hasQuery ? await getCompanies(q) : null;

  return (
    <>
      <CompanySearchForm q={q} />

      {companies && (
        <main className="flex-1 px-3 pt-6">
          <CompanyResults companies={companies.map((c) => ({ id: String(c.id), name: c.name }))} />
        </main>
      )}
    </>
  );
}

async function findCompanyName(companyId: string): Promise<string | undefined> {
  const id = toBigInt(companyId);
  if (id === null) return undefined;
  const company = await prisma.company.findUnique({ where: { id }, select: { name: true } });
  return company?.name;
}

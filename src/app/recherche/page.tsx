import { searchUsers } from "@/queries/users";
import { getRoles, getSkills, getCompanies } from "@/queries/referentials";
import { BottomNav } from "@/components/bottom-nav";
import { TopBar } from "@/components/feed/top-bar";
import { SearchFiltersForm } from "@/components/search/search-filters-form";
import { MemberResults, type Member } from "@/components/search/member-results";

type SearchParams = {
  q?: string;
  roleId?: string;
  skillId?: string;
  companyId?: string;
};

export default async function RecherchePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { q, roleId, skillId, companyId } = await searchParams;
  const hasActiveFilters = Boolean(q || roleId || skillId || companyId);

  const [roles, skills, companies] = await Promise.all([
    getRoles(),
    getSkills(),
    getCompanies(),
  ]);

  const members: Member[] | null = hasActiveFilters
    ? (await searchUsers({ name: q, roleId, skillId, companyId })).map((user) => ({
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
      <div className="flex flex-col min-h-full pb-20">
        <TopBar />
        <SearchFiltersForm
          q={q}
          roleId={roleId}
          skillId={skillId}
          companyId={companyId}
          roles={roles.map((r) => ({ id: String(r.id), name: r.name }))}
          skills={skills.map((s) => ({ id: String(s.id), name: s.name }))}
          companies={companies.map((c) => ({ id: String(c.id), name: c.name }))}
          hasActiveFilters={hasActiveFilters}
        />

        {members && (
          <main className="flex-1 px-3 pt-6">
            <MemberResults members={members} />
          </main>
        )}
      </div>
      <BottomNav />
    </>
  );
}

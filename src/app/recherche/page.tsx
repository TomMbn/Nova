import { searchUsers } from "@/queries/users";
import { getRoles, getClasses, getSkills } from "@/queries/referentials";
import { BottomNav } from "@/components/bottom-nav";
import { SearchHeader } from "@/components/search/search-header";
import { FilterChips } from "@/components/search/filter-chips";
import { MemberResults, type Member } from "@/components/search/member-results";

type SearchParams = {
  q?: string;
  roleId?: string;
  classId?: string;
  skillId?: string;
};

export default async function RecherchePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { q, roleId, classId, skillId } = await searchParams;

  const [users, roles, classes, skills] = await Promise.all([
    searchUsers({ name: q, roleId, classId, skillId }),
    getRoles(),
    getClasses(),
    getSkills(),
  ]);

  const members: Member[] = users.map((user) => ({
    id: String(user.id),
    name: user.name,
    avatarUrl: user.avatarUrl,
    role: user.role.name,
    className: user.currentClass?.name ?? null,
    skills: user.skills.map((s) => s.skill.name),
  }));

  return (
    <>
      <div className="flex flex-col min-h-full pb-20">
        <SearchHeader q={q} roleId={roleId} classId={classId} skillId={skillId} />

        <div className="flex flex-col gap-3 pt-1 pb-3">
          <FilterChips
            paramName="roleId"
            label="Rôle"
            options={roles.map((r) => ({ id: String(r.id), name: r.name }))}
          />
          <FilterChips
            paramName="classId"
            label="Classe"
            options={classes.map((c) => ({ id: String(c.id), name: c.name }))}
          />
          <FilterChips
            paramName="skillId"
            label="Compétence"
            options={skills.map((s) => ({ id: String(s.id), name: s.name }))}
          />
        </div>

        <main className="flex-1 px-3">
          <MemberResults members={members} />
        </main>
      </div>
      <BottomNav />
    </>
  );
}

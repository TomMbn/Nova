import Link from "next/link";
import { ChevronLeft, Search } from "lucide-react";

export function SearchHeader({
  q,
  roleId,
  classId,
  skillId,
}: {
  q?: string;
  roleId?: string;
  classId?: string;
  skillId?: string;
}) {
  return (
    <header className="flex items-center gap-3 px-[14px] py-[15px] bg-background sticky top-0 z-40">
      <Link
        href="/"
        aria-label="Retour"
        className="flex items-center justify-center size-[46px] rounded-[10px] hover:bg-muted transition-colors shrink-0"
      >
        <ChevronLeft size={22} strokeWidth={1.8} />
      </Link>

      <form
        action="/recherche"
        className="flex items-center h-[46px] rounded-[10px] bg-[#e8e8e8] flex-1 px-3 gap-2"
      >
        {roleId && <input type="hidden" name="roleId" value={roleId} />}
        {classId && <input type="hidden" name="classId" value={classId} />}
        {skillId && <input type="hidden" name="skillId" value={skillId} />}
        <Search size={18} strokeWidth={1.8} className="text-[#888] shrink-0" />
        <input
          type="text"
          name="q"
          defaultValue={q ?? ""}
          placeholder="Rechercher un membre"
          className="flex-1 min-w-0 bg-transparent outline-none text-[14px] placeholder:text-[#888]"
        />
      </form>
    </header>
  );
}

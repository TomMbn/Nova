import Link from "next/link";
import { User } from "lucide-react";

export type Member = {
  id: string;
  name: string;
  avatarUrl: string | null;
  role: string;
  className: string | null;
  skills: string[];
};

function MemberCard({ user }: { user: Member }) {
  return (
    <Link
      href={`/profil/${user.id}`}
      className="flex items-center gap-3 border border-[#e8e8e8] rounded-[10px] p-[10px] transition-colors hover:bg-muted/40"
    >
      <div className="size-[46px] rounded-[10px] bg-[#e8e8e8] flex items-center justify-center shrink-0 overflow-hidden">
        {user.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.avatarUrl} alt={user.name} className="size-full object-cover" />
        ) : (
          <User size={22} strokeWidth={1.5} className="text-[#888]" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[14px] font-bold leading-tight truncate">{user.name}</p>
        <p className="text-[12px] text-foreground truncate">
          {user.role}
          {user.className ? ` · ${user.className}` : ""}
        </p>

        {user.skills.length > 0 && (
          <div className="flex gap-1 flex-wrap mt-1.5">
            {user.skills.slice(0, 3).map((skill) => (
              <span
                key={skill}
                className="px-[8px] py-0.5 h-5 rounded-[10px] bg-[#f7f7f7] text-[11px] font-bold leading-none flex items-center"
              >
                {skill}
              </span>
            ))}
            {user.skills.length > 3 && (
              <span className="text-[11px] text-[#888] flex items-center">
                +{user.skills.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}

export function MemberResults({ members }: { members: Member[] }) {
  if (members.length === 0) {
    return (
      <p className="text-center text-sm text-muted-foreground py-12">
        Aucun membre trouvé.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {members.map((user) => (
        <MemberCard key={user.id} user={user} />
      ))}
    </div>
  );
}

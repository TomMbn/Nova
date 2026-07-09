import Link from "next/link";
import type { FormationSession } from "@/queries/formations";

function formatDate(date: Date): string {
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

export function FormationSessionCard({ session }: { session: FormationSession }) {
  return (
    <Link href={`/formations/sessions/${session.id}`}>
      <article className="border border-border rounded-[10px] p-[10px] flex flex-col gap-[10px]">

        {/* Header : titre + date */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col gap-[2px] min-w-0">
            <p className="text-[12px] font-bold leading-tight truncate">{session.title}</p>
            <p className="text-[12px] font-normal leading-tight text-foreground truncate">{session.location}</p>
          </div>
          <span className="text-[12px] font-bold shrink-0">{formatDate(session.date)}</span>
        </div>

        {/* Topics */}
        {session.topics.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {session.topics.map((t) => (
              <span
                key={t.id}
                className="px-[10px] py-1 h-6 rounded-[10px] bg-muted text-[12px] font-bold leading-none flex items-center"
              >
                {t.name}
              </span>
            ))}
          </div>
        )}

        {/* Description */}
        <p className="text-[12px] font-normal leading-snug line-clamp-2">{session.description}</p>

        {/* Image */}
        <div className="relative w-full h-[185px] rounded-[10px] overflow-hidden border border-border bg-muted">
          {session.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={session.imageUrl} alt={session.title} className="w-full h-full object-cover" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-[12px]">
              Aucune image
            </div>
          )}
        </div>
      </article>
    </Link>
  );
}

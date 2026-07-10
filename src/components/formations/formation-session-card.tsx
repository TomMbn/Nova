import Link from "next/link";
import { Calendar, MapPin, ImageIcon } from "lucide-react";
import type { FormationSession } from "@/queries/formations";

function formatDate(date: Date): string {
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

export function FormationSessionCard({ session }: { session: FormationSession }) {
  return (
    <Link href={`/formations/sessions/${session.id}`}>
      <article className="flex flex-col gap-3 rounded-2xl bg-card p-4 shadow-sm">
        {/* Image */}
        <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-muted">
          {session.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={session.imageUrl} alt={session.title} className="w-full h-full object-cover" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
              <ImageIcon size={24} strokeWidth={1.5} />
            </div>
          )}
        </div>

        {/* Thématiques (marque) + niveau (accent) */}
        {(session.topics.length > 0 || session.level) && (
          <div className="flex flex-wrap gap-1.5">
            {session.topics.map((t) => (
              <span
                key={t.id}
                className="flex h-6 items-center rounded-lg bg-primary/10 px-2.5 text-xs font-bold text-primary"
              >
                {t.name}
              </span>
            ))}
            {session.level && (
              <span className="flex h-6 items-center rounded-lg bg-accent/10 px-2.5 text-xs font-bold text-accent">
                {session.level}
              </span>
            )}
          </div>
        )}

        <div className="flex flex-col gap-1">
          <h3 className="text-sm font-bold leading-snug truncate">{session.title}</h3>
          <p className="text-xs leading-relaxed text-muted-foreground line-clamp-2">
            {session.description}
          </p>
        </div>

        {/* Date + lieu */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar size={13} strokeWidth={1.8} />
            {formatDate(session.date)}
          </span>
          <span className="flex items-center gap-1 min-w-0 truncate">
            <MapPin size={13} strokeWidth={1.8} className="shrink-0" />
            <span className="truncate">{session.location}</span>
          </span>
        </div>
      </article>
    </Link>
  );
}

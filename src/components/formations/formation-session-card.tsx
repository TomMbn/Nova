import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import type { FormationSession } from "@/queries/formations";

function formatDate(date: Date): string {
  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

const STATUS_LABEL: Record<string, string> = {
  OPEN: "Inscriptions ouvertes",
  DONE: "Terminée",
  CANCELLED: "Annulée",
};

export function FormationSessionCard({ session }: { session: FormationSession }) {
  return (
    <article className="border border-[#e8e8e8] rounded-[10px] p-[10px] flex flex-col gap-[10px]">
      {/* Image */}
      {session.imageUrl && (
        <div className="relative w-full aspect-video rounded-[10px] overflow-hidden bg-[#f7f7f7]">
          <Image src={session.imageUrl} alt={session.title} fill className="object-cover" />
        </div>
      )}

      {/* Header : titre + date */}
      <div className="flex items-start justify-between gap-2">
        <p className="text-[12px] font-bold leading-tight flex-1">{session.title}</p>
        <span className="text-[12px] font-bold shrink-0">{formatDate(session.date)}</span>
      </div>

      {/* Lieu + niveau */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[12px] font-normal text-muted-foreground">{session.location}</span>
        {session.level && (
          <span className="px-[10px] py-1 h-6 rounded-[10px] bg-[#e8e8e8] text-[12px] font-bold leading-none flex items-center">
            {session.level}
          </span>
        )}
      </div>

      {/* Topics */}
      {session.topics.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {session.topics.map((t) => (
            <span
              key={t.id}
              className="px-[10px] py-1 h-6 rounded-[10px] bg-[#f7f7f7] text-[12px] font-bold leading-none flex items-center"
            >
              {t.name}
            </span>
          ))}
        </div>
      )}

      {/* Footer : statut + voir plus */}
      <div className="flex items-center justify-between pt-1">
        <span className="text-[12px] font-normal text-muted-foreground">
          {STATUS_LABEL[session.status] ?? session.status}
        </span>
        <Link
          href={`/formations/sessions/${session.id}`}
          className="flex items-center gap-1 text-[14px] font-bold"
        >
          Voir plus
          <ArrowUpRight size={18} strokeWidth={2} />
        </Link>
      </div>
    </article>
  );
}

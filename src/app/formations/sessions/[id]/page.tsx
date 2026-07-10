import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, MapPin, Users, GraduationCap } from "lucide-react";
import { getFormationSessionById } from "@/queries/formations";
import { SessionDetailTabs } from "@/components/formations/session-detail-tabs";
import { SessionCTA } from "@/components/formations/session-cta";

function formatDate(date: Date) {
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

export default async function FormationSessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getFormationSessionById(id);
  if (!session) notFound();

  const isOpen = session.status === "OPEN";

  return (
    <>
      <div className="flex flex-col min-h-full pb-24">
        {/* Hero */}
        <div className="relative w-full aspect-[390/192] shrink-0 bg-muted">
          {session.imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={session.imageUrl}
              alt={session.title}
              className="absolute inset-0 size-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-black/35" />

          <Link
            href="/formations"
            className="absolute left-4 top-4 flex size-9 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition-colors hover:bg-white/30"
            aria-label="Retour"
          >
            <ArrowLeft size={18} strokeWidth={2} />
          </Link>

          <span className="absolute right-4 top-4 rounded-full bg-accent px-3 py-1.5 text-xs font-bold text-accent-foreground">
            Éligible CPF
          </span>

          <div className="absolute inset-x-4 bottom-4 flex flex-col gap-1.5">
            <h1 className="text-base font-bold leading-snug text-white">{session.title}</h1>
            {session.topics.length > 0 && (
              <span className="flex h-5 w-fit items-center rounded-full bg-white/90 px-2.5 text-[10px] font-bold tracking-wide text-primary">
                {session.topics[0].name}
              </span>
            )}
          </div>
        </div>

        {/* Meta bar */}
        <div className="flex items-center gap-4 overflow-x-auto overscroll-x-contain no-scrollbar border-b border-border px-4 py-3 [contain:layout]">
          <span className="flex shrink-0 items-center gap-1.5 text-xs font-semibold text-muted-foreground">
            <Calendar size={14} strokeWidth={1.8} />
            {formatDate(session.date)}
          </span>
          <span className="flex shrink-0 items-center gap-1.5 text-xs font-semibold text-muted-foreground">
            <MapPin size={14} strokeWidth={1.8} />
            {session.location}
          </span>
          <span className="flex shrink-0 items-center gap-1.5 text-xs font-semibold text-muted-foreground">
            <Users size={14} strokeWidth={1.8} />
            {session.registeredCount} / {session.capacity ?? "∞"}
          </span>
          {session.level && (
            <span className="flex shrink-0 items-center gap-1.5 text-xs font-semibold text-muted-foreground">
              <GraduationCap size={14} strokeWidth={1.8} />
              {session.level}
            </span>
          )}
        </div>

        <main className="flex-1">
          <SessionDetailTabs session={session} />
        </main>
      </div>

      {/* CTA sticky */}
      <div className="fixed bottom-0 left-0 right-0 px-[14px] py-3 z-[9999]">
        {isOpen ? (
          <SessionCTA sessionId={session.id} cpfUrl={session.cpfUrl} />
        ) : (
          <div className="flex items-center justify-center w-full h-[56px] rounded-[10px] bg-muted text-muted-foreground">
            <span className="text-[14px] font-bold">Session terminée</span>
          </div>
        )}
      </div>
    </>
  );
}

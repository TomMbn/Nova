import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, MapPin, Users, BarChart2 } from "lucide-react";
import { getFormationSessionById } from "@/queries/formations";
import { SessionDetailTabs } from "@/components/formations/session-detail-tabs";
import { SessionCTA } from "@/components/formations/session-cta";

function formatDate(date: Date) {
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

function formatTime(date: Date) {
  return date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
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
      <div className="flex flex-col min-h-full">

        {/* Header */}
        <header className="flex items-center gap-2 px-[14px] py-[15px] sticky top-0 bg-background z-40">
          <Link
            href="/formations"
            className="flex items-center justify-center size-[38px] rounded-[10px] hover:bg-muted transition-colors shrink-0"
          >
            <ArrowLeft size={20} strokeWidth={1.8} />
          </Link>
          <p className="flex-1 text-center text-[14px] font-bold">Détails de la formation</p>
        </header>

        <main className="flex-1 flex flex-col gap-4">

          {/* Hero */}
          <div className="px-[14px] flex flex-col gap-3">
            {/* Image + infos côte à côte */}
            <div className="flex gap-3 items-start">
              {/* Image carrée gauche */}
              <div className="relative flex flex-col items-start gap-2 shrink-0">
                <div className="relative size-[90px] rounded-[10px] overflow-hidden bg-[#e8e8e8]">
                  {session.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={session.imageUrl} alt={session.title} className="w-full h-full object-cover" />
                  ) : null}
                </div>
                {session.capacity && (
                  <span className="absolute bottom-2 left-1/2 -translate-x-1/2 px-2 py-1 rounded-[6px] bg-[#1e1e1e] text-[#e8e8e8] text-[8px] whitespace-nowrap">
                    {session.capacity} places restantes
                  </span>
                )}
              </div>

              {/* Contenu droite */}
              <div className="flex flex-col gap-1 flex-1 min-w-0">
                <span className="inline-flex items-center self-start px-2 py-[2px] rounded-[5px] text-[#1e1e1e] text-[8px] tracking-wide uppercase border-[1px] border-[#1e1e1e]">
                  Présentiel
                </span>
                <h1 className="text-[18px] font-bold leading-snug">{session.title}</h1>
                {/* Topics scrollables */}
                {session.topics.length > 0 && (
                  <div className="flex gap-2 overflow-x-auto no-scrollbar">
                    {session.topics.map((t) => (
                      <span
                        key={t.id}
                        className="shrink-0 px-[10px] py-1 h-6 rounded-[10px] border-[1px] border-[#f7f7f7] text-[12px] font-bold leading-none flex items-center"
                      >
                        {t.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Info bar 4 colonnes */}
          <div className="grid grid-cols-4 border-y border-[#e8e8e8] p-3">
            <div className="flex flex-col items-center gap-1 text-center px-1">
              <Calendar size={18} strokeWidth={1.8} className="text-muted-foreground" />
              <span className="text-[10px] font-bold leading-tight">{formatDate(session.date)}</span>
              <span className="text-[10px] text-muted-foreground">{formatTime(session.date)}</span>
            </div>
            <div className="flex flex-col items-center gap-1 text-center px-1 border-l border-[#e8e8e8]">
              <MapPin size={18} strokeWidth={1.8} className="text-muted-foreground" />
              <span className="text-[10px] font-bold leading-tight line-clamp-2">{session.location}</span>
            </div>
            <div className="flex flex-col items-center gap-1 text-center px-1 border-l border-[#e8e8e8]">
              <Users size={18} strokeWidth={1.8} className="text-muted-foreground" />
              <span className="text-[10px] font-bold">{session.registeredCount} / {session.capacity ?? "∞"}</span>
              <span className="text-[10px] text-muted-foreground">participants</span>
            </div>
            <div className="flex flex-col items-center gap-1 text-center px-1 border-l border-[#e8e8e8]">
              <BarChart2 size={18} strokeWidth={1.8} className="text-muted-foreground" />
              <span className="text-[10px] font-bold">{session.level ?? "—"}</span>
              <span className="text-[10px] text-muted-foreground">Niveau</span>
            </div>
          </div>

          {/* Tabs + contenu (client) */}
          <SessionDetailTabs session={session} />
        </main>
      </div>

      {/* CTA sticky */}
      <div className="fixed bottom-0 left-0 right-0 px-[14px] py-3 z-[9999]">
        {isOpen ? (
          <SessionCTA sessionId={session.id} cpfUrl={session.cpfUrl} />
        ) : (
          <div className="flex items-center justify-center w-full h-[56px] rounded-[10px] bg-[#e8e8e8] text-[#888888]">
            <span className="text-[14px] font-bold">Session terminée</span>
          </div>
        )}
      </div>
    </>
  );
}

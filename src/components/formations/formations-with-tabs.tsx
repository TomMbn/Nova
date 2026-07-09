"use client";

import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FormationVideo, FormationSession } from "@/queries/formations";
import { FormationVideoCard } from "./formation-video-card";
import { FormationSessionCard } from "./formation-session-card";

type Tab = "videos" | "presentiel";

export function FormationsWithTabs({
  videos,
  sessions,
}: {
  videos: FormationVideo[];
  sessions: FormationSession[];
}) {
  const [tab, setTab] = useState<Tab>("videos");

  return (
    <>
      {/* Onglets + filtre */}
      <div className="px-[14px]">
        <div className="flex items-center gap-2">
          <div className="flex flex-1">
            {(["videos", "presentiel"] as Tab[]).map((t) => {
              const label = t === "videos" ? "Vidéos" : "Présentiel";
              const isActive = tab === t;
              return (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={cn(
                    "flex-1 pb-[10px] text-[12px] font-bold text-center border-b-2 transition-colors",
                    isActive ? "border-[#1e1e1e] text-[#1e1e1e]" : "border-[#e8e8e8] text-muted-foreground"
                  )}
                >
                  {label}
                </button>
              );
            })}
          </div>
          <button
            className="shrink-0 flex items-center justify-center size-8 rounded-[10px] hover:bg-muted transition-colors mb-[10px]"
            aria-label="Filtres"
          >
            <SlidersHorizontal size={18} strokeWidth={1.8} />
          </button>
        </div>
      </div>

      {/* Contenu */}
      <div className="flex flex-col gap-3 px-3 pt-3">
        {tab === "videos" ? (
          videos.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-12">
              Aucune vidéo disponible.
            </p>
          ) : (
            videos.map((v) => <FormationVideoCard key={v.id} formation={v} />)
          )
        ) : sessions.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-12">
            Aucune session disponible.
          </p>
        ) : (
          sessions.map((s) => <FormationSessionCard key={s.id} session={s} />)
        )}
      </div>
    </>
  );
}

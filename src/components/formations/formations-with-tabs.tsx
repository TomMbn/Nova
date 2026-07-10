"use client";

import { useState } from "react";
import { Check, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FormationVideo, FormationSession } from "@/queries/formations";
import { FormationVideoCard } from "./formation-video-card";
import { FormationSessionCard } from "./formation-session-card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Tab = "videos" | "presentiel";

export function FormationsWithTabs({
  videos,
  sessions,
}: {
  videos: FormationVideo[];
  sessions: FormationSession[];
}) {
  const [tab, setTab] = useState<Tab>("videos");
  const [topicId, setTopicId] = useState<string | null>(null);

  const allTopics = new Map<string, string>();
  for (const item of [...videos, ...sessions]) {
    for (const t of item.topics) allTopics.set(t.id, t.name);
  }
  const topicOptions = [...allTopics.entries()].map(([id, name]) => ({ id, name }));

  const filteredVideos = topicId
    ? videos.filter((v) => v.topics.some((t) => t.id === topicId))
    : videos;
  const filteredSessions = topicId
    ? sessions.filter((s) => s.topics.some((t) => t.id === topicId))
    : sessions;

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
                    isActive ? "border-primary text-primary" : "border-transparent text-muted-foreground"
                  )}
                >
                  {label}
                </button>
              );
            })}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger
              className={cn(
                "shrink-0 flex items-center justify-center size-8 rounded-[10px] hover:bg-muted transition-colors mb-[10px]",
                topicId && "bg-muted"
              )}
              aria-label="Filtrer par thématique"
            >
              <SlidersHorizontal size={18} strokeWidth={1.8} />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTopicId(null)}>
                Toutes les thématiques
                {topicId === null && <Check className="ml-auto size-3.5" />}
              </DropdownMenuItem>
              {topicOptions.map((t) => (
                <DropdownMenuItem key={t.id} onClick={() => setTopicId(t.id)}>
                  {t.name}
                  {topicId === t.id && <Check className="ml-auto size-3.5" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Contenu */}
      <div className="flex flex-col gap-3 px-3 pt-3">
        {tab === "videos" ? (
          filteredVideos.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-12">
              Aucune vidéo disponible.
            </p>
          ) : (
            filteredVideos.map((v) => <FormationVideoCard key={v.id} formation={v} />)
          )
        ) : filteredSessions.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-12">
            Aucune session disponible.
          </p>
        ) : (
          filteredSessions.map((s) => <FormationSessionCard key={s.id} session={s} />)
        )}
      </div>
    </>
  );
}

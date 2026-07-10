"use client";

import { useState } from "react";
import { Check, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FormationSession } from "@/queries/formations";

const TABS = ["À propos", "Programme", "Intervenant", "Infos pratiques"] as const;
type Tab = typeof TABS[number];

// Générique (pas de curriculum par session en base) : formulé pour rester
// vrai quel que soit le thème de la session.
const OBJECTIVES = [
  "Maîtriser les fondamentaux et les bonnes pratiques du domaine",
  "Mettre en pratique à travers des cas concrets",
  "Échanger avec un intervenant expert du sujet",
  "Repartir avec des outils et ressources réutilisables",
];

export function SessionDetailTabs({ session }: { session: FormationSession }) {
  const [tab, setTab] = useState<Tab>("À propos");

  return (
    <>
      {/* Tabs scrollables */}
      <div className="flex overflow-x-auto overscroll-x-contain no-scrollbar border-b border-border px-[14px] [contain:layout]">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "shrink-0 pb-[10px] px-3 text-[12px] font-bold whitespace-nowrap border-b-2 -mb-px transition-colors",
              tab === t ? "border-primary text-foreground" : "border-transparent text-muted-foreground"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Contenu */}
      <div className="px-[14px] flex flex-col gap-4 pt-4 pb-22">
        {tab === "À propos" ? (
          <>
            {/* Description */}
            <section className="flex flex-col gap-2">
              <h2 className="text-[12px] font-bold tracking-[1.2px] uppercase text-muted-foreground">
                Description
              </h2>
              <p className="text-[14px] leading-relaxed text-foreground">{session.description}</p>
            </section>

            {/* Objectifs pédagogiques */}
            <section className="flex flex-col gap-2">
              <h2 className="text-[12px] font-bold tracking-[1.2px] uppercase text-muted-foreground">
                Objectifs pédagogiques
              </h2>
              <div className="flex flex-col gap-2 pt-1">
                {OBJECTIVES.map((objective) => (
                  <div key={objective} className="flex items-start gap-3">
                    <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <Check size={11} strokeWidth={2.5} className="text-primary" />
                    </span>
                    <span className="text-[14px] leading-relaxed text-foreground">{objective}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Financement CPF */}
            <section className="flex flex-col overflow-hidden rounded-2xl border border-accent/20">
              <div className="flex items-center gap-2 bg-accent/5 px-4 py-3">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent/10">
                  <GraduationCap size={16} strokeWidth={1.8} className="text-accent" />
                </span>
                <div className="min-w-0">
                  <p className="text-[14px] font-bold leading-snug">Financement CPF disponible</p>
                  <p className="text-[10px] leading-snug text-muted-foreground">
                    Formation éligible au Compte Personnel de Formation
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-1 px-4 py-3">
                <p className="text-[13px] font-bold">Formation prise en charge à 100%*</p>
                <p className="text-[12px] leading-relaxed text-muted-foreground">
                  Grâce à votre CPF, OPCO ou France Travail. Vous avancez sans frais.
                </p>
              </div>
              <div className="px-4 pb-4">
                <a
                  href={session.cpfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-11 w-full items-center justify-center rounded-2xl bg-accent text-[14px] font-bold text-accent-foreground transition-opacity hover:opacity-90"
                >
                  Faire une demande CPF
                </a>
              </div>
            </section>
          </>
        ) : (
          <p className="text-center text-sm text-muted-foreground py-12">
            Bientôt disponible.
          </p>
        )}
      </div>
    </>
  );
}

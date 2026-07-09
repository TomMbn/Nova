"use client";

import { useState } from "react";
import { ArrowUpRight, CheckCircle2, FileText, PenTool, Award, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FormationSession } from "@/queries/formations";

const TABS = ["À propos", "Programme", "Intervenant", "Infos pratiques", "Avis"] as const;
type Tab = typeof TABS[number];

export function SessionDetailTabs({ session }: { session: FormationSession }) {
  const [tab, setTab] = useState<Tab>("À propos");

  return (
    <>
      {/* Tabs scrollables */}
      <div className="flex overflow-x-auto no-scrollbar border-b border-[#e8e8e8] px-[14px]">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "shrink-0 pb-[10px] px-3 text-[12px] font-bold whitespace-nowrap border-b-2 -mb-px transition-colors",
              tab === t ? "border-[#1e1e1e] text-[#1e1e1e]" : "border-transparent text-muted-foreground"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Contenu */}
      <div className="px-[14px] flex flex-col gap-5 pt-4">
        {tab === "À propos" ? (
          <>
            {/* Description */}
            <section className="flex flex-col gap-2">
              <h2 className="text-[14px] font-bold">À propos de la formation</h2>
              <p className="text-[13px] leading-relaxed">{session.description}</p>
            </section>

            {/* Compétences développées */}
            <section className="flex flex-col gap-3">
              <h2 className="text-[14px] font-bold">Compétences développées</h2>
              {[
                "Structurer un design system",
                "Composants réutilisables et variants",
                "Tokens, variables et theming",
                "Gouvernance et bonnes pratiques",
                "Accessibilité et design inclusif",
              ].map((skill) => (
                <div key={skill} className="flex items-start gap-2">
                  <CheckCircle2 size={16} strokeWidth={1.8} className="shrink-0 mt-0.5 text-[#1e1e1e]" />
                  <span className="text-[13px]">{skill}</span>
                </div>
              ))}
            </section>

            {/* Ce que vous allez obtenir */}
            <section className="flex flex-col gap-3">
              <h2 className="text-[14px] font-bold">Ce que vous allez obtenir</h2>
              {[
                { icon: FileText, label: "Support de formation (PDF)" },
                { icon: PenTool, label: "Fichiers Figma du design system créé pendant la formation" },
                { icon: Award, label: "Attestation de participation" },
                { icon: Users, label: "Accès à la communauté post-formation" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-start gap-2">
                  <Icon size={16} strokeWidth={1.8} className="shrink-0 mt-0.5 text-muted-foreground" />
                  <span className="text-[13px]">{label}</span>
                </div>
              ))}
            </section>

            {/* Financement */}
            <section className="flex flex-col gap-2">
              <h2 className="text-[14px] font-bold">Financement</h2>
              <p className="text-[13px] font-bold">Formation prise en charge à 100%*</p>
              <p className="text-[13px] text-muted-foreground">
                Grâce à votre CPF, OPCO ou France Travail. Vous avancez sans frais.
              </p>
              <a
                href={session.cpfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-[13px] font-bold underline w-fit"
              >
                Voir les options de financement
                <ArrowUpRight size={14} strokeWidth={2} />
              </a>
            </section>

            {/* Lieu */}
            <section className="flex flex-col gap-2 pb-4">
              <h2 className="text-[14px] font-bold">Lieu de la formation</h2>
              <p className="text-[13px] font-bold">{session.location}</p>
              <div className="w-full h-[120px] rounded-[10px] bg-[#e8e8e8] flex items-center justify-center">
                <span className="text-[12px] text-muted-foreground">Carte à venir</span>
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

"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";

type Skill = { id: string; name: string };
type Experience = {
  id: string;
  label: string;
  period: string | null;
  isCurrent: boolean;
};

const TABS = ["Aperçu", "Parcours", "Compétences"] as const;
type Tab = (typeof TABS)[number];

const SKILLS_PREVIEW_COUNT = 6;

// Aperçu : résumé encadré (carte, chips violettes, liste tronquée).
function SkillsPreview({ skills }: { skills: Skill[] }) {
  const visible = skills.slice(0, SKILLS_PREVIEW_COUNT);
  const hidden = skills.length - visible.length;

  return (
    <Card className="shadow-sm">
      <CardContent className="flex flex-col gap-3">
        <h3 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
          Compétences clés
        </h3>
        <div className="flex flex-wrap gap-2">
          {visible.map((skill) => (
            <Badge key={skill.id} className="bg-accent/10 text-accent">
              {skill.name}
            </Badge>
          ))}
          {hidden > 0 && (
            <Badge variant="secondary" className="text-muted-foreground">
              +{hidden}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Aperçu : résumé encadré (carte, icône diplôme, timeline).
function ExperiencesPreview({ experiences }: { experiences: Experience[] }) {
  return (
    <Card className="shadow-sm">
      <CardContent className="flex flex-col gap-3">
        <h3 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
          Parcours
        </h3>
        <ExperiencesTimeline experiences={experiences} />
      </CardContent>
    </Card>
  );
}

// Onglet dédié Compétences : liste complète, chips teal, dans une carte.
function SkillsFull({ skills }: { skills: Skill[] }) {
  return (
    <Card className="shadow-sm">
      <CardContent className="flex flex-wrap gap-2">
        {skills.map((skill) => (
          <Badge key={skill.id} className="bg-primary/10 text-primary">
            {skill.name}
          </Badge>
        ))}
      </CardContent>
    </Card>
  );
}

// Aperçu : icône diplôme, rangées séparées par des dividers horizontaux,
// sans ligne de connexion (seul l'onglet dédié Parcours en a une).
function ExperiencesTimeline({ experiences }: { experiences: Experience[] }) {
  return (
    <div className="flex flex-col divide-y divide-border">
      {experiences.map((experience) => (
        <div key={experience.id} className="flex gap-3 py-3 first:pt-0 last:pb-0">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-muted">
            <GraduationCap size={14} className="text-muted-foreground" />
          </span>
          <div className="flex flex-1 flex-col gap-0.5">
            <span className="text-sm font-bold">{experience.label}</span>
            {experience.period && (
              <span className="text-xs text-muted-foreground">{experience.period}</span>
            )}
            {experience.isCurrent && (
              <Badge variant="secondary" className="mt-1 w-fit">
                Actuel
              </Badge>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// Onglet dédié Parcours : puce pleine + ligne de connexion, rangées séparées
// par des dividers horizontaux.
function ExperiencesList({ experiences }: { experiences: Experience[] }) {
  return (
    <div className="flex flex-col divide-y divide-border">
      {experiences.map((experience, index) => {
        const isLast = index === experiences.length - 1;
        return (
          <div key={experience.id} className="flex gap-3 py-3 first:pt-0 last:pb-0">
            <div className="flex flex-col items-center self-stretch">
              <span className="mt-1.5 size-2.5 shrink-0 rounded-full bg-primary" />
              {!isLast && <span className="w-px flex-1 bg-border" />}
            </div>
            <div className="flex flex-1 flex-col gap-0.5">
              <span className="text-sm font-bold">{experience.label}</span>
              {experience.period && (
                <span className="text-xs text-muted-foreground">{experience.period}</span>
              )}
              {experience.isCurrent && (
                <Badge variant="secondary" className="mt-1 w-fit">
                  Actuel
                </Badge>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function ProfileTabs({
  skills,
  experiences,
}: {
  skills: Skill[];
  experiences: Experience[];
}) {
  const [tab, setTab] = useState<Tab>("Aperçu");

  return (
    <div className="-mx-4 flex flex-1 flex-col">
      <div className="flex gap-5 border-b border-border px-4">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "-mb-px border-b-2 pb-2.5 text-sm font-semibold transition-colors",
              tab === t
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="flex flex-1 flex-col gap-4 bg-gray-50 px-4 pt-4 pb-24">
        {tab === "Aperçu" && (
          <>
            {skills.length > 0 && <SkillsPreview skills={skills} />}
            {experiences.length > 0 && <ExperiencesPreview experiences={experiences} />}
          </>
        )}

        {tab === "Parcours" &&
          (experiences.length > 0 ? (
            <Card className="shadow-sm">
              <CardContent>
                <ExperiencesList experiences={experiences} />
              </CardContent>
            </Card>
          ) : (
            <p className="text-center text-sm text-muted-foreground">
              Aucune expérience renseignée.
            </p>
          ))}

        {tab === "Compétences" &&
          (skills.length > 0 ? (
            <SkillsFull skills={skills} />
          ) : (
            <p className="text-center text-sm text-muted-foreground">
              Aucune compétence renseignée.
            </p>
          ))}
      </div>
    </div>
  );
}

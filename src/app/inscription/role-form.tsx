"use client";

import { useState } from "react";
import { Check, GraduationCap, Award, Users, Star } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

import { chooseRole } from "./actions";

const ROLE_INFO: Record<string, { description: string; icon: LucideIcon }> = {
  "Élève actuel": {
    description: "Vous êtes actuellement en formation.",
    icon: GraduationCap,
  },
  Alumni: {
    description: "Vous avez déjà étudié ici.",
    icon: Award,
  },
  Intervenant: {
    description: "Vous intervenez ou formez des étudiants.",
    icon: Users,
  },
  "Équipe pédagogique": {
    description: "Vous faites partie de l'équipe pédagogique.",
    icon: Star,
  },
};

export function RoleForm({
  roles,
}: {
  roles: { id: string; name: string }[];
}) {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <form action={chooseRole} className="flex flex-col gap-6">
      <input type="hidden" name="roleId" value={selected ?? ""} />

      <div className="flex flex-col gap-3">
        {roles.map((role) => {
          const info = ROLE_INFO[role.name];
          const Icon = info?.icon ?? Users;
          const isActive = selected === role.id;

          return (
            <button
              key={role.id}
              type="button"
              onClick={() => setSelected(role.id)}
              className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition-colors ${
                isActive
                  ? "border-primary bg-primary/10"
                  : "border-border bg-card hover:border-primary/50"
              }`}
            >
              <span
                className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${
                  isActive ? "bg-primary/20" : "bg-muted"
                }`}
              >
                <Icon
                  className={`size-[18px] ${isActive ? "text-primary" : "text-muted-foreground"}`}
                />
              </span>
              <span className="flex flex-col">
                <span className="text-sm font-bold">{role.name}</span>
                {info?.description && (
                  <span className="mt-0.5 text-xs text-muted-foreground">
                    {info.description}
                  </span>
                )}
              </span>
              {isActive && (
                <span className="ml-auto flex size-5 shrink-0 items-center justify-center rounded-full bg-primary">
                  <Check className="size-3 text-primary-foreground" strokeWidth={3} />
                </span>
              )}
            </button>
          );
        })}
      </div>

      <Button
        type="submit"
        disabled={!selected}
        className="h-11 rounded-xl text-sm font-bold"
      >
        Continuer
      </Button>
    </form>
  );
}

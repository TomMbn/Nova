"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { completeProfile, type CompleteProfileState } from "../actions";

const initialState: CompleteProfileState = {};

export function ProfileForm({
  classes,
}: {
  classes: { id: string; name: string }[];
}) {
  const [state, formAction, pending] = useActionState(
    completeProfile,
    initialState
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="prenom">Prénom</Label>
          <Input
            id="prenom"
            name="prenom"
            required
            className="h-11 rounded-xl"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="nom">Nom</Label>
          <Input id="nom" name="nom" required className="h-11 rounded-xl" />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="bio">Bio</Label>
        <Textarea
          id="bio"
          name="bio"
          placeholder="Parlez-nous de vous..."
          className="min-h-24 rounded-xl"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="skills">Compétences</Label>
        <Input
          id="skills"
          name="skills"
          placeholder="ex : React, Figma..."
          className="h-11 rounded-xl"
        />
        <p className="text-xs text-muted-foreground">Séparez par des virgules.</p>
      </div>

      {classes.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="classId">Classe</Label>
          <select
            id="classId"
            name="classId"
            defaultValue=""
            className="h-11 w-full rounded-xl border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <option value="">Sélectionnez votre classe</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="company">Entreprise actuelle (si applicable)</Label>
        <Input id="company" name="company" className="h-11 rounded-xl" />
      </div>

      {state.error && <p className="text-sm text-destructive">{state.error}</p>}

      <Button
        type="submit"
        disabled={pending}
        className="h-11 rounded-xl bg-foreground text-background hover:bg-foreground/90"
      >
        {pending ? "Enregistrement..." : "Enregistrer"}
      </Button>
    </form>
  );
}

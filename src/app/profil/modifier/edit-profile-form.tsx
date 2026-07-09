"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { saveProfile, type EditProfileState } from "./actions";

type Topic = { id: string; name: string };
type Klass = { id: string; name: string };

const initialState: EditProfileState = {};

export function EditProfileForm({
  name,
  bio,
  skills,
  company,
  topics,
  selectedTopicIds,
  classes,
  currentClassId,
}: {
  name: string;
  bio: string;
  skills: string;
  company: string;
  topics: Topic[];
  selectedTopicIds: string[];
  classes: Klass[];
  currentClassId: string;
}) {
  const [state, formAction, pending] = useActionState(
    saveProfile,
    initialState
  );

  return (
    <form action={formAction} className="flex flex-col gap-4 pb-6">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">
          Nom complet <span className="text-destructive">*</span>
        </Label>
        <Input
          id="name"
          name="name"
          defaultValue={name}
          required
          className="h-11 rounded-xl"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="bio">Bio</Label>
        <Textarea
          id="bio"
          name="bio"
          defaultValue={bio}
          placeholder="Parlez-nous de vous..."
          className="min-h-24 rounded-xl"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="skills">Compétences</Label>
        <Input
          id="skills"
          name="skills"
          defaultValue={skills}
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
            defaultValue={currentClassId}
            className="h-11 w-full rounded-xl border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <option value="">Aucune classe</option>
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
        <Input
          id="company"
          name="company"
          defaultValue={company}
          className="h-11 rounded-xl"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label>Spécialités</Label>
        <div className="flex flex-col divide-y divide-border rounded-xl border border-border">
          {topics.map((topic) => (
            <label
              key={topic.id}
              className="flex items-center gap-3 px-4 py-3 text-sm"
            >
              <input
                type="checkbox"
                name="topicIds"
                value={topic.id}
                defaultChecked={selectedTopicIds.includes(topic.id)}
                className="size-4 rounded border-input"
              />
              {topic.name}
            </label>
          ))}
        </div>
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

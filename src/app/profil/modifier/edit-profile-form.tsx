"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { saveProfile, type EditProfileState } from "./actions";

type Topic = { id: string; name: string };
type Klass = { id: string; name: string };

const initialState: EditProfileState = {};

const SUGGESTED_SKILLS = [
  "Front-end",
  "Back-end",
  "UX Research",
  "Figma",
  "Motion Design",
  "Gestion de projet",
  "Data Analysis",
  "Illustration",
  "SEO",
  "Python",
];

const fieldLabel =
  "mb-1.5 block text-xs font-semibold tracking-wider text-muted-foreground uppercase";
const fieldInput = "h-11 rounded-xl border-none bg-muted text-sm";

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
  skills: string[];
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

  const chipSkills = [...new Set([...SUGGESTED_SKILLS, ...skills])];
  const otherSkills = skills.filter((s) => !SUGGESTED_SKILLS.includes(s));

  return (
    <form action={formAction} className="flex flex-col gap-4 pb-6">
      <div>
        <label htmlFor="name" className={fieldLabel}>
          Nom complet <span className="text-destructive">*</span>
        </label>
        <Input
          id="name"
          name="name"
          defaultValue={name}
          required
          className={fieldInput}
        />
      </div>

      <div>
        <label htmlFor="bio" className={fieldLabel}>
          Bio
        </label>
        <Textarea
          id="bio"
          name="bio"
          defaultValue={bio}
          placeholder="Parlez-nous de vous..."
          className="min-h-24 rounded-xl border-none bg-muted text-sm"
        />
      </div>

      <div>
        <span className={fieldLabel}>Compétences</span>
        <div className="flex flex-wrap gap-2">
          {chipSkills.map((skill) => (
            <label
              key={skill}
              className="cursor-pointer rounded-full border border-border px-3.5 py-1.5 text-xs font-semibold transition-colors has-[:checked]:border-transparent has-[:checked]:bg-accent/10 has-[:checked]:text-accent"
            >
              <input
                type="checkbox"
                name="skills"
                value={skill}
                defaultChecked={skills.includes(skill)}
                className="sr-only"
              />
              {skill}
            </label>
          ))}
        </div>
        <Input
          id="otherSkills"
          name="otherSkills"
          defaultValue={otherSkills.join(", ")}
          placeholder="Autres compétences (séparées par des virgules)"
          className={`${fieldInput} mt-2`}
        />
      </div>

      {classes.length > 0 && (
        <div>
          <label htmlFor="classId" className={fieldLabel}>
            Classe
          </label>
          <select
            id="classId"
            name="classId"
            defaultValue={currentClassId}
            className={`w-full border-none bg-muted px-3 text-sm outline-none ${fieldInput}`}
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

      <div>
        <label htmlFor="company" className={fieldLabel}>
          Entreprise actuelle (si applicable)
        </label>
        <Input
          id="company"
          name="company"
          defaultValue={company}
          className={fieldInput}
        />
      </div>

      <div>
        <span className={fieldLabel}>Spécialités</span>
        <div className="flex flex-wrap gap-2">
          {topics.map((topic) => (
            <label
              key={topic.id}
              className="cursor-pointer rounded-full border border-border px-4 py-2 text-sm font-semibold transition-colors has-[:checked]:border-transparent has-[:checked]:bg-foreground has-[:checked]:text-background"
            >
              <input
                type="checkbox"
                name="topicIds"
                value={topic.id}
                defaultChecked={selectedTopicIds.includes(topic.id)}
                className="sr-only"
              />
              {topic.name}
            </label>
          ))}
        </div>
      </div>

      {state.error && <p className="text-sm text-destructive">{state.error}</p>}

      <Button type="submit" disabled={pending} className="mt-1 h-11 rounded-xl text-sm font-bold">
        {pending ? "Enregistrement..." : "Enregistrer"}
      </Button>
    </form>
  );
}

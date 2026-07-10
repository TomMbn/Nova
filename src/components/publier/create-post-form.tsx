"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { createPost } from "@/actions/posts";
import { setPendingPost } from "@/lib/pending-post";
import { ChipGroup } from "./chip-group";
import {
  ContentPicker,
  type MediaItem,
  type DocumentDraft,
  type PollDraft,
} from "./content-picker";
const CONTENT_MAX_LENGTH = 1000;

type Option = { id: string; name: string };

export function CreatePostForm({
  categories,
  topics,
  skills,
}: {
  categories: Option[];
  topics: Option[];
  skills: Option[];
}) {
  const router = useRouter();

  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [topicIds, setTopicIds] = useState<string[]>([]);
  // Compétence(s) : affichée pour matcher la maquette, mais non envoyée à
  // createPost — `Skill` ne qualifie qu'une personne (`user_skill`), pas un
  // post (cf. CLAUDE.md, aucune relation post↔skill en base).
  const [skillIds, setSkillIds] = useState<string[]>([]);
  const [content, setContent] = useState("");
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [document, setDocument] = useState<DocumentDraft | null>(null);
  const [poll, setPoll] = useState<PollDraft | null>(null);
  const [error, setError] = useState<string | null>(null);

  function toggleTopic(id: string) {
    setTopicIds((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]));
  }

  function toggleSkill(id: string) {
    setSkillIds((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));
  }

  function handleSubmit() {
    setError(null);

    if (!categoryId) {
      setError("La catégorie est requise.");
      return;
    }
    const trimmedContent = content.trim();
    const validPoll =
      poll && poll.question.trim() && poll.options.filter((o) => o.trim()).length >= 2
        ? poll
        : null;
    if (!trimmedContent && media.length === 0 && !validPoll) {
      setError("Le post doit contenir du texte, un média ou un sondage.");
      return;
    }

    const formData = new FormData();
    if (trimmedContent) formData.append("content", trimmedContent);
    formData.append("categoryId", categoryId);
    topicIds.forEach((id) => formData.append("topicIds", id));
    media.forEach((m) => {
      formData.append("mediaFile", m.file);
      formData.append("mediaFileType", m.type);
    });
    if (validPoll) {
      formData.append("pollQuestion", validPoll.question.trim());
      validPoll.options
        .filter((o) => o.trim())
        .forEach((o) => formData.append("pollOption", o.trim()));
    }

    // Lance la création sans attendre, stocke la Promise, navigue immédiatement.
    setPendingPost(createPost(formData));
    router.push("/?publishing=1");
  }

  return (
    <div className="flex flex-col min-h-full">
      <header className="grid grid-cols-[46px_1fr_46px] items-center px-[14px] py-[15px]">
        <Link
          href="/"
          aria-label="Fermer"
          className="flex items-center justify-center size-[46px] rounded-[10px] hover:bg-muted transition-colors"
        >
          <X size={22} strokeWidth={1.8} />
        </Link>
        <h1 className="text-center text-base font-bold">Créer une publication</h1>
        <div />
      </header>

      <main className="flex-1 flex flex-col gap-6 px-[14px]">
        <section className="flex flex-col gap-3">
          <h2 className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Catégorie <span className="text-red-500">*</span>
          </h2>
          <ChipGroup
            options={categories}
            selected={categoryId ? [categoryId] : []}
            onToggle={(id) => setCategoryId((prev) => (prev === id ? null : id))}
          />
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Thématique <span className="text-red-500">*</span>
          </h2>
          <ChipGroup options={topics} selected={topicIds} onToggle={toggleTopic} />
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Compétences
          </h2>
          <ChipGroup options={skills} selected={skillIds} onToggle={toggleSkill} />
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Votre message
          </h2>
          <div className="relative">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value.slice(0, CONTENT_MAX_LENGTH))}
              placeholder="Quoi de neuf dans la communauté ?"
              rows={5}
              className="w-full rounded-[14px] border border-border bg-muted/40 p-4 pb-7 text-[14px] outline-none resize-none focus:border-foreground placeholder:text-muted-foreground"
            />
            <span className="absolute bottom-2 right-3 text-[11px] text-muted-foreground">
              {content.length}/{CONTENT_MAX_LENGTH}
            </span>
          </div>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Ajouter un contenu</h2>
          <ContentPicker
            media={media}
            onAddMedia={(item) => setMedia((prev) => [...prev, item])}
            onRemoveMedia={(clientId) =>
              setMedia((prev) => {
                const removed = prev.find((m) => m.clientId === clientId);
                if (removed) URL.revokeObjectURL(removed.previewUrl);
                return prev.filter((m) => m.clientId !== clientId);
              })
            }
            document={document}
            onChangeDocument={(doc) => {
              if (document) URL.revokeObjectURL(document.previewUrl);
              setDocument(doc);
            }}
            poll={poll}
            onChangePoll={setPoll}
          />
        </section>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="flex flex-col gap-3 pb-8">
          <button
            type="button"
            onClick={handleSubmit}
            className="h-[52px] rounded-full bg-primary text-primary-foreground text-[15px] font-semibold"
          >
            Publier
          </button>
          <button
            type="button"
            disabled
            title="Les brouillons ne sont pas encore disponibles"
            className="h-10 text-[14px] text-muted-foreground opacity-50 cursor-not-allowed"
          >
            Enregistrer en brouillon
          </button>
        </div>
      </main>
    </div>
  );
}

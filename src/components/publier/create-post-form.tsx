"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { createPost } from "@/actions/posts";
import { ChipGroup } from "./chip-group";
import {
  ContentPicker,
  type MediaItem,
  type DocumentDraft,
  type PollDraft,
} from "./content-picker";
import { PostPreview } from "./post-preview";

const CONTENT_MAX_LENGTH = 1000;

type Option = { id: string; name: string };
type Author = { id: string; name: string; avatarUrl: string | null; role: string };

export function CreatePostForm({
  categories,
  topics,
  skills,
  author,
}: {
  categories: Option[];
  topics: Option[];
  skills: Option[];
  author: Author;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

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

  const selectedCategory = categories.find((c) => c.id === categoryId) ?? null;
  const selectedTopics = topics.filter((t) => topicIds.includes(t.id));

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

    startTransition(async () => {
      const result = await createPost(formData);
      if (!result.success) {
        setError(result.error);
        return;
      }
      router.push("/");
    });
  }

  return (
    <div className="flex flex-col min-h-full pb-[100px]">
      <header className="grid grid-cols-[46px_1fr_46px] items-center px-[14px] py-[15px] sticky top-0 z-40 bg-background">
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

      <main className="flex-1 flex flex-col gap-5 px-[14px]">
        <section className="flex flex-col gap-2">
          <h2 className="text-[14px] font-bold">Catégorie</h2>
          <ChipGroup
            options={categories}
            selected={categoryId ? [categoryId] : []}
            onToggle={(id) => setCategoryId((prev) => (prev === id ? null : id))}
          />
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-[14px] font-bold">Thématique(s)</h2>
          <ChipGroup options={topics} selected={topicIds} onToggle={toggleTopic} />
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-[14px] font-bold">Compétence(s)</h2>
          <ChipGroup options={skills} selected={skillIds} onToggle={toggleSkill} />
        </section>

        <section>
          <div className="relative">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value.slice(0, CONTENT_MAX_LENGTH))}
              placeholder="Quoi de neuf dans la communauté ?"
              rows={4}
              className="w-full rounded-[10px] border border-[#e8e8e8] bg-transparent p-3 pb-6 text-sm outline-none resize-none focus-visible:border-foreground"
            />
            <span className="absolute bottom-2 right-3 text-[11px] text-muted-foreground">
              {content.length}/{CONTENT_MAX_LENGTH}
            </span>
          </div>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-[14px] font-bold">Ajouter un contenu</h2>
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

        <section className="flex flex-col gap-2">
          <h2 className="text-[14px] font-bold">Aperçu du post</h2>
          <PostPreview
            author={author}
            category={selectedCategory}
            topics={selectedTopics}
            content={content}
            media={media}
            document={document}
            poll={poll}
          />
        </section>

        {error && <p className="text-sm text-destructive">{error}</p>}
      </main>

      <div className="fixed bottom-0 inset-x-0 z-50 bg-background border-t border-[#e8e8e8] px-[14px] pt-3 pb-[calc(12px+env(safe-area-inset-bottom))] flex flex-col gap-2">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isPending}
          className="h-11 rounded-[10px] bg-[#1e1e1e] text-[#e8e8e8] text-sm font-bold disabled:opacity-50 transition-opacity"
        >
          {isPending ? "Publication..." : "Publier"}
        </button>
        <button
          type="button"
          disabled
          title="Les brouillons ne sont pas encore disponibles"
          className="h-11 rounded-[10px] border border-[#e8e8e8] text-sm font-bold text-muted-foreground opacity-50 cursor-not-allowed"
        >
          Enregistrer en brouillon
        </button>
      </div>
    </div>
  );
}

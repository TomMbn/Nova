"use client";

import { useRef, useState } from "react";
import { Image as ImageIcon, FileText, BarChart2, Video, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type MediaItem = {
  clientId: string;
  type: "IMAGE" | "VIDEO";
  file: File;
  previewUrl: string;
};
export type DocumentDraft = { file: File; previewUrl: string };
export type PollDraft = { question: string; options: string[] };

const TILES = [
  { key: "IMAGE", label: "Image", hint: "JPG, PNG", icon: ImageIcon, accept: "image/*" },
  { key: "DOCUMENT", label: "Document", hint: "PDF", icon: FileText, accept: "application/pdf" },
  { key: "POLL", label: "Sondage", hint: "Question", icon: BarChart2, accept: null },
  { key: "VIDEO", label: "Vidéo", hint: "MP4", icon: Video, accept: "video/*" },
] as const;

type PanelKey = (typeof TILES)[number]["key"];

/**
 * Ajout de contenu depuis l'appareil de l'utilisateur (photothèque/fichiers,
 * caméra sur mobile) via `<input type="file">` natif. `Document` n'a pas
 * d'équivalent `Media.type` côté base (CHECK IN ('IMAGE', 'VIDEO') — cf.
 * CLAUDE.md) : le fichier n'est donc affiché que dans l'aperçu local, sans
 * être envoyé à `createPost`.
 */
export function ContentPicker({
  media,
  onAddMedia,
  onRemoveMedia,
  document,
  onChangeDocument,
  poll,
  onChangePoll,
}: {
  media: MediaItem[];
  onAddMedia: (item: MediaItem) => void;
  onRemoveMedia: (clientId: string) => void;
  document: DocumentDraft | null;
  onChangeDocument: (doc: DocumentDraft | null) => void;
  poll: PollDraft | null;
  onChangePoll: (poll: PollDraft | null) => void;
}) {
  const [openPanel, setOpenPanel] = useState<PanelKey | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleTileClick(key: PanelKey) {
    if (key === "POLL") {
      if (openPanel === "POLL") {
        setOpenPanel(null);
        return;
      }
      setOpenPanel("POLL");
      if (!poll) onChangePoll({ question: "", options: ["", ""] });
      return;
    }
    setOpenPanel(key);
    fileInputRef.current?.click();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // permet de resélectionner le même fichier ensuite
    if (!file || (openPanel !== "IMAGE" && openPanel !== "VIDEO" && openPanel !== "DOCUMENT")) return;

    const previewUrl = URL.createObjectURL(file);
    if (openPanel === "DOCUMENT") {
      onChangeDocument({ file, previewUrl });
    } else {
      onAddMedia({ clientId: crypto.randomUUID(), type: openPanel, file, previewUrl });
    }
    setOpenPanel(null);
  }

  const activeAccept = TILES.find((t) => t.key === openPanel)?.accept ?? undefined;

  return (
    <div className="flex flex-col gap-3">
      <input
        ref={fileInputRef}
        type="file"
        accept={activeAccept}
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="grid grid-cols-4 gap-2">
        {TILES.map((tile) => {
          const Icon = tile.icon;
          const active = openPanel === tile.key;
          return (
            <button
              key={tile.key}
              type="button"
              onClick={() => handleTileClick(tile.key)}
              className={cn(
                "flex flex-col items-center gap-1.5 rounded-[10px] border p-3 transition-colors",
                active
                  ? "border-foreground bg-muted"
                  : "border-border hover:bg-muted"
              )}
            >
              <span className="flex items-center justify-center size-9 rounded-full border border-border">
                <Icon size={18} strokeWidth={1.6} />
              </span>
              <span className="text-xs font-bold">{tile.label}</span>
              <span className="text-[11px] text-muted-foreground">{tile.hint}</span>
            </button>
          );
        })}
      </div>

      {openPanel === "POLL" && poll && (
        <div className="flex flex-col gap-2 rounded-[10px] border border-border p-3">
          <input
            value={poll.question}
            onChange={(e) => onChangePoll({ ...poll, question: e.target.value })}
            placeholder="Votre question"
            className="h-9 rounded-[10px] border border-border bg-transparent px-3 text-sm outline-none focus-visible:border-foreground"
          />
          {poll.options.map((opt, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                value={opt}
                onChange={(e) => {
                  const options = [...poll.options];
                  options[i] = e.target.value;
                  onChangePoll({ ...poll, options });
                }}
                placeholder={`Option ${i + 1}`}
                className="flex-1 h-9 rounded-[10px] border border-border bg-transparent px-3 text-sm outline-none focus-visible:border-foreground"
              />
              {poll.options.length > 2 && (
                <button
                  type="button"
                  onClick={() =>
                    onChangePoll({
                      ...poll,
                      options: poll.options.filter((_, j) => j !== i),
                    })
                  }
                  aria-label="Retirer l'option"
                  className="flex items-center justify-center size-9 rounded-[10px] hover:bg-muted transition-colors shrink-0"
                >
                  <X size={16} strokeWidth={1.8} />
                </button>
              )}
            </div>
          ))}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onChangePoll({ ...poll, options: [...poll.options, ""] })}
              className="text-sm font-bold text-foreground w-fit hover:underline"
            >
              + Ajouter une option
            </button>
            <button
              type="button"
              onClick={() => {
                onChangePoll(null);
                setOpenPanel(null);
              }}
              className="ml-auto text-sm text-muted-foreground hover:underline"
            >
              Retirer le sondage
            </button>
          </div>
        </div>
      )}

      {(media.length > 0 || document) && (
        <div className="flex flex-col gap-1.5">
          {media.map((item) => (
            <div
              key={item.clientId}
              className="flex items-center gap-2 rounded-[10px] border border-border px-3 h-9"
            >
              {item.type === "IMAGE" ? (
                <ImageIcon size={16} strokeWidth={1.6} className="shrink-0" />
              ) : (
                <Video size={16} strokeWidth={1.6} className="shrink-0" />
              )}
              <span className="text-xs truncate flex-1">{item.file.name}</span>
              <button
                type="button"
                onClick={() => onRemoveMedia(item.clientId)}
                aria-label="Retirer"
                className="shrink-0 flex items-center justify-center size-6 rounded-[6px] hover:bg-muted transition-colors"
              >
                <X size={14} strokeWidth={1.8} />
              </button>
            </div>
          ))}
          {document && (
            <div className="flex items-center gap-2 rounded-[10px] border border-border px-3 h-9">
              <FileText size={16} strokeWidth={1.6} className="shrink-0" />
              <span className="text-xs truncate flex-1">{document.file.name}</span>
              <button
                type="button"
                onClick={() => onChangeDocument(null)}
                aria-label="Retirer"
                className="shrink-0 flex items-center justify-center size-6 rounded-[6px] hover:bg-muted transition-colors"
              >
                <X size={14} strokeWidth={1.8} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

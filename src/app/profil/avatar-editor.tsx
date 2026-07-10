"use client";

import { useRef, useState, useTransition } from "react";
import { Camera, Loader2, Trash2 } from "lucide-react";

import { updateAvatar, deleteAvatar } from "@/actions/profile";
import { cn } from "@/lib/utils";

export function AvatarEditor({
  avatarUrl,
  initials,
  name,
}: {
  avatarUrl: string | null;
  initials: string;
  name: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(avatarUrl);
  const [menuOpen, setMenuOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setMenuOpen(false);
    if (!file) return;

    setError(null);
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    const formData = new FormData();
    formData.set("avatar", file);

    startTransition(async () => {
      const result = await updateAvatar(formData);
      if (!result.success) {
        setError(result.error);
        setPreview(avatarUrl);
      } else {
        setPreview(result.data.avatarUrl);
      }
      URL.revokeObjectURL(objectUrl);
      if (inputRef.current) inputRef.current.value = "";
    });
  }

  function handleDelete() {
    setMenuOpen(false);
    setError(null);
    startTransition(async () => {
      const result = await deleteAvatar();
      if (!result.success) {
        setError(result.error);
      } else {
        setPreview(null);
      }
    });
  }

  return (
    <div className="relative">
      <div className="size-16 overflow-hidden rounded-2xl ring-4 ring-background">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt={name} className="size-full object-cover" />
        ) : (
          <div className="flex size-full items-center justify-center bg-muted text-lg font-semibold text-muted-foreground">
            {initials}
          </div>
        )}
        {isPending && (
          <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/40">
            <Loader2 className="size-5 animate-spin text-white" />
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={() => setMenuOpen((v) => !v)}
        aria-label="Modifier la photo de profil"
        className="absolute -right-1.5 -bottom-1.5 flex size-6 items-center justify-center rounded-full bg-foreground text-background ring-2 ring-background"
      >
        <Camera size={12} strokeWidth={2.2} />
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {menuOpen && (
        <div className="absolute top-full left-0 z-50 mt-1 w-44 overflow-hidden rounded-xl border border-border bg-popover shadow-lg">
          <button
            type="button"
            onClick={() => {
              setMenuOpen(false);
              inputRef.current?.click();
            }}
            className={cn(
              "flex w-full items-center gap-2 px-3 py-2.5 text-left text-xs font-semibold transition-colors hover:bg-muted"
            )}
          >
            <Camera size={14} />
            {preview ? "Changer la photo" : "Ajouter une photo"}
          </button>
          {preview && (
            <button
              type="button"
              onClick={handleDelete}
              className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-xs font-semibold text-destructive transition-colors hover:bg-muted"
            >
              <Trash2 size={14} />
              Supprimer la photo
            </button>
          )}
        </div>
      )}

      {error && (
        <p className="absolute top-full left-0 mt-1 w-40 text-[11px] font-medium text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

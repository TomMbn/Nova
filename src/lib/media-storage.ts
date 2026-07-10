import { put } from "@vercel/blob";

const MAX_SIZE_BYTES: Record<"IMAGE" | "VIDEO", number> = {
  IMAGE: 5 * 1024 * 1024,
  VIDEO: 25 * 1024 * 1024,
};

const ALLOWED_MIME_PREFIX: Record<"IMAGE" | "VIDEO", string> = {
  IMAGE: "image/",
  VIDEO: "video/",
};

/**
 * Upload un fichier vers Vercel Blob et renvoie son URL publique.
 * Valide le type MIME déclaré (doit correspondre à `kind`) et la taille.
 */
export async function saveUploadedFile(
  file: File,
  kind: "IMAGE" | "VIDEO"
): Promise<{ url: string } | { error: string }> {
  if (file.size === 0) return { error: "Fichier vide." };

  if (file.size > MAX_SIZE_BYTES[kind]) {
    const maxMo = MAX_SIZE_BYTES[kind] / (1024 * 1024);
    return { error: `Fichier trop volumineux (max ${maxMo} Mo).` };
  }

  if (file.type && !file.type.startsWith(ALLOWED_MIME_PREFIX[kind])) {
    return {
      error: `Ce fichier ne correspond pas au type ${kind === "IMAGE" ? "image" : "vidéo"}.`,
    };
  }

  const { url } = await put(file.name, file, { access: "public" });
  return { url };
}

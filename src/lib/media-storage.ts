import { mkdir, writeFile } from "fs/promises";
import path from "path";

// Stockage local sous public/ : le fichier devient servi tel quel par Next
// (URL publique `/uploads/xxx`), sans dépendance ni compte externe. À noter :
// ne persiste pas d'un déploiement à l'autre sur une plateforme serverless
// (filesystem éphémère) — à remplacer par un stockage objet (Vercel Blob,
// S3...) si l'app est déployée ainsi durablement.
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

const MAX_SIZE_BYTES: Record<"IMAGE" | "VIDEO", number> = {
  IMAGE: 5 * 1024 * 1024,
  VIDEO: 25 * 1024 * 1024,
};

const ALLOWED_MIME_PREFIX: Record<"IMAGE" | "VIDEO", string> = {
  IMAGE: "image/",
  VIDEO: "video/",
};

/**
 * Écrit un fichier uploadé dans public/uploads et renvoie son URL publique.
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
    return { error: `Ce fichier ne correspond pas au type ${kind === "IMAGE" ? "image" : "vidéo"}.` };
  }

  await mkdir(UPLOAD_DIR, { recursive: true });

  const ext = path.extname(file.name).slice(0, 10) || (kind === "IMAGE" ? ".jpg" : ".mp4");
  const filename = `${crypto.randomUUID()}${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(UPLOAD_DIR, filename), buffer);

  return { url: `/uploads/${filename}` };
}

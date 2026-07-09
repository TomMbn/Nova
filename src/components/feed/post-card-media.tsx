import Image from "next/image";
import { ImageIcon } from "lucide-react";

type Media = { id: string; type: string; url: string; position: number };
type Poll = { id: string; question: string; options: { id: string; label: string }[] };

export function PostCardMedia({
  media,
  poll,
}: {
  media: Media[];
  poll: Poll | null;
}) {
  const firstImage = media.find((m) => m.type === "IMAGE");
  const firstVideo = !firstImage ? media.find((m) => m.type === "VIDEO") : null;

  if (firstImage) {
    return (
      <div className="relative w-full aspect-[16/9] rounded-[10px] overflow-hidden border border-border bg-muted">
        <Image src={firstImage.url} alt="" fill className="object-cover" />
      </div>
    );
  }

  if (firstVideo) {
    return (
      <div className="relative w-full aspect-[16/9] rounded-[10px] overflow-hidden border border-border bg-muted">
        <video
          src={firstVideo.url}
          controls
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>
    );
  }

  if (poll) {
    return (
      <div className="rounded-[10px] border border-border p-3 flex flex-col gap-2">
        <p className="text-sm font-bold">{poll.question}</p>
        <div className="flex flex-col gap-1.5">
          {poll.options.map((opt) => (
            <div
              key={opt.id}
              className="w-full rounded-[6px] bg-muted px-3 py-2 text-xs font-medium"
            >
              {opt.label}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
}

// Placeholder affiché dans le wireframe quand l'image n'est pas encore chargée
export function PostCardMediaPlaceholder() {
  return (
    <div className="relative w-full aspect-[16/9] rounded-[10px] border border-border bg-muted flex items-center justify-center">
      <ImageIcon size={24} strokeWidth={1.5} className="text-muted-foreground" />
    </div>
  );
}

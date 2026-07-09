import Image from "next/image";
import { ImageIcon } from "lucide-react";
import { PollVote, type PollWithResults } from "./poll-vote";

type Media = { id: string; type: string; url: string; position: number };
type Poll = PollWithResults;

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
    // Les aperçus locaux (composition d'un post) utilisent un blob: URL —
    // next/image ne sait pas l'optimiser, on retombe sur <img> dans ce cas.
    const isBlobPreview = firstImage.url.startsWith("blob:");
    return (
      <div className="relative w-full aspect-[16/9] rounded-[10px] overflow-hidden border border-border bg-muted">
        {isBlobPreview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={firstImage.url} alt="" className="absolute inset-0 size-full object-cover" />
        ) : (
          <Image src={firstImage.url} alt="" fill className="object-cover" />
        )}
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
    return <PollVote poll={poll} />;
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

import { User, FileText } from "lucide-react";
import { splitPostContent } from "@/lib/post-content";
import { PostCardMedia } from "@/components/feed/post-card-media";
import type { MediaItem, DocumentDraft, PollDraft } from "./content-picker";

type Author = { name: string; avatarUrl: string | null; role: string };
type Option = { id: string; name: string };

export function PostPreview({
  author,
  category,
  topics,
  content,
  media,
  document,
  poll,
}: {
  author: Author;
  category: Option | null;
  topics: Option[];
  content: string;
  media: MediaItem[];
  document: DocumentDraft | null;
  poll: PollDraft | null;
}) {
  const previewMedia = media.map((m, i) => ({
    id: m.clientId,
    type: m.type,
    url: m.previewUrl,
    position: i,
  }));
  const previewPollOptions = poll ? poll.options.filter((o) => o.trim()) : [];

  return (
    <article className="border border-border rounded-[10px] p-[10px] flex flex-col gap-[10px]">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <div className="size-[38px] rounded-[10px] bg-muted flex items-center justify-center shrink-0 overflow-hidden">
            {author.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={author.avatarUrl} alt={author.name} className="size-full object-cover" />
            ) : (
              <User size={20} strokeWidth={1.5} className="text-muted-foreground" />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-[12px] font-bold leading-tight truncate">{author.name}</p>
            <p className="text-[12px] font-normal leading-tight text-foreground truncate">
              {author.role}
            </p>
          </div>
        </div>
        <span className="text-[12px] font-bold shrink-0 mt-0.5">à l&apos;instant</span>
      </div>

      {(category || topics.length > 0) && (
        <div className="flex gap-2 flex-wrap">
          {category && (
            <span className="px-[10px] py-1 h-6 rounded-[10px] bg-muted text-[12px] font-bold leading-none flex items-center">
              {category.name}
            </span>
          )}
          {topics.map((t) => (
            <span
              key={t.id}
              className="px-[10px] py-1 h-6 rounded-[10px] bg-foreground/5 text-[12px] font-bold leading-none flex items-center"
            >
              {t.name}
            </span>
          ))}
        </div>
      )}

      {content.trim() && (() => {
        const { title, body } = splitPostContent(content.trim());
        return title ? (
          <div className="flex flex-col gap-1">
            <p className="text-[14px] font-bold leading-snug">{title}</p>
            <p className="text-[14px] leading-relaxed text-muted-foreground whitespace-pre-wrap">
              {body}
            </p>
          </div>
        ) : (
          <p className="text-[14px] font-bold leading-snug whitespace-pre-wrap">{body}</p>
        );
      })()}

      <PostCardMedia media={previewMedia} poll={null} />

      {poll && poll.question.trim() && (
        <div className="rounded-[10px] border border-border p-3 flex flex-col gap-2">
          <p className="text-sm font-bold">{poll.question}</p>
          <div className="flex flex-col gap-1.5">
            {previewPollOptions.map((label, i) => (
              <div key={i} className="w-full rounded-[6px] bg-muted px-3 py-2 text-xs font-medium">
                {label}
              </div>
            ))}
          </div>
        </div>
      )}

      {document && (
        <div className="flex items-center gap-2 rounded-[10px] border border-border px-3 h-9">
          <FileText size={16} strokeWidth={1.6} className="shrink-0" />
          <span className="text-xs truncate">{document.file.name}</span>
        </div>
      )}
    </article>
  );
}

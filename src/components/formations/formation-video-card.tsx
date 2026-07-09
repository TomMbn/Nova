import type { FormationVideo } from "@/queries/formations";

export function FormationVideoCard({ formation }: { formation: FormationVideo }) {
  return (
    <article className="border border-border rounded-[10px] p-[10px] flex flex-col gap-[10px]">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <p className="text-[12px] font-bold leading-tight">{formation.title}</p>
      </div>

      {/* Topics */}
      {formation.topics.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {formation.topics.map((t) => (
            <span
              key={t.id}
              className="px-[10px] py-1 h-6 rounded-[10px] bg-muted text-[12px] font-bold leading-none flex items-center"
            >
              {t.name}
            </span>
          ))}
        </div>
      )}

      {/* Description */}
      <p className="text-[12px] font-normal leading-snug">{formation.description}</p>

      {/* Lecteur vidéo intégré */}
      <div className="rounded-[10px] overflow-hidden bg-muted aspect-video w-full">
        <video
          src={formation.videoUrl}
          controls
          className="w-full h-full object-cover"
          preload="metadata"
        />
      </div>
    </article>
  );
}

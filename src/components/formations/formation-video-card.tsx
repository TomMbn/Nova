import type { FormationVideo } from "@/queries/formations";

export function FormationVideoCard({ formation }: { formation: FormationVideo }) {
  return (
    <article className="flex flex-col gap-3 rounded-2xl bg-card p-4 shadow-sm">
      {/* Lecteur vidéo intégré */}
      <div className="w-full aspect-video rounded-xl overflow-hidden bg-muted">
        <video
          src={formation.videoUrl}
          controls
          className="w-full h-full object-cover"
          preload="metadata"
        />
      </div>

      {/* Thématiques (couleur de marque, cf. PostCard) */}
      {formation.topics.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {formation.topics.map((t) => (
            <span
              key={t.id}
              className="flex h-6 items-center rounded-lg bg-primary/10 px-2.5 text-xs font-bold text-primary"
            >
              {t.name}
            </span>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-1">
        <h3 className="text-sm font-bold leading-snug">{formation.title}</h3>
        <p className="text-xs leading-relaxed text-muted-foreground line-clamp-2">
          {formation.description}
        </p>
      </div>
    </article>
  );
}

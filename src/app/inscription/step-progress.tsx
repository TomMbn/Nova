export function StepProgress({ step, total }: { step: number; total: number }) {
  const percent = Math.round((step / total) * 100);

  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-semibold tracking-widest text-primary uppercase">
        Étape {step} sur {total}
      </span>
      <div className="h-1 w-full rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

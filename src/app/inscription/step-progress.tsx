export function StepProgress({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex items-center justify-center gap-1.5">
      {Array.from({ length: total }, (_, i) => i + 1).map((n) => (
        <span
          key={n}
          className={`h-1.5 rounded-full transition-all ${
            n === step ? "w-6 bg-foreground" : "w-1.5 bg-muted"
          }`}
        />
      ))}
    </div>
  );
}

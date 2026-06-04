import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

const PHASES = [
  "Analyzing requirements",
  "Building workload profile",
  "Selecting models",
  "Designing architecture",
  "Calculating cost estimates",
  "Preparing recommendations",
];

export function SubmitOverlay({ open }: { open: boolean }) {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    if (!open) return;
    setIdx(0);
    const t = setInterval(() => setIdx((i) => (i + 1) % PHASES.length), 1500);
    return () => clearInterval(t);
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-6 text-center">
        <div className="relative h-24 w-24">
          <div className="absolute inset-0 rounded-full border border-border" />
          <Loader2 className="absolute inset-0 m-auto h-24 w-24 animate-spin text-primary" strokeWidth={1} />
        </div>
        <div>
          <div className="text-xs uppercase tracking-widest text-muted-foreground">
            Working on it
          </div>
          <div className="mt-2 text-lg font-medium text-foreground tabular-nums">
            {PHASES[idx]}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            Typically takes 5–15 seconds
          </div>
        </div>
        <div className="flex gap-1.5">
          {PHASES.map((_, i) => (
            <div
              key={i}
              className={`h-1 w-6 rounded-full transition-colors ${
                i <= idx ? "bg-primary" : "bg-border"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

import { useRecommendationStore } from "@/stores/recommendation";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, Zap, TrendingDown, Sparkles } from "lucide-react";

const ICONS = {
  high: Zap,
  medium: TrendingDown,
  low: Sparkles,
} as const;

const TONES: Record<string, string> = {
  high: "border-emerald-500/30 bg-emerald-500/5 text-emerald-400",
  medium: "border-amber-500/30 bg-amber-500/5 text-amber-400",
  low: "border-blue-500/30 bg-blue-500/5 text-blue-400",
};

export function OptimizationTab() {
  const tips = useRecommendationStore((s) => s.recommendation?.optimisation_tips) ?? [];

  if (tips.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card/50 px-6 py-16 text-center">
        <Lightbulb className="h-6 w-6 text-muted-foreground" />
        <h3 className="mt-3 text-sm font-medium">No optimisation tips returned</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          The API did not include optimisation suggestions for this project.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium">Optimisation suggestions</h3>
        <p className="text-xs text-muted-foreground">
          Ranked recommendations to reduce cost or improve performance.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {tips.map((t, i) => {
          const impact = String(t.impact ?? "").toLowerCase();
          const Icon = (ICONS as Record<string, typeof Zap>)[impact] ?? Lightbulb;
          const tone = TONES[impact] ?? "border-border bg-card text-muted-foreground";
          return (
            <div key={i} className="rounded-lg border border-border bg-card p-5">
              <div className="flex items-start justify-between gap-3">
                <div className={`flex h-8 w-8 items-center justify-center rounded-md border ${tone}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <Badge variant="outline" className="text-[10px] uppercase">
                  {impact || "info"} impact
                </Badge>
              </div>
              <h4 className="mt-3 text-sm font-semibold">{t.title}</h4>
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{t.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

import { GlassCard } from "@/components/ui/GlassCard";
import { TierBadge } from "@/components/ui/TierBadge";
import { useRecommendationStore } from "@/stores/recommendation";
import { useModelsStore } from "@/stores/models";
import type { RecommendationCategory } from "@/lib/types";

const RATIONALE: Record<RecommendationCategory, string> = {
  recommended:
    "Balanced cost-to-capability ratio across all SDLC stages. Production-ready accuracy without premium pricing.",
  budget:
    "Optimised for cost. Best for prototypes, internal tooling, and high-volume low-stakes workloads.",
  premium:
    "Highest reasoning depth and accuracy. Recommended for safety-critical and complex strategic workloads.",
};

export function RecommendationSummary() {
  const rec = useRecommendationStore((s) => s.recommendation);
  const models = useModelsStore((s) => s.models);
  if (!rec) return null;

  const tiers: RecommendationCategory[] = ["recommended", "budget", "premium"];

  return (
    <GlassCard className="p-5">
      <div className="text-sm font-semibold">Recommendation Summary</div>
      <div className="text-xs text-muted-foreground">
        Why each tier wins.
      </div>
      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
        {tiers.map((t) => {
          const r = rec.single_model_recommendations.find((x) => x.category === t);
          const name = models.find((m) => m.id === r?.model_id)?.name ?? r?.model_id ?? "—";
          return (
            <div key={t} className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
              <div className="flex items-center justify-between">
                <TierBadge tier={t} />
              </div>
              <div className="mt-2 truncate text-sm font-medium">{name}</div>
              <p className="mt-1.5 text-xs text-muted-foreground">
                {r?.why ?? r?.reason ?? RATIONALE[t]}
              </p>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}

import { useSdlcRows } from "@/lib/sdlcMapping";
import { SdlcStageAccordion } from "@/components/dashboard/sdlc/SdlcStageAccordion";
import { GlassCard } from "@/components/ui/GlassCard";
import type { RecommendationCategory } from "@/lib/types";

const TIER_DOT: Record<RecommendationCategory, string> = {
  recommended: "bg-cyan-400",
  budget: "bg-emerald-400",
  premium: "bg-purple-400",
};

function topModel(rows: ReturnType<typeof useSdlcRows>, tier: RecommendationCategory): string {
  const counts = new Map<string, number>();
  for (const r of rows) {
    const n = r.picks[tier].modelName;
    if (!n) continue;
    counts.set(n, (counts.get(n) ?? 0) + 1);
  }
  let best = "";
  let max = 0;
  for (const [k, v] of counts) {
    if (v > max) {
      max = v;
      best = k;
    }
  }
  return best || "—";
}

export function SdlcPlanTab() {
  const rows = useSdlcRows();

  if (rows.length === 0) {
    return (
      <GlassCard className="p-10 text-center text-sm text-muted-foreground">
        No SDLC plan available yet — submit the questionnaire to generate one.
      </GlassCard>
    );
  }

  const tiers: RecommendationCategory[] = ["recommended", "budget", "premium"];

  return (
    <div className="space-y-3">
      <GlassCard className="overflow-hidden">
        <div className="grid grid-cols-[1.2fr_1fr_1fr_1fr_auto] items-end gap-4 px-5 py-4">
          <div className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
            Stage
          </div>
          {tiers.map((t) => (
            <div key={t}>
              <div className="flex items-center gap-1.5">
                <span className={`h-1.5 w-1.5 rounded-full ${TIER_DOT[t]}`} />
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  {t}
                </span>
              </div>
              <div className="mt-0.5 truncate text-sm font-semibold">
                {topModel(rows, t)}
              </div>
            </div>
          ))}
          <span />
        </div>
      </GlassCard>

      <div className="space-y-2">
        {rows.map((r, i) => (
          <SdlcStageAccordion key={r.stage.id} row={r} defaultOpen={i === 0} />
        ))}
      </div>
    </div>
  );
}

import { useSdlcRows } from "@/lib/sdlcMapping";
import { SdlcStageAccordion } from "@/components/dashboard/sdlc/SdlcStageAccordion";
import { GlassCard } from "@/components/ui/GlassCard";
import { cn } from "@/lib/utils";
import { Sparkles, Wallet, Crown } from "lucide-react";
import type { RecommendationCategory } from "@/lib/types";

const TIER_META: Record<
  RecommendationCategory,
  { label: string; pill: string; icon: typeof Sparkles }
> = {
  recommended: {
    label: "Recommended",
    pill: "border-cyan-400/40 bg-cyan-400/10 text-cyan-200",
    icon: Sparkles,
  },
  budget: {
    label: "Budget",
    pill: "border-emerald-400/40 bg-emerald-400/10 text-emerald-200",
    icon: Wallet,
  },
  premium: {
    label: "Premium",
    pill: "border-purple-400/40 bg-purple-400/10 text-purple-200",
    icon: Crown,
  },
};

function topModel(
  rows: ReturnType<typeof useSdlcRows>,
  tier: RecommendationCategory,
): string {
  const counts = new Map<string, number>();
  for (const r of rows) {
    const n = r.picks[tier].modelName;
    if (!n || n === "—") continue;
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
        <div className="grid grid-cols-[1.2fr_1fr_1fr_1fr_auto] items-center gap-4 px-5 py-5">
          <div className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
            Stage
          </div>
          {tiers.map((t) => {
            const meta = TIER_META[t];
            const Icon = meta.icon;
            return (
              <div key={t} className="flex flex-col items-center gap-2">
                <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                  <Icon className="h-3 w-3" /> {meta.label}
                </div>
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-wide",
                    meta.pill,
                  )}
                >
                  {topModel(rows, t)}
                </span>
              </div>
            );
          })}
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

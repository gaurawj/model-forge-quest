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
    pill: "border-primary/40 bg-primary/10 text-primary",
    icon: Sparkles,
  },
  budget: {
    label: "Budget",
    pill: "border-emerald-500/40 bg-emerald-500/10 text-emerald-700",
    icon: Wallet,
  },
  premium: {
    label: "Premium",
    pill: "border-orange-500/40 bg-orange-500/10 text-orange-600",
    icon: Crown,
  },
};

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
              <div key={t} className="flex justify-center">
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-wide",
                    meta.pill,
                  )}
                >
                  <Icon className="h-3 w-3" /> {meta.label}
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

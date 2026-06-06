import { useState } from "react";
import { ChevronDown, ListChecks, Receipt } from "lucide-react";
import { cn } from "@/lib/utils";
import { GlassCard } from "@/components/ui/GlassCard";
import { formatCurrency, formatNumber } from "@/lib/cost";
import { useProjectConfigStore } from "@/stores/projectConfig";
import { useRecommendationStore } from "@/stores/recommendation";
import type { RecommendationCategory } from "@/lib/types";
import type { StageRow, StagePick } from "@/lib/sdlcMapping";

const TIER_TEXT: Record<RecommendationCategory, string> = {
  recommended: "text-cyan-300",
  budget: "text-emerald-300",
  premium: "text-purple-300",
};

export function SdlcStageAccordion({
  row,
  defaultOpen = false,
}: {
  row: StageRow;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const tiers: RecommendationCategory[] = ["recommended", "budget", "premium"];
  const complexity = useProjectConfigStore((s) => s.complexity);
  const duration = useProjectConfigStore((s) => s.durationMonths);
  const draft = useRecommendationStore((s) => s.draft);
  const complexityMultiplier = 0.8 + (complexity / 10) * 0.8; // 0.8x – 1.6x

  return (
    <GlassCard className="overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="grid w-full grid-cols-[1.2fr_1fr_1fr_1fr_auto] items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-white/[0.02]"
      >
        <div className="text-sm font-semibold">{row.stage.name}</div>
        <span />
        <span />
        <span />
        <ChevronDown
          className={cn(
            "h-4 w-4 text-muted-foreground transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div className="grid grid-cols-[1.2fr_1fr_1fr_1fr_auto] gap-4 border-t border-white/[0.06] bg-black/20 px-5 py-5">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              <ListChecks className="h-3.5 w-3.5" /> AI Thinking Steps
            </div>
            <ol className="mt-3 space-y-2 text-sm">
              {row.stage.thinkingSteps.map((step, i) => (
                <li key={i} className="flex gap-3">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-[10px] font-medium text-cyan-300">
                    {i + 1}
                  </span>
                  <span className="text-foreground/90">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {tiers.map((t) => (
            <CostBreakdownCard
              key={t}
              tier={t}
              pick={row.picks[t]}
              perUnitTokens={(draft?.avg_input_tokens ?? 0) + (draft?.avg_output_tokens ?? 0)}
              complexityMultiplier={complexityMultiplier}
              durationMonths={duration || 1}
            />
          ))}
          <span />
        </div>
      )}
    </GlassCard>
  );
}

function CostBreakdownCard({
  tier,
  pick,
  perUnitTokens,
  complexityMultiplier,
  durationMonths,
}: {
  tier: RecommendationCategory;
  pick: StagePick;
  perUnitTokens: number;
  complexityMultiplier: number;
  durationMonths: number;
}) {
  const totalTokens = pick.inputTokens + pick.outputTokens;
  const units = perUnitTokens > 0 ? Math.round(totalTokens / perUnitTokens) : 0;
  const monthly = pick.cost / Math.max(durationMonths, 1);

  return (
    <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-4">
      <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
        <Receipt className="h-3 w-3" /> Cost Breakdown
      </div>
      <dl className="mt-3 space-y-1.5 text-xs">
        <Row label="Per-unit tokens" value={formatNumber(perUnitTokens)} />
        <Row label={`× ${formatNumber(units)} units`} value={formatNumber(totalTokens)} />
        <Row label="Complexity multiplier" value={`${complexityMultiplier.toFixed(1)}x`} />
        <Row label="Input (70%)" value={formatNumber(pick.inputTokens)} />
        <Row label="Output (30%)" value={formatNumber(pick.outputTokens)} />
      </dl>
      <div className="mt-3 flex items-center justify-between border-t border-white/[0.06] pt-3">
        <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
          Est. monthly
        </span>
        <span className={cn("text-sm font-semibold tabular-nums", TIER_TEXT[tier])}>
          {formatCurrency(monthly)}
        </span>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="tabular-nums text-foreground/90">{value}</dd>
    </div>
  );
}

import { useState } from "react";
import { ChevronDown, ListChecks } from "lucide-react";
import { cn } from "@/lib/utils";
import { GlassCard } from "@/components/ui/GlassCard";
import { TierBadge } from "@/components/ui/TierBadge";
import { formatCurrency, formatNumber } from "@/lib/cost";
import type { RecommendationCategory } from "@/lib/types";
import type { StageRow } from "@/lib/sdlcMapping";

const TIER_DOT: Record<RecommendationCategory, string> = {
  recommended: "bg-cyan-400",
  budget: "bg-emerald-400",
  premium: "bg-purple-400",
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

  return (
    <GlassCard className="overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="grid w-full grid-cols-[1.2fr_1fr_1fr_1fr_auto] items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-white/[0.02]"
      >
        <div>
          <div className="text-xs uppercase tracking-widest text-muted-foreground">
            Stage
          </div>
          <div className="mt-0.5 text-sm font-semibold">{row.stage.name}</div>
        </div>
        {tiers.map((t) => (
          <ModelCell key={t} tier={t} name={row.picks[t].modelName} cost={row.picks[t].cost} />
        ))}
        <ChevronDown
          className={cn(
            "h-4 w-4 text-muted-foreground transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div className="border-t border-white/[0.06] bg-black/20 px-5 py-5">
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                <ListChecks className="h-3.5 w-3.5" /> AI Thinking Process
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

            <div className="grid grid-cols-1 gap-3 md:grid-cols-3 lg:col-span-3">
              {tiers.map((t) => (
                <CostBreakdownCard key={t} tier={t} pick={row.picks[t]} />
              ))}
            </div>
          </div>
        </div>
      )}
    </GlassCard>
  );

  function ModelCell({
    tier,
    name,
    cost,
  }: {
    tier: RecommendationCategory;
    name: string;
    cost: number;
  }) {
    return (
      <div className="min-w-0">
        <div className="flex items-center gap-1.5">
          <span className={cn("h-1.5 w-1.5 rounded-full", TIER_DOT[tier])} />
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
            {tier}
          </span>
        </div>
        <div className="mt-0.5 truncate text-sm font-medium">{name}</div>
        <div className="text-[11px] tabular-nums text-muted-foreground">
          {formatCurrency(cost)} / stage
        </div>
      </div>
    );
  }
}

function CostBreakdownCard({
  tier,
  pick,
}: {
  tier: RecommendationCategory;
  pick: StageRow["picks"][RecommendationCategory];
}) {
  return (
    <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-4">
      <div className="flex items-center justify-between">
        <TierBadge tier={tier} />
        <span className="text-[10px] text-muted-foreground">{pick.provider ?? "—"}</span>
      </div>
      <div className="mt-3 truncate text-sm font-semibold">{pick.modelName}</div>
      <dl className="mt-3 space-y-1.5 text-xs">
        <Row label="Input tokens" value={formatNumber(pick.inputTokens)} />
        <Row label="Output tokens" value={formatNumber(pick.outputTokens)} />
        <Row label="Estimated cost" value={formatCurrency(pick.cost)} strong />
        <Row
          label="Confidence"
          value={`${Math.round(pick.confidence * 100)}%`}
        />
      </dl>
    </div>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={cn("tabular-nums", strong && "text-sm font-semibold text-foreground")}>{value}</dd>
    </div>
  );
}

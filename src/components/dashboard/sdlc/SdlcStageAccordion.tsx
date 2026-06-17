import { useState } from "react";
import { ChevronDown, ListChecks, Receipt } from "lucide-react";
import { cn } from "@/lib/utils";
import { GlassCard } from "@/components/ui/GlassCard";
import { formatCurrency, formatNumber } from "@/lib/cost";
import type { RecommendationCategory } from "@/lib/types";
import type { StageRow, StagePick } from "@/lib/sdlcMapping";

const TIER_TEXT: Record<RecommendationCategory, string> = {
  recommended: "text-primary",
  budget: "text-emerald-700",
  premium: "text-orange-600",
};

const TIER_PILL: Record<RecommendationCategory, string> = {
  recommended: "border-primary/40 bg-primary/10 text-primary",
  budget: "border-emerald-500/40 bg-emerald-500/10 text-emerald-700",
  premium: "border-orange-500/40 bg-orange-500/10 text-orange-600",
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
        className="grid w-full grid-cols-[1.2fr_1fr_1fr_1fr_auto] items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-muted/40"
      >
        <div className="text-sm font-semibold">{row.stage.name}</div>
        {tiers.map((t) => {
          const pick = row.picks[t];
          const label = pick.modelId ? (pick.modelName ?? pick.modelId) : "—";
          return (
            <div key={t} className="flex justify-center">
              <span
                className={cn(
                  "inline-flex max-w-full items-center gap-1.5 truncate rounded-full border px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wide",
                  TIER_PILL[t],
                )}
                title={pick.modelId}
              >
                {label}
              </span>
            </div>
          );
        })}
        <ChevronDown
          className={cn(
            "h-4 w-4 text-muted-foreground transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div className="grid grid-cols-[1.2fr_1fr_1fr_1fr_auto] gap-4 border-t border-border bg-muted/30 px-5 py-5">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              <ListChecks className="h-3.5 w-3.5" /> AI Thinking Steps
            </div>
            <ol className="mt-3 space-y-2 text-sm">
              {row.stage.thinkingSteps.map((step, i) => (
                <li key={i} className="flex gap-3">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-border bg-muted/60 text-[10px] font-medium text-primary">
                    {i + 1}
                  </span>
                  <span className="text-foreground/90">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {tiers.map((t) => (
            <CostBreakdownCard key={t} tier={t} pick={row.picks[t]} />
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
}: {
  tier: RecommendationCategory;
  pick: StagePick;
}) {
  return (
    <div className="rounded-lg border border-border bg-muted/40 p-4">
      <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
        <Receipt className="h-3 w-3" /> Cost Breakdown
      </div>
      <dl className="mt-3 space-y-1.5 text-xs">
        <Row label="Input Tokens" value={formatNumber(pick.inputTokens)} />
        <Row label="Output Tokens" value={formatNumber(pick.outputTokens)} />
        <Row label="Cached Tokens" value={formatNumber(pick.cachedTokens)} />
        <Row label="Total Requests" value={formatNumber(pick.totalRequests)} />
        <Row label="Duration" value={`${pick.durationMonths} mo`} />
      </dl>
      <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
        <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
          Projected Cost
        </span>
        <span className={cn("text-sm font-semibold tabular-nums", TIER_TEXT[tier])}>
          {formatCurrency(pick.cost)}
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


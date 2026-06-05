import { useMemo } from "react";
import { useRecommendationStore } from "@/stores/recommendation";
import { useModelsStore } from "@/stores/models";
import { calculateCost, formatCurrency } from "@/lib/cost";
import type { RecommendationCategory } from "@/lib/types";
import { GlassCard } from "@/components/ui/GlassCard";
import { TierBadge } from "@/components/ui/TierBadge";
import { Check, X, Trophy } from "lucide-react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

const TIERS: RecommendationCategory[] = ["recommended", "budget", "premium"];
const TIER_COLOR: Record<RecommendationCategory, string> = {
  recommended: "#22d3ee",
  budget: "#34d399",
  premium: "#c084fc",
};

interface Scores {
  Cost: number;
  Quality: number;
  Accuracy: number;
  "Dev Speed": number;
  Architecture: number;
  Testing: number;
  Security: number;
  Documentation: number;
}

const SCORES: Record<RecommendationCategory, Scores> = {
  budget: {
    Cost: 95,
    Quality: 65,
    Accuracy: 68,
    "Dev Speed": 70,
    Architecture: 62,
    Testing: 68,
    Security: 70,
    Documentation: 70,
  },
  recommended: {
    Cost: 78,
    Quality: 88,
    Accuracy: 90,
    "Dev Speed": 85,
    Architecture: 86,
    Testing: 85,
    Security: 88,
    Documentation: 87,
  },
  premium: {
    Cost: 55,
    Quality: 97,
    Accuracy: 96,
    "Dev Speed": 92,
    Architecture: 96,
    Testing: 94,
    Security: 96,
    Documentation: 95,
  },
};

const PROS_CONS: Record<RecommendationCategory, { pros: string[]; cons: string[] }> = {
  budget: {
    pros: ["Lowest unit cost", "Fast iteration cycles", "Good for prototypes"],
    cons: ["Lower reasoning depth", "Less reliable on complex tasks"],
  },
  recommended: {
    pros: ["Balanced cost / quality", "Production-ready accuracy", "Broad ecosystem support"],
    cons: ["Higher cost than budget tier", "May require fine-tuning at scale"],
  },
  premium: {
    pros: ["Best-in-class reasoning", "Highest accuracy & safety", "Strongest on complex tasks"],
    cons: ["Significantly higher cost", "Lower throughput per dollar"],
  },
};

export function ComparePlansTab() {
  const rec = useRecommendationStore((s) => s.recommendation);
  const draft = useRecommendationStore((s) => s.draft);
  const models = useModelsStore((s) => s.models);

  const rows = useMemo(() => {
    if (!rec || !draft) return [];
    return TIERS.map((tier) => {
      const r = rec.single_model_recommendations.find((x) => x.category === tier);
      const pricing =
        rec.pricing_information.find((p) => p.model_id === r?.model_id)?.pricing ??
        models.find((m) => m.id === r?.model_id)?.pricing;
      const monthly = pricing
        ? calculateCost({ workload: draft, durationMonths: 1, pricing }).total_project_cost
        : 0;
      return {
        tier,
        modelName: models.find((m) => m.id === r?.model_id)?.name ?? r?.model_id ?? "—",
        provider: models.find((m) => m.id === r?.model_id)?.provider ?? "—",
        monthly,
        reason: r?.reason,
      };
    });
  }, [rec, draft, models]);

  const radarData = (Object.keys(SCORES.recommended) as (keyof Scores)[]).map((axis) => {
    const row: Record<string, number | string> = { axis };
    TIERS.forEach((t) => (row[t] = SCORES[t][axis]));
    return row;
  });

  if (!rec || !draft) return null;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {rows.map((r) => (
          <GlassCard
            key={r.tier}
            className={
              "p-5 " + (r.tier === "recommended" ? "ring-1 ring-cyan-400/30" : "")
            }
          >
            <div className="flex items-center justify-between">
              <TierBadge tier={r.tier} />
              <span className="text-[10px] text-muted-foreground">{r.provider}</span>
            </div>
            <div className="mt-3 text-base font-semibold">{r.modelName}</div>
            <div className="mt-1 text-sm text-muted-foreground">
              {formatCurrency(r.monthly)} / mo
            </div>

            <dl className="mt-4 space-y-1.5 text-xs">
              {(Object.keys(SCORES[r.tier]) as (keyof Scores)[]).map((k) => (
                <div key={k} className="flex items-center justify-between">
                  <dt className="text-muted-foreground">{k}</dt>
                  <dd className="flex items-center gap-2">
                    <div className="h-1 w-24 overflow-hidden rounded-full bg-white/[0.06]">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${SCORES[r.tier][k]}%`,
                          backgroundColor: TIER_COLOR[r.tier],
                        }}
                      />
                    </div>
                    <span className="tabular-nums w-7 text-right">{SCORES[r.tier][k]}</span>
                  </dd>
                </div>
              ))}
            </dl>

            <div className="mt-4 space-y-2 border-t border-white/[0.06] pt-3">
              {PROS_CONS[r.tier].pros.map((p) => (
                <div key={p} className="flex items-start gap-2 text-xs">
                  <Check className="mt-0.5 h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <span>{p}</span>
                </div>
              ))}
              {PROS_CONS[r.tier].cons.map((c) => (
                <div key={c} className="flex items-start gap-2 text-xs text-muted-foreground">
                  <X className="mt-0.5 h-3.5 w-3.5 text-rose-400 shrink-0" />
                  <span>{c}</span>
                </div>
              ))}
            </div>
          </GlassCard>
        ))}
      </div>

      <GlassCard className="p-5">
        <div className="mb-3 text-sm font-semibold">Capability Radar</div>
        <div className="h-80">
          <ResponsiveContainer>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.08)" />
              <PolarAngleAxis dataKey="axis" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
              <PolarRadiusAxis stroke="rgba(255,255,255,0.1)" tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} />
              {TIERS.map((t) => (
                <Radar
                  key={t}
                  name={capitalize(t)}
                  dataKey={t}
                  stroke={TIER_COLOR[t]}
                  fill={TIER_COLOR[t]}
                  fillOpacity={0.15}
                />
              ))}
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  background: "rgba(20,20,20,0.95)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 8,
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      <GlassCard className="border-cyan-400/20 bg-gradient-to-r from-cyan-500/5 via-blue-500/5 to-purple-500/5 p-5">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-400/10 ring-1 ring-cyan-400/30">
            <Trophy className="h-5 w-5 text-cyan-300" />
          </div>
          <div className="flex-1">
            <div className="text-xs uppercase tracking-widest text-cyan-300">
              Final Recommendation
            </div>
            <div className="mt-1 text-base font-semibold">
              Adopt the <span className="text-cyan-300">Recommended</span> toolchain for production use.
            </div>
            <p className="mt-1.5 text-sm text-muted-foreground">
              It delivers the best balance of cost, quality, and capability across all SDLC
              stages. Use Budget for prototyping and Premium for the most safety- or
              accuracy-critical workloads.
            </p>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

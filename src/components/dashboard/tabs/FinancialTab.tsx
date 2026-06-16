import { useMemo } from "react";
import { useRecommendationStore } from "@/stores/recommendation";
import { useModelsStore } from "@/stores/models";
import { calculateCost, formatCurrency } from "@/lib/cost";
import type { ModelPricing, RecommendationCategory } from "@/lib/types";
import { GlassCard } from "@/components/ui/GlassCard";
import { TierBadge } from "@/components/ui/TierBadge";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  ZAxis,
} from "recharts";

const TIERS: RecommendationCategory[] = ["recommended", "budget", "premium"];
const TIER_COLOR: Record<RecommendationCategory, string> = {
  recommended: "#22d3ee",
  budget: "#34d399",
  premium: "#c084fc",
};

interface TierFinance {
  tier: RecommendationCategory;
  modelName: string;
  pricing?: ModelPricing;
  monthly: number;
  annual: number;
  tco3y: number;
  roi: number;
}

export function FinancialTab() {
  const rec = useRecommendationStore((s) => s.recommendation);
  const draft = useRecommendationStore((s) => s.draft);
  const models = useModelsStore((s) => s.models);

  const finances: TierFinance[] = useMemo(() => {
    if (!rec || !draft) return [];
    return TIERS.map((tier) => {
      const r = rec.single_model_recommendations.find((x) => x.category === tier);
      const pricing =
        rec.pricing_information?.find((p) => p.model_id === r?.model_id)?.pricing ??
        models.find((m) => m.id === r?.model_id || m.id.endsWith(`/${r?.model_id ?? ""}`))?.pricing;
      const monthly = pricing
        ? calculateCost({ workload: draft, durationMonths: 1, pricing }).total_project_cost
        : 0;
      const annual = monthly * 12;
      const tco3y = annual * 3;
      // ROI: higher for budget (low cost), capped by quality penalty
      const roiBase = tier === "premium" ? 95 : tier === "recommended" ? 88 : 72;
      const costPenalty = Math.min(20, monthly / 5000);
      return {
        tier,
        modelName: models.find((m) => m.id === r?.model_id)?.name ?? r?.model_id ?? "—",
        pricing,
        monthly,
        annual,
        tco3y,
        roi: Math.max(0, Math.round(roiBase - costPenalty)),
      };
    });
  }, [rec, draft, models]);

  const projection = useMemo(() => {
    return Array.from({ length: 36 }, (_, i) => {
      const m = i + 1;
      const row: Record<string, number | string> = { month: `M${m}` };
      finances.forEach((f) => {
        row[f.tier] = Math.round(f.monthly * m);
      });
      return row;
    });
  }, [finances]);

  const monthlyBreakdown = finances.map((f) => ({
    name: capitalize(f.tier),
    "Model Licensing": Math.round(f.monthly * 0.55),
    Infrastructure: Math.round(f.monthly * 0.25),
    Operations: Math.round(f.monthly * 0.2),
  }));

  const roiScatter = finances.map((f) => ({
    name: f.modelName,
    tier: f.tier,
    cost: Math.round(f.monthly),
    roi: f.roi,
    size: 400,
  }));

  if (!rec || !draft) return null;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {finances.map((f) => (
          <GlassCard key={f.tier} className="p-5">
            <div className="flex items-center justify-between">
              <TierBadge tier={f.tier} />
              <span className="text-[10px] text-muted-foreground">3-Year TCO</span>
            </div>
            <div className="mt-3 truncate text-base font-semibold">{f.modelName}</div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <Kpi label="Monthly" value={formatCurrency(f.monthly)} />
              <Kpi label="Annual" value={formatCurrency(f.annual)} />
              <Kpi label="3-Year TCO" value={formatCurrency(f.tco3y)} accent />
              <Kpi label="ROI Score" value={`${f.roi}/100`} />
            </div>
          </GlassCard>
        ))}
      </div>

      <GlassCard className="p-5">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold">3-Year Cost Projection</div>
            <div className="text-xs text-muted-foreground">Cumulative spend by tier.</div>
          </div>
        </div>
        <div className="h-72">
          <ResponsiveContainer>
            <LineChart data={projection}>
              <CartesianGrid stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
              <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={11} />
              <YAxis
                stroke="var(--muted-foreground)"
                fontSize={11}
                tickFormatter={(v) => formatCurrency(v)}
              />
              <Tooltip
                contentStyle={{
                  background: "rgba(20,20,20,0.95)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 8,
                }}
                formatter={(v: number) => formatCurrency(v)}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              {TIERS.map((t) => (
                <Line
                  key={t}
                  type="monotone"
                  dataKey={t}
                  stroke={TIER_COLOR[t]}
                  strokeWidth={2}
                  dot={false}
                  name={capitalize(t)}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <GlassCard className="p-5">
          <div className="mb-3 text-sm font-semibold">Monthly Cost Breakdown</div>
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={monthlyBreakdown}>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
                <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={11} />
                <YAxis
                  stroke="var(--muted-foreground)"
                  fontSize={11}
                  tickFormatter={(v) => formatCurrency(v)}
                />
                <Tooltip
                  contentStyle={{
                    background: "rgba(20,20,20,0.95)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 8,
                  }}
                  formatter={(v: number) => formatCurrency(v)}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="Model Licensing" stackId="a" fill="#22d3ee" />
                <Bar dataKey="Infrastructure" stackId="a" fill="#34d399" />
                <Bar dataKey="Operations" stackId="a" fill="#c084fc" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard className="p-5">
          <div className="mb-3 text-sm font-semibold">ROI vs Cost</div>
          <div className="h-72">
            <ResponsiveContainer>
              <ScatterChart>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
                <XAxis
                  type="number"
                  dataKey="cost"
                  name="Monthly Cost"
                  stroke="var(--muted-foreground)"
                  fontSize={11}
                  tickFormatter={(v) => formatCurrency(v)}
                />
                <YAxis
                  type="number"
                  dataKey="roi"
                  name="ROI"
                  stroke="var(--muted-foreground)"
                  fontSize={11}
                  domain={[0, 100]}
                />
                <ZAxis type="number" dataKey="size" range={[200, 600]} />
                <Tooltip
                  contentStyle={{
                    background: "rgba(20,20,20,0.95)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 8,
                  }}
                  cursor={{ strokeDasharray: "3 3" }}
                />
                {roiScatter.map((d) => (
                  <Scatter
                    key={d.tier}
                    name={`${capitalize(d.tier)} — ${d.name}`}
                    data={[d]}
                    fill={TIER_COLOR[d.tier as RecommendationCategory]}
                  />
                ))}
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

function Kpi({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div
        className={
          "mt-1 text-base font-semibold tabular-nums " +
          (accent ? "bg-gradient-to-r from-cyan-300 to-purple-300 bg-clip-text text-transparent" : "")
        }
      >
        {value}
      </div>
    </div>
  );
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

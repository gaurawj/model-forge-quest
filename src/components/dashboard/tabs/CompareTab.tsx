import { useMemo } from "react";
import { useRecommendationStore } from "@/stores/recommendation";
import { useModelsStore } from "@/stores/models";
import { calculateCost, formatCurrency } from "@/lib/cost";
import type { RecommendationCategory } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const ORDER: RecommendationCategory[] = ["budget", "recommended", "premium"];

export function CompareTab() {
  const recommendation = useRecommendationStore((s) => s.recommendation);
  const draft = useRecommendationStore((s) => s.draft);
  const models = useModelsStore((s) => s.models);

  const rows = useMemo(() => {
    if (!recommendation || !draft) return [];
    return ORDER.map((category) => {
      const rec = recommendation.single_model_recommendations.find((r) => r.category === category);
      if (!rec) return null;
      const pricing =
        recommendation.pricing_information.find((p) => p.model_id === rec.model_id)?.pricing ??
        models.find((m) => m.id === rec.model_id)?.pricing;
      const catalog = models.find((m) => m.id === rec.model_id);
      const cost = pricing
        ? calculateCost({ workload: draft, durationMonths: draft.project_duration_months, pricing })
        : null;
      return { category, rec, pricing, catalog, cost };
    }).filter(Boolean) as Array<{
      category: RecommendationCategory;
      rec: NonNullable<ReturnType<typeof recommendation.single_model_recommendations.find>>;
      pricing: ReturnType<typeof models.find> extends infer M ? M extends { pricing?: infer P } ? P : never : never;
      catalog: ReturnType<typeof models.find>;
      cost: ReturnType<typeof calculateCost> | null;
    }>;
  }, [recommendation, draft, models]);

  if (!recommendation || !draft) return null;

  const chartData = rows.map((r) => ({
    name: r.catalog?.name ?? r.rec.model_id,
    category: r.category,
    Input: Math.round(r.cost?.input_cost ?? 0),
    Output: Math.round(r.cost?.output_cost ?? 0),
    Reasoning: Math.round(r.cost?.reasoning_cost ?? 0),
    Cache: Math.round(r.cost?.cache_cost ?? 0),
  }));

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-sm font-medium">Side-by-side comparison</h3>
        <p className="text-xs text-muted-foreground">
          Budget, recommended, and premium picks priced over {draft.project_duration_months} months.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {rows.map((r) => (
          <div
            key={r.category}
            className={`rounded-lg border bg-card p-5 ${
              r.category === "recommended" ? "border-primary/50 ring-1 ring-primary/20" : "border-border"
            }`}
          >
            <div className="flex items-center justify-between">
              <Badge variant={r.category === "recommended" ? "default" : "outline"} className="capitalize">
                {r.category}
              </Badge>
              <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                {r.catalog?.provider ?? "—"}
              </span>
            </div>
            <div className="mt-3 text-base font-semibold">{r.catalog?.name ?? r.rec.model_id}</div>
            <div className="text-[11px] text-muted-foreground">{r.rec.model_id}</div>

            <dl className="mt-4 space-y-2 text-xs">
              <Row label="Project cost" value={r.cost ? formatCurrency(r.cost.total_project_cost) : "—"} strong />
              <Row label="Monthly" value={r.cost ? formatCurrency(r.cost.monthly_cost) : "—"} />
              <Row label="Per user" value={r.cost ? formatCurrency(r.cost.cost_per_user) : "—"} />
              <Row
                label="Per request"
                value={r.cost ? `$${r.cost.cost_per_request.toFixed(5)}` : "—"}
              />
              <Row
                label="Input $/1M"
                value={r.pricing?.prompt != null ? `$${r.pricing.prompt.toFixed(2)}` : "—"}
              />
              <Row
                label="Output $/1M"
                value={r.pricing?.completion != null ? `$${r.pricing.completion.toFixed(2)}` : "—"}
              />
              <Row
                label="Context"
                value={r.catalog?.context_window ? r.catalog.context_window.toLocaleString() : "—"}
              />
            </dl>

            {r.rec.reason && (
              <p className="mt-4 border-t border-border pt-3 text-xs text-muted-foreground">
                {r.rec.reason}
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="mb-3 text-sm font-medium">Cost composition by model</div>
        <div className="h-72">
          <ResponsiveContainer>
            <BarChart data={chartData}>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
              <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={11} />
              <YAxis stroke="var(--muted-foreground)" fontSize={11} tickFormatter={(v) => formatCurrency(v)} />
              <Tooltip
                contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 6 }}
                formatter={(v: number) => formatCurrency(v)}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="Input" stackId="a" fill="var(--chart-1)" />
              <Bar dataKey="Output" stackId="a" fill="var(--chart-2)" />
              <Bar dataKey="Reasoning" stackId="a" fill="var(--chart-3)" />
              <Bar dataKey="Cache" stackId="a" fill="var(--chart-4)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={`tabular-nums ${strong ? "text-sm font-semibold" : ""}`}>{value}</dd>
    </div>
  );
}

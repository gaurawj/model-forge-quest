import { useMemo } from "react";
import { useRecommendationStore } from "@/stores/recommendation";
import { useModelsStore } from "@/stores/models";
import { calculateCost, formatCurrency, formatNumber } from "@/lib/cost";
import type { ModelPricing, RecommendationCategory } from "@/lib/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";

const CHART_COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)"];

export function FinanceTab() {
  const store = useRecommendationStore();
  const { recommendation, draft, selectedCategory, setSelectedCategory } = store;
  const models = useModelsStore((s) => s.models);

  const pricing: ModelPricing | undefined = useMemo(() => {
    if (!recommendation) return undefined;
    const rec = recommendation.single_model_recommendations.find((r) => r.category === selectedCategory);
    if (!rec) return undefined;
    const p = recommendation.pricing_information.find((pi) => pi.model_id === rec.model_id);
    return p?.pricing ?? models.find((m) => m.id === rec.model_id)?.pricing;
  }, [recommendation, selectedCategory, models]);

  const breakdown = useMemo(() => {
    if (!draft || !pricing) return null;
    return calculateCost({
      workload: draft,
      durationMonths: draft.project_duration_months,
      pricing,
    });
  }, [draft, pricing]);

  const trend = useMemo(() => {
    if (!draft || !pricing) return [];
    const months = Math.max(1, draft.project_duration_months);
    return Array.from({ length: months }, (_, i) => {
      const m = i + 1;
      const c = calculateCost({ workload: draft, durationMonths: m, pricing });
      return { month: `M${m}`, cost: Math.round(c.total_project_cost) };
    });
  }, [draft, pricing]);

  if (!recommendation || !draft) return null;
  if (!pricing) {
    return (
      <div className="rounded-lg border border-border bg-card p-6 text-sm text-muted-foreground">
        No pricing information available for the selected model.
      </div>
    );
  }
  if (!breakdown) return null;

  const breakdownData = [
    { name: "Input", value: Math.round(breakdown.input_cost) },
    { name: "Output", value: Math.round(breakdown.output_cost) },
    { name: "Reasoning", value: Math.round(breakdown.reasoning_cost) },
    { name: "Cache", value: Math.round(breakdown.cache_cost) },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-medium">Project cost estimation</h3>
          <p className="text-xs text-muted-foreground">
            Calculated over {draft.project_duration_months} months of usage.
          </p>
        </div>
        <Select value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as RecommendationCategory)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recommended">Recommended model</SelectItem>
            <SelectItem value="budget">Budget model</SelectItem>
            <SelectItem value="premium">Premium model</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi label="Project cost" value={formatCurrency(breakdown.total_project_cost)} />
        <Kpi label="Monthly cost" value={formatCurrency(breakdown.monthly_cost)} />
        <Kpi label="Cost / user" value={formatCurrency(breakdown.cost_per_user)} />
        <Kpi label="Cost / request" value={`$${breakdown.cost_per_request.toFixed(5)}`} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="mb-3 text-sm font-medium">Cost breakdown</div>
          <div className="h-64">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={breakdownData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={90}
                  paddingAngle={2}
                >
                  {breakdownData.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} stroke="var(--background)" />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 6 }}
                  formatter={(v: number) => formatCurrency(v)}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-4">
          <div className="mb-3 text-sm font-medium">Cost over project duration</div>
          <div className="h-64">
            <ResponsiveContainer>
              <LineChart data={trend}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
                <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={11} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} tickFormatter={(v) => formatCurrency(v)} />
                <Tooltip
                  contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 6 }}
                  formatter={(v: number) => formatCurrency(v)}
                />
                <Line type="monotone" dataKey="cost" stroke="var(--chart-1)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi label="Total requests" value={formatNumber(breakdown.total_requests)} />
        <Kpi label="Input tokens" value={formatNumber(breakdown.input_tokens)} />
        <Kpi label="Output tokens" value={formatNumber(breakdown.output_tokens)} />
        <Kpi label="Reasoning tokens" value={formatNumber(breakdown.reasoning_tokens)} />
      </div>
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-1.5 text-lg font-semibold tabular-nums">{value}</div>
    </div>
  );
}

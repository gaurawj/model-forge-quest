import { useMemo } from "react";
import { useRecommendationStore } from "@/stores/recommendation";
import { useModelsStore } from "@/stores/models";
import { calculateCost, formatCurrency } from "@/lib/cost";
import type { Model, ModelPricing, RecommendationCategory } from "@/lib/types";
import { Brain, Wallet, Crown, CalendarDays, DollarSign, Gauge } from "lucide-react";

function resolveModel(
  category: RecommendationCategory,
  store: ReturnType<typeof useRecommendationStore.getState>,
  models: Model[],
): { id?: string; name?: string; pricing?: ModelPricing } {
  const rec = store.recommendation?.single_model_recommendations.find((r) => r.category === category);
  if (!rec) return {};
  const pricingEntry = store.recommendation?.pricing_information.find((p) => p.model_id === rec.model_id);
  const catalogModel = models.find((m) => m.id === rec.model_id);
  return {
    id: rec.model_id,
    name: catalogModel?.name ?? rec.model_id,
    pricing: pricingEntry?.pricing ?? catalogModel?.pricing,
  };
}

export function SummaryBar() {
  const store = useRecommendationStore();
  const models = useModelsStore((s) => s.models);
  const { recommendation, draft } = store;

  const recommended = resolveModel("recommended", store, models);
  const budget = resolveModel("budget", store, models);
  const premium = resolveModel("premium", store, models);

  const projectCost = useMemo(() => {
    if (!draft || !recommended.pricing) return 0;
    return calculateCost({
      workload: draft,
      durationMonths: draft.project_duration_months,
      pricing: recommended.pricing,
    }).total_project_cost;
  }, [draft, recommended.pricing]);

  if (!recommendation || !draft) return null;

  const cards = [
    { icon: Brain, label: "Recommended", value: recommended.name ?? "—", accent: "text-primary" },
    { icon: Wallet, label: "Budget", value: budget.name ?? "—", accent: "text-chart-2" },
    { icon: Crown, label: "Premium", value: premium.name ?? "—", accent: "text-chart-4" },
    { icon: CalendarDays, label: "Duration", value: `${draft.project_duration_months} mo` },
    { icon: DollarSign, label: "Est. project cost", value: formatCurrency(projectCost), accent: "text-foreground" },
    { icon: Gauge, label: "Confidence", value: `${Math.round((recommendation.confidence ?? 0) * 100)}%` },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
      {cards.map((c) => (
        <div key={c.label} className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
            <c.icon className="h-3.5 w-3.5" />
            {c.label}
          </div>
          <div className={`mt-2 truncate text-base font-semibold tabular-nums ${c.accent ?? ""}`}>
            {c.value}
          </div>
        </div>
      ))}
    </div>
  );
}

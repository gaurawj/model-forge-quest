import { useRecommendationStore } from "@/stores/recommendation";
import { useModelsStore } from "@/stores/models";
import { useModelConfigStore } from "@/stores/modelConfig";
import { calculateCost } from "@/lib/cost";
import { SDLC_STAGES, type SdlcStage } from "@/lib/sdlcStages";
import type {
  ArchitectureRole,
  Model,
  ModelPricing,
  RecommendationCategory,
  WorkloadProfile,
} from "@/lib/types";
import { useMemo } from "react";

export interface StagePick {
  modelId?: string;
  modelName: string;
  pricing?: ModelPricing;
  provider?: string;
  contextWindow?: number;
  inputTokens: number;
  outputTokens: number;
  cachedTokens: number;
  totalRequests: number;
  durationMonths: number;
  cost: number;
  confidence: number;
}

export interface StageRow {
  stage: SdlcStage;
  matchedRole?: ArchitectureRole;
  picks: Record<RecommendationCategory, StagePick>;
}

function pickRoleForStage(
  stage: SdlcStage,
  roles: ArchitectureRole[],
  usedIndices: Set<number>,
): { role?: ArchitectureRole; index: number } {
  // Best fuzzy match by keyword inclusion
  let best = -1;
  let bestScore = 0;
  roles.forEach((r, i) => {
    if (usedIndices.has(i)) return;
    const name = (r.role ?? "").toLowerCase();
    const score = stage.roleKeywords.reduce(
      (acc, k) => acc + (name.includes(k) ? 1 : 0),
      0,
    );
    if (score > bestScore) {
      bestScore = score;
      best = i;
    }
  });
  if (best >= 0) {
    usedIndices.add(best);
    return { role: roles[best], index: best };
  }
  return { role: undefined, index: -1 };
}

function buildPick(
  modelId: string | undefined,
  models: Model[],
  pricingInfo: { model_id: string; pricing: ModelPricing }[],
  workload: WorkloadProfile,
  durationMonths: number,
  stagesCount: number,
  baseConfidence: number,
): StagePick {
  const catalog = models.find((m) => m.id === modelId);
  const pricing =
    pricingInfo.find((p) => p.model_id === modelId)?.pricing ?? catalog?.pricing;
  if (!modelId) {
    return {
      modelName: "—",
      inputTokens: 0,
      outputTokens: 0,
      cost: 0,
      confidence: 0,
    };
  }
  // Distribute the workload evenly across SDLC stages for per-stage cost
  const stageWorkload: WorkloadProfile = {
    ...workload,
    requests_per_user_per_day: workload.requests_per_user_per_day / stagesCount,
  };
  const cost = pricing
    ? calculateCost({ workload: stageWorkload, durationMonths, pricing }).total_project_cost
    : 0;
  const requests =
    stageWorkload.active_users * stageWorkload.requests_per_user_per_day * 30 * durationMonths;
  return {
    modelId,
    modelName: catalog?.name ?? modelId,
    pricing,
    provider: catalog?.provider,
    contextWindow: catalog?.context_window,
    inputTokens: requests * (workload.avg_input_tokens ?? 0),
    outputTokens: requests * (workload.avg_output_tokens ?? 0),
    cost,
    confidence: baseConfidence,
  };
}

export function useSdlcRows(): StageRow[] {
  const rec = useRecommendationStore((s) => s.recommendation);
  const draft = useRecommendationStore((s) => s.draft);
  const models = useModelsStore((s) => s.models);

  return useMemo(() => {
    if (!rec || !draft) return [];
    const roles = rec.architecture?.roles ?? [];
    const used = new Set<number>();
    const fallback = (cat: RecommendationCategory) =>
      rec.single_model_recommendations.find((r) => r.category === cat)?.model_id;
    const fallbacks: Record<RecommendationCategory, string | undefined> = {
      recommended: fallback("recommended"),
      budget: fallback("budget"),
      premium: fallback("premium"),
    };

    return SDLC_STAGES.map((stage) => {
      const { role } = pickRoleForStage(stage, roles, used);
      const picks: Record<RecommendationCategory, StagePick> = {
        recommended: buildPick(
          role?.recommended_model_id ?? fallbacks.recommended,
          models,
          rec.pricing_information,
          draft,
          draft.project_duration_months,
          SDLC_STAGES.length,
          rec.confidence ?? 0.85,
        ),
        budget: buildPick(
          role?.budget_model_id ?? fallbacks.budget,
          models,
          rec.pricing_information,
          draft,
          draft.project_duration_months,
          SDLC_STAGES.length,
          (rec.confidence ?? 0.85) * 0.9,
        ),
        premium: buildPick(
          role?.premium_model_id ?? fallbacks.premium,
          models,
          rec.pricing_information,
          draft,
          draft.project_duration_months,
          SDLC_STAGES.length,
          Math.min(1, (rec.confidence ?? 0.85) * 1.05),
        ),
      };
      return { stage, matchedRole: role, picks };
    });
  }, [rec, draft, models]);
}

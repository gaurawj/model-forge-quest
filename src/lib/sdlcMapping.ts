import { useRecommendationStore } from "@/stores/recommendation";
import { useModelsStore } from "@/stores/models";
import { useModelConfigStore } from "@/stores/modelConfig";
import { calculateCost } from "@/lib/cost";
import { SDLC_STAGES, type SdlcStage } from "@/lib/sdlcStages";
import {
  confidenceScalar,
  type Model,
  type ModelPricing,
  type PricingInformation,
  type RecommendationCategory,
  type StageRecommendation,
  type WorkloadProfile,
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
  why?: string;
}

export interface StageRow {
  stage: SdlcStage;
  stageRec?: StageRecommendation;
  picks: Record<RecommendationCategory, StagePick>;
}

/** Match an API model_id (e.g. "gemini-35-flash") against catalog Model.id ("provider/x"). */
function findModel(models: Model[], modelId?: string): Model | undefined {
  if (!modelId) return undefined;
  return (
    models.find((m) => m.id === modelId) ??
    models.find((m) => m.id.endsWith(`/${modelId}`)) ??
    models.find((m) => m.id.split("/").pop() === modelId)
  );
}

function buildPick(
  modelId: string | undefined,
  models: Model[],
  pricingInfo: PricingInformation[] | undefined,
  workload: WorkloadProfile,
  durationMonths: number,
  stagesCount: number,
  baseConfidence: number,
  why?: string,
): StagePick {
  const catalog = findModel(models, modelId);
  const pricing =
    pricingInfo?.find((p) => p.model_id === modelId)?.pricing ?? catalog?.pricing;
  if (!modelId) {
    return {
      modelName: "—",
      inputTokens: 0,
      outputTokens: 0,
      cachedTokens: 0,
      totalRequests: 0,
      durationMonths,
      cost: 0,
      confidence: 0,
    };
  }
  const stageWorkload: WorkloadProfile = {
    ...workload,
    requests_per_user_per_day: workload.requests_per_user_per_day / stagesCount,
    avg_cached_tokens: workload.cache_eligible ? workload.avg_cached_tokens : 0,
  };
  const breakdown = pricing
    ? calculateCost({ workload: stageWorkload, durationMonths, pricing })
    : null;
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
    cachedTokens: requests * (stageWorkload.avg_cached_tokens ?? 0),
    totalRequests: requests,
    durationMonths,
    cost: breakdown?.total_project_cost ?? 0,
    confidence: baseConfidence,
    why,
  };
}

function findStageRec(
  stage: SdlcStage,
  list: StageRecommendation[] | undefined,
): StageRecommendation | undefined {
  if (!list) return undefined;
  const target = stage.name.toLowerCase();
  return list.find((s) => (s.stage_name ?? "").toLowerCase() === target);
}

export function useSdlcRows(): StageRow[] {
  const rec = useRecommendationStore((s) => s.recommendation);
  const draft = useRecommendationStore((s) => s.draft);
  const models = useModelsStore((s) => s.models);
  const mc = useModelConfigStore();

  return useMemo(() => {
    if (!rec || !draft) return [];

    const workload: WorkloadProfile = {
      ...draft,
      active_users: mc.active_users,
      requests_per_user_per_day: mc.requests_per_user_per_day,
      avg_input_tokens: mc.avg_input_tokens,
      avg_output_tokens: mc.avg_output_tokens,
      avg_reasoning_tokens: mc.avg_reasoning_tokens,
      avg_cached_tokens: mc.avg_cached_tokens,
      cache_eligible: mc.cache_eligible,
      project_duration_months: mc.project_duration_months,
    };
    const duration = mc.project_duration_months || 1;
    const baseConfidence = confidenceScalar(rec.confidence);

    const fallback = (cat: RecommendationCategory) =>
      rec.single_model_recommendations.find((r) => r.category === cat)?.model_id;
    const fallbacks: Record<RecommendationCategory, string | undefined> = {
      recommended: fallback("recommended"),
      budget: fallback("budget"),
      premium: fallback("premium"),
    };

    return SDLC_STAGES.map((stage) => {
      const stageRec = findStageRec(stage, rec.stage_recommendations);
      const m = stageRec?.models;
      const picks: Record<RecommendationCategory, StagePick> = {
        recommended: buildPick(
          m?.recommended_model_id ?? fallbacks.recommended,
          models,
          rec.pricing_information,
          workload,
          duration,
          SDLC_STAGES.length,
          baseConfidence,
          m?.recommended_why,
        ),
        budget: buildPick(
          m?.budget_model_id ?? fallbacks.budget,
          models,
          rec.pricing_information,
          workload,
          duration,
          SDLC_STAGES.length,
          baseConfidence * 0.9,
          m?.budget_why,
        ),
        premium: buildPick(
          m?.premium_model_id ?? fallbacks.premium,
          models,
          rec.pricing_information,
          workload,
          duration,
          SDLC_STAGES.length,
          Math.min(1, baseConfidence * 1.05),
          m?.premium_why,
        ),
      };
      return { stage, stageRec, picks };
    });
  }, [rec, draft, models, mc]);
}

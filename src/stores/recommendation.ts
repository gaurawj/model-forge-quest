import { create } from "zustand";
import type { RecommendationOutput, WorkloadProfile } from "../lib/types";
import { useModelConfigStore } from "@/stores/modelConfig";

export interface WorkloadDraft extends WorkloadProfile {
  project_duration_months: number;
}

interface RecommendationState {
  recommendation: RecommendationOutput | null;
  draft: WorkloadDraft | null;
  selectedCategory: "recommended" | "budget" | "premium";
  setRecommendation: (r: RecommendationOutput) => void;
  updateDraft: (patch: Partial<WorkloadDraft>) => void;
  setSelectedCategory: (c: "recommended" | "budget" | "premium") => void;
  reset: () => void;
}

function draftFromRecommendation(r: RecommendationOutput): WorkloadDraft {
  const wp = r.workload_profile;
  return {
    active_users: wp.active_users ?? 0,
    requests_per_user_per_day: wp.requests_per_user_per_day ?? 0,
    avg_input_tokens: wp.avg_input_tokens ?? 0,
    avg_output_tokens: wp.avg_output_tokens ?? 0,
    avg_reasoning_tokens: wp.avg_reasoning_tokens ?? 0,
    avg_cached_tokens: wp.avg_cached_tokens ?? 0,
    cache_eligible: wp.cache_eligible ?? false,
    batch_eligible: wp.batch_eligible ?? false,
    min_context_window: wp.min_context_window,
    recommended_context_window: wp.recommended_context_window,
    complexity: wp.complexity,
    latency_requirement: wp.latency_requirement,
    project_duration_months:
      wp.project_duration_months ??
      (r.questionnaire_summary?.project_duration_months as number | undefined) ??
      6,
  };
}

export const useRecommendationStore = create<RecommendationState>((set) => ({
  recommendation: null,
  draft: null,
  selectedCategory: "recommended",
  setRecommendation: (r) => {
    const draft = draftFromRecommendation(r);
    // Auto-populate Model Configuration controllers from recommendation
    useModelConfigStore.getState().hydrate({
      project_duration_months: draft.project_duration_months,
      active_users: draft.active_users,
      requests_per_user_per_day: draft.requests_per_user_per_day,
      avg_input_tokens: draft.avg_input_tokens,
      avg_output_tokens: draft.avg_output_tokens,
      avg_reasoning_tokens: draft.avg_reasoning_tokens,
      avg_cached_tokens: draft.avg_cached_tokens,
      cache_eligible: draft.cache_eligible,
    });
    set({ recommendation: r, draft, selectedCategory: "recommended" });
  },
  updateDraft: (patch) =>
    set((s) => (s.draft ? { draft: { ...s.draft, ...patch } } : s)),
  setSelectedCategory: (selectedCategory) => set({ selectedCategory }),
  reset: () => set({ recommendation: null, draft: null, selectedCategory: "recommended" }),
}));

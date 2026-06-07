import { create } from "zustand";

export interface ModelConfig {
  project_duration_months: number;
  active_users: number;
  requests_per_user_per_day: number;
  avg_input_tokens: number;
  avg_output_tokens: number;
  avg_reasoning_tokens: number;
  avg_cached_tokens: number;
  cache_eligible: boolean;
}

interface State extends ModelConfig {
  update: (patch: Partial<ModelConfig>) => void;
  hydrate: (patch: Partial<ModelConfig>) => void;
}

export const useModelConfigStore = create<State>((set) => ({
  project_duration_months: 6,
  active_users: 1000,
  requests_per_user_per_day: 5,
  avg_input_tokens: 2000,
  avg_output_tokens: 800,
  avg_reasoning_tokens: 0,
  avg_cached_tokens: 0,
  cache_eligible: false,
  update: (patch) => set((s) => ({ ...s, ...patch })),
  hydrate: (patch) =>
    set((s) => {
      const next: Partial<ModelConfig> = {};
      (Object.keys(patch) as (keyof ModelConfig)[]).forEach((k) => {
        const v = patch[k];
        if (v !== undefined && v !== null) (next as Record<string, unknown>)[k] = v;
      });
      return { ...s, ...next };
    }),
}));

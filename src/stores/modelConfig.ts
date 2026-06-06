import { create } from "zustand";

export type FallbackBehavior = "fail-fast" | "next-tier" | "cheapest-available";

export interface ModelConfig {
  temperature: number; // 0-2
  topP: number; // 0-1
  maxOutputTokens: number; // 256-32768
  reasoningEffort: "low" | "medium" | "high";
  cacheEnabled: boolean;
  batchEnabled: boolean;
  streamResponses: boolean;
  costCeilingPer1k: number; // USD per 1k tokens
  latencyTarget: "realtime" | "interactive" | "batch";
  fallback: FallbackBehavior;
}

interface State extends ModelConfig {
  update: (patch: Partial<ModelConfig>) => void;
}

export const useModelConfigStore = create<State>((set) => ({
  temperature: 0.3,
  topP: 0.9,
  maxOutputTokens: 4096,
  reasoningEffort: "medium",
  cacheEnabled: true,
  batchEnabled: false,
  streamResponses: true,
  costCeilingPer1k: 0.05,
  latencyTarget: "interactive",
  fallback: "next-tier",
  update: (patch) => set((s) => ({ ...s, ...patch })),
}));

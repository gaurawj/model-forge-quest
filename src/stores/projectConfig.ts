import { create } from "zustand";

export type ModelStrategy =
  | "best-per-stage"
  | "claude-only"
  | "gpt-only"
  | "gemini-only"
  | "self-hosted";

export interface ProjectConfig {
  useCase: string;
  complexity: number; // 1-10
  codebaseSize: number; // 1-10
  durationMonths: number; // 1-36
  description: string;
  compliance: {
    soc2: boolean;
    hipaa: boolean;
    onPremise: boolean;
    zeroDataRetention: boolean;
  };
  strategy: ModelStrategy;
}

interface State extends ProjectConfig {
  update: (patch: Partial<ProjectConfig>) => void;
  setCompliance: (key: keyof ProjectConfig["compliance"], v: boolean) => void;
}

export const USE_CASES = [
  { value: "legacy-migration", label: "Legacy modernization / migration" },
  { value: "greenfield", label: "Greenfield product build" },
  { value: "ai-augmentation", label: "AI augmentation of existing app" },
  { value: "data-platform", label: "Data / analytics platform" },
  { value: "internal-tooling", label: "Internal developer tooling" },
];

export const useProjectConfigStore = create<State>((set) => ({
  useCase: "legacy-migration",
  complexity: 6,
  codebaseSize: 5,
  durationMonths: 6,
  description: "",
  compliance: {
    soc2: false,
    hipaa: false,
    onPremise: false,
    zeroDataRetention: false,
  },
  strategy: "best-per-stage",
  update: (patch) => set((s) => ({ ...s, ...patch })),
  setCompliance: (key, v) =>
    set((s) => ({ compliance: { ...s.compliance, [key]: v } })),
}));

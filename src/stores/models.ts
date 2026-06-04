import { create } from "zustand";
import type { Model } from "../lib/types";

interface ModelsState {
  models: Model[];
  loaded: boolean;
  setModels: (m: Model[]) => void;
}

export const useModelsStore = create<ModelsState>((set) => ({
  models: [],
  loaded: false,
  setModels: (models) => set({ models, loaded: true }),
}));

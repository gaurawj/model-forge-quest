import type { Questionnaire, Model, RecommendationOutput, Answers } from "./types";
import { useApiConfigStore } from "../stores/apiConfig";

function getBase(): string {
  try {
    return useApiConfigStore.getState().baseUrl;
  } catch {
    return (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "http://localhost:8000";
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const base = getBase();
  try {
    const res = await fetch(`${base}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers ?? {}),
      },
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      const msg = `${res.status} ${res.statusText}: ${text}`;
      useApiConfigStore.getState().setStatus("error", msg);
      throw new Error(msg);
    }
    useApiConfigStore.getState().setStatus("connected", `Connected to ${base}`);
    return (await res.json()) as T;
  } catch (e) {
    const msg = (e as Error)?.message ?? "Network error";
    if (useApiConfigStore.getState().status !== "error") {
      useApiConfigStore.getState().setStatus("error", msg);
    }
    throw e;
  }
}

export const api = {
  getQuestionnaire: () => request<Questionnaire>("/api/v1/questionnaire"),
  getModels: () => request<Model[]>("/api/v1/models"),
  postRecommend: (answers: Answers) =>
    request<RecommendationOutput>("/api/v1/recommend", {
      method: "POST",
      body: JSON.stringify({ answers }),
    }),
};

export { getBase as getApiBaseUrl };

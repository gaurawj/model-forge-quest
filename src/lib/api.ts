import type { Questionnaire, Model, RecommendationOutput, Answers } from "./types";

const BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "http://localhost:8000";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`${res.status} ${res.statusText}: ${text}`);
  }
  return (await res.json()) as T;
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

export const API_BASE_URL = BASE;

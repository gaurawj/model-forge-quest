import type { Questionnaire, Model, RecommendationOutput, Answers } from "./types";
import { useApiConfigStore } from "../stores/apiConfig";

type RawRecord = Record<string, unknown>;

function isRecord(value: unknown): value is RawRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asString(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function slug(value: string, fallback: string) {
  const s = value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return s || fallback;
}

function asDescription(value: unknown): string | undefined {
  if (typeof value === "string" && value.trim()) return value;
  if (Array.isArray(value)) {
    const parts = value.filter((v): v is string => typeof v === "string" && v.trim().length > 0);
    if (parts.length) return parts.join(" • ");
  }
  return undefined;
}

function unwrapPayload(raw: unknown, preferredKey?: string): unknown {
  if (!isRecord(raw)) return raw;
  if (preferredKey && raw[preferredKey] != null) return raw[preferredKey];
  if (raw.data != null) return raw.data;
  if (raw.result != null) return raw.result;
  if (raw.payload != null) return raw.payload;
  return raw;
}

function normalizeQuestionnaire(raw: unknown): Questionnaire {
  const payload = unwrapPayload(raw, "questionnaire");
  const rawSections = Array.isArray(payload)
    ? payload
    : isRecord(payload) && Array.isArray(payload.sections)
    ? payload.sections
    : [];

  return {
    sections: rawSections.map((sectionRaw, sectionIndex) => {
      const section = isRecord(sectionRaw) ? sectionRaw : {};
      const title = asString(
        section.title ?? section.name ?? section.section,
        `Section ${sectionIndex + 1}`,
      );
      const questionsRaw = Array.isArray(section.questions)
        ? section.questions
        : Array.isArray(section.items)
        ? section.items
        : [];

      return {
        id: asString(section.id ?? section.section_id ?? section.key, slug(title, `section-${sectionIndex + 1}`)),
        title,
        description: asDescription(section.description),
        questions: questionsRaw.map((questionRaw, questionIndex) => {
          const question = isRecord(questionRaw) ? questionRaw : {};
          const label = asString(
            question.label ?? question.question ?? question.text ?? question.title,
            `Question ${questionIndex + 1}`,
          );
          const rawOptions = Array.isArray(question.options) ? question.options : [];
          const type = asString(question.type ?? question.input_type ?? question.kind, "descriptive");
          const normalizedType = type === "radio" || type === "select" ? "single_choice" : type === "checkbox" ? "multi_choice" : type;

          return {
            id: asString(
              question.id ?? question.question_id ?? question.key,
              `${slug(title, `section-${sectionIndex + 1}`)}-${slug(label, `q-${questionIndex + 1}`)}`,
            ),
            type: ["single_choice", "multi_choice", "descriptive"].includes(normalizedType)
              ? (normalizedType as "single_choice" | "multi_choice" | "descriptive")
              : "descriptive",
            label,
            description: asDescription(question.description),
            required: Boolean(question.required),
            placeholder: typeof question.placeholder === "string" ? question.placeholder : undefined,
            options: rawOptions.map((optionRaw, optionIndex) => {
              if (typeof optionRaw === "string") return { value: optionRaw, label: optionRaw };
              const option = isRecord(optionRaw) ? optionRaw : {};
              const optionLabel = asString(option.label ?? option.name ?? option.text ?? option.value, `Option ${optionIndex + 1}`);
              return {
                value: asString(option.value ?? option.id ?? option.key ?? optionLabel, optionLabel),
                label: optionLabel,
              };
            }),
          };
        }),
      };
    }),
  };
}

function toNum(v: unknown): number | undefined {
  if (v == null) return undefined;
  const n = typeof v === "string" ? parseFloat(v) : typeof v === "number" ? v : NaN;
  return Number.isFinite(n) ? n : undefined;
}

function normalizeModels(raw: unknown): Model[] {
  const payload = unwrapPayload(raw, "models");
  const arr = Array.isArray(payload) ? payload : [];
  return arr.map((r): Model => {
    const m = isRecord(r) ? r : {};
    const arch = isRecord(m.architecture) ? m.architecture : {};
    const inputMods = Array.isArray(arch.input_modalities) ? (arch.input_modalities as string[]) : [];
    const supported = Array.isArray(m.supported_parameters) ? (m.supported_parameters as string[]) : [];
    const pricingRaw = isRecord(m.pricing) ? m.pricing : {};
    const promptPer1M = toNum(pricingRaw.prompt);
    const completionPer1M = toNum(pricingRaw.completion);
    const cacheReadPer1M = toNum(pricingRaw.input_cache_read);

    const provider = asString(m.provider, "");
    const modelId = asString(m.model_id ?? m.id, asString(m.name, "unknown"));
    const id = provider ? `${provider}/${modelId}` : modelId;

    return {
      id,
      name: asString(m.name, modelId),
      provider,
      context_window: toNum(m.context_length ?? m.context_window),
      capabilities: inputMods,
      description: typeof m.description === "string" ? m.description : undefined,
      supports_vision: inputMods.includes("image"),
      supports_tool_calling: supported.includes("tools") || supported.includes("tool_choice"),
      supports_reasoning: supported.includes("reasoning") || supported.includes("include_reasoning"),
      pricing: {
        prompt: promptPer1M != null ? promptPer1M * 1_000_000 : 0,
        completion: completionPer1M != null ? completionPer1M * 1_000_000 : 0,
        input_cache_read: cacheReadPer1M != null ? cacheReadPer1M * 1_000_000 : undefined,
      },
    };
  });
}

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
  getQuestionnaire: async () => normalizeQuestionnaire(await request<unknown>("/api/v1/questionnaire")),
  getModels: async () => normalizeModels(await request<unknown>("/api/v1/models")),
  postRecommend: (answers: Answers) =>
    request<RecommendationOutput>("/api/v1/recommend", {
      method: "POST",
      body: JSON.stringify({ answers }),
    }),
};

export { getBase as getApiBaseUrl };

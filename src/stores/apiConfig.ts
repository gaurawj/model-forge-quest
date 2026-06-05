import { create } from "zustand";
import { detectMixedContent } from "@/lib/mixedContent";

export type ConnectionStatus = "idle" | "connecting" | "connected" | "error";

const DEFAULT_BASE =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "http://localhost:8000";

const LS_KEY = "ai-recommender:apiBaseUrl";

function loadInitial(): string {
  if (typeof window === "undefined") return DEFAULT_BASE;
  try {
    return window.localStorage.getItem(LS_KEY) ?? DEFAULT_BASE;
  } catch {
    return DEFAULT_BASE;
  }
}

interface ApiConfigState {
  baseUrl: string;
  status: ConnectionStatus;
  message: string | null;
  lastCheckedAt: number | null;
  mixedContentBlocked: boolean;
  mixedContentReason: string | null;
  setBaseUrl: (url: string) => void;
  setStatus: (s: ConnectionStatus, message?: string | null) => void;
  testConnection: () => Promise<boolean>;
}

export const useApiConfigStore = create<ApiConfigState>((set, get) => ({
  baseUrl: loadInitial(),
  status: "idle",
  message: null,
  lastCheckedAt: null,
  mixedContentBlocked: false,
  mixedContentReason: null,
  setBaseUrl: (url) => {
    const clean = url.trim().replace(/\/+$/, "");
    try {
      if (typeof window !== "undefined") window.localStorage.setItem(LS_KEY, clean);
    } catch {
      /* ignore */
    }
    const mc = detectMixedContent(clean);
    set({
      baseUrl: clean,
      status: "idle",
      message: null,
      mixedContentBlocked: mc.blocked,
      mixedContentReason: mc.reason ?? null,
    });
  },
  setStatus: (status, message = null) =>
    set({ status, message, lastCheckedAt: Date.now() }),
  testConnection: async () => {
    const { baseUrl } = get();
    const mc = detectMixedContent(baseUrl);
    if (mc.blocked) {
      set({
        status: "error",
        message: mc.reason ?? "Mixed content blocked by browser",
        mixedContentBlocked: true,
        mixedContentReason: mc.reason ?? null,
        lastCheckedAt: Date.now(),
      });
      return false;
    }
    set({ status: "connecting", message: null, mixedContentBlocked: false, mixedContentReason: null });
    try {
      const controller = new AbortController();
      const t = setTimeout(() => controller.abort(), 8000);
      const res = await fetch(`${baseUrl}/api/v1/questionnaire`, {
        signal: controller.signal,
      });
      clearTimeout(t);
      if (!res.ok) {
        set({
          status: "error",
          message: `Server responded ${res.status} ${res.statusText}`,
          lastCheckedAt: Date.now(),
        });
        return false;
      }
      set({
        status: "connected",
        message: `Connected to ${baseUrl}`,
        lastCheckedAt: Date.now(),
      });
      return true;
    } catch (e) {
      const raw = (e as Error)?.message ?? "Failed to reach API";
      // Re-check mixed content in case the URL changed since.
      const mc2 = detectMixedContent(baseUrl);
      set({
        status: "error",
        message: mc2.blocked ? (mc2.reason ?? raw) : raw,
        mixedContentBlocked: mc2.blocked,
        mixedContentReason: mc2.reason ?? null,
        lastCheckedAt: Date.now(),
      });
      return false;
    }
  },
}));

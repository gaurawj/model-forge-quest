/**
 * Detects when the browser will block requests to the API due to mixed content.
 * If the page is loaded over https:// and the API base URL is plain http://
 * (especially localhost / 127.0.0.1 / private IPs), browsers block the request
 * silently — fetch rejects with a generic "Failed to fetch" and no CORS log.
 */
export function detectMixedContent(baseUrl: string): {
  blocked: boolean;
  reason?: string;
} {
  if (typeof window === "undefined") return { blocked: false };
  try {
    const page = window.location.protocol; // "https:" or "http:"
    const api = new URL(baseUrl);
    if (page === "https:" && api.protocol === "http:") {
      const host = api.hostname;
      const isLocal =
        host === "localhost" ||
        host === "127.0.0.1" ||
        host === "0.0.0.0" ||
        host.endsWith(".local");
      return {
        blocked: true,
        reason: isLocal
          ? `This preview is served over HTTPS, but the API is plain HTTP at ${host}. Browsers block this (mixed content). Expose your local API over HTTPS (e.g. \`cloudflared tunnel --url http://localhost:8000\` or \`ngrok http 8000\`) and paste the https:// URL here.`
          : `This preview is HTTPS but the API URL is HTTP — browsers block mixed content. Use an https:// API URL.`,
      };
    }
  } catch {
    return { blocked: false };
  }
  return { blocked: false };
}

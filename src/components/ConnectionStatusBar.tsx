import { useApiConfigStore } from "@/stores/apiConfig";
import { CheckCircle2, AlertCircle, Loader2, CircleDashed } from "lucide-react";

export function ConnectionStatusBar() {
  const { baseUrl, status, message, lastCheckedAt } = useApiConfigStore();

  const config = {
    idle: {
      icon: CircleDashed,
      tone: "text-muted-foreground border-border bg-card",
      label: "Not tested",
    },
    connecting: {
      icon: Loader2,
      tone: "text-amber-400 border-amber-500/30 bg-amber-500/5",
      label: "Connecting…",
    },
    connected: {
      icon: CheckCircle2,
      tone: "text-emerald-400 border-emerald-500/30 bg-emerald-500/5",
      label: "Connected",
    },
    error: {
      icon: AlertCircle,
      tone: "text-destructive border-destructive/30 bg-destructive/5",
      label: "Connection error",
    },
  }[status];

  const Icon = config.icon;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-6 py-2 text-xs">
        <div className={`flex items-center gap-2 rounded-md border px-2.5 py-1 ${config.tone}`}>
          <Icon className={`h-3.5 w-3.5 ${status === "connecting" ? "animate-spin" : ""}`} />
          <span className="font-medium">{config.label}</span>
          <span className="text-muted-foreground">·</span>
          <code className="text-[11px]">{baseUrl}</code>
        </div>
        <div className="truncate text-muted-foreground">
          {message ?? "Configure the API endpoint to load questionnaire, models, and recommendations."}
          {lastCheckedAt && (
            <span className="ml-2 text-[10px] opacity-60">
              {new Date(lastCheckedAt).toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

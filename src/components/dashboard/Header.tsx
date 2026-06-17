import { Link } from "@tanstack/react-router";
import { Brain, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ApiConfig } from "@/components/ApiConfig";
import { useApiConfigStore } from "@/stores/apiConfig";

export function DashboardHeader() {
  const status = useApiConfigStore((s) => s.status);
  const env =
    status === "connected" ? "Connected" : status === "connecting" ? "Checking" : "Offline";
  const envDot =
    status === "connected"
      ? "bg-emerald-500"
      : status === "connecting"
      ? "bg-orange-500 animate-pulse"
      : "bg-zinc-500";

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-6 py-3">
        <div className="flex items-center gap-3">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500/30 via-blue-500/20 to-purple-500/30 ring-1 ring-white/10">
            <Brain className="h-4.5 w-4.5 text-primary" />
            <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-cyan-400/10 to-purple-500/10 blur-md -z-10" />
          </div>
          <div>
            <div className="text-sm font-semibold tracking-tight bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
              Nexus AI SDLC Advisor
            </div>
            <div className="text-[11px] text-muted-foreground">
              Strategic AI Toolchain Intelligence Platform
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge tone="env">
            <span className={`h-1.5 w-1.5 rounded-full ${envDot}`} />
            {env}
          </Badge>
          <Badge tone="ai">AI Powered</Badge>
          <Badge tone="ent">Enterprise Edition</Badge>
          <div className="mx-1 h-6 w-px bg-border" />
          <ApiConfig />
          <Button asChild size="sm" variant="ghost">
            <Link to="/">
              <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
              New questionnaire
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

function Badge({
  tone,
  children,
}: {
  tone: "env" | "ai" | "ent";
  children: React.ReactNode;
}) {
  const tones: Record<string, string> = {
    env: "border-border bg-muted/40 text-foreground/80",
    ai: "border-primary/30 bg-primary/10 text-primary",
    ent: "border-orange-500/30 bg-orange-500/10 text-orange-600",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

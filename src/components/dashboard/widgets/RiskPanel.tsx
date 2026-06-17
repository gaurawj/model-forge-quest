import { GlassCard } from "@/components/ui/GlassCard";
import { useProjectConfigStore } from "@/stores/projectConfig";
import { useRecommendationStore } from "@/stores/recommendation";
import { ShieldAlert } from "lucide-react";
import { confidenceScalar } from "@/lib/types";

interface Risk {
  label: string;
  level: number; // 0-100
  note: string;
}

function band(n: number) {
  if (n >= 70) return { color: "bg-rose-400", text: "text-rose-300", label: "High" };
  if (n >= 40) return { color: "bg-amber-400", text: "text-amber-300", label: "Medium" };
  return { color: "bg-emerald-400", text: "text-emerald-300", label: "Low" };
}

export function RiskPanel() {
  const cfg = useProjectConfigStore();
  const rec = useRecommendationStore((s) => s.recommendation);

  const risks: Risk[] = [
    {
      label: "Cost Risk",
      level: Math.min(95, 30 + cfg.complexity * 5 + cfg.codebaseSize * 2),
      note: "Driven by complexity, scale, and selected tier.",
    },
    {
      label: "Vendor Lock-in",
      level:
        cfg.strategy === "best-per-stage"
          ? 30
          : cfg.strategy === "self-hosted"
          ? 15
          : 75,
      note: "Higher when constrained to a single vendor.",
    },
    {
      label: "Compliance Risk",
      level:
        100 -
        (Number(cfg.compliance.soc2) +
          Number(cfg.compliance.hipaa) +
          Number(cfg.compliance.onPremise) +
          Number(cfg.compliance.zeroDataRetention)) *
          18,
      note: "Reduced as compliance constraints are enforced.",
    },
    {
      label: "Scalability Risk",
      level: Math.min(95, 25 + cfg.codebaseSize * 6 + (rec ? (1 - confidenceScalar(rec.confidence)) * 30 : 10)),
      note: "Driven by codebase size and recommendation confidence.",
    },
  ];

  return (
    <GlassCard className="p-5">
      <div className="flex items-center gap-2">
        <ShieldAlert className="h-4 w-4 text-amber-300" />
        <div>
          <div className="text-sm font-semibold">Risk Assessment</div>
          <div className="text-xs text-muted-foreground">
            Live signal based on configuration and recommendation.
          </div>
        </div>
      </div>
      <div className="mt-4 space-y-3">
        {risks.map((r) => {
          const b = band(r.level);
          return (
            <div key={r.label}>
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium">{r.label}</span>
                <span className={b.text}>
                  {b.label} · {Math.round(r.level)}
                </span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full rounded-full ${b.color}`}
                  style={{ width: `${Math.min(100, r.level)}%` }}
                />
              </div>
              <div className="mt-1 text-[10px] text-muted-foreground">{r.note}</div>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}

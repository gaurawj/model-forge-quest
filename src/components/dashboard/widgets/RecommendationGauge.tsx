import { useRecommendationStore } from "@/stores/recommendation";
import { GlassCard } from "@/components/ui/GlassCard";

export function RecommendationGauge() {
  const rec = useRecommendationStore((s) => s.recommendation);
  const score = Math.round((rec?.confidence ?? 0) * 100);
  const radius = 56;
  const circumference = 2 * Math.PI * radius;
  const dash = (score / 100) * circumference;

  return (
    <GlassCard className="flex items-center gap-5 p-5">
      <div className="relative h-36 w-36 shrink-0">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 140 140">
          <defs>
            <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#22d3ee" />
              <stop offset="100%" stopColor="#c084fc" />
            </linearGradient>
          </defs>
          <circle
            cx="70"
            cy="70"
            r={radius}
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="10"
            fill="none"
          />
          <circle
            cx="70"
            cy="70"
            r={radius}
            stroke="url(#gaugeGrad)"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circumference}`}
            fill="none"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-3xl font-bold tabular-nums bg-gradient-to-br from-cyan-300 to-purple-300 bg-clip-text text-transparent">
            {score}
          </div>
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
            / 100
          </div>
        </div>
      </div>
      <div className="min-w-0">
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
          AI Recommendation Score
        </div>
        <div className="mt-1 text-base font-semibold">
          {score >= 85 ? "High confidence" : score >= 65 ? "Solid match" : "Tentative"}
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Combined signal of architecture fit, model capability and cost alignment with the
          requested workload.
        </p>
      </div>
    </GlassCard>
  );
}

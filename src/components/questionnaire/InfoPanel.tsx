import { Brain, Layers, Activity, DollarSign, Sparkles } from "lucide-react";

const ITEMS = [
  { icon: Brain, title: "AI Model Recommendations", desc: "Best, budget, and premium picks for your stack." },
  { icon: Layers, title: "Architecture Design", desc: "Pattern, hosting, and per-role model assignment." },
  { icon: Activity, title: "Workload Estimation", desc: "Tokens, requests, and context window sizing." },
  { icon: DollarSign, title: "Cost Modeling", desc: "Project-wide spend with editable assumptions." },
  { icon: Sparkles, title: "Optimization Suggestions", desc: "Levers to cut cost and improve quality." },
];

export function InfoPanel() {
  return (
    <aside className="sticky top-6 h-fit rounded-lg border border-border bg-card p-6">
      <div className="mb-4">
        <div className="text-xs uppercase tracking-widest text-muted-foreground">
          What you'll get
        </div>
        <h3 className="mt-1 text-base font-semibold text-foreground">
          Recommendation deliverables
        </h3>
      </div>
      <ul className="space-y-4">
        {ITEMS.map((it) => (
          <li key={it.title} className="flex gap-3">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-background">
              <it.icon className="h-4 w-4 text-primary" />
            </div>
            <div>
              <div className="text-sm font-medium text-foreground">{it.title}</div>
              <div className="text-xs text-muted-foreground">{it.desc}</div>
            </div>
          </li>
        ))}
      </ul>
    </aside>
  );
}

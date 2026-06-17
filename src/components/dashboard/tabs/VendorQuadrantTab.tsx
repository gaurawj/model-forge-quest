import { useMemo, useState } from "react";
import { useRecommendationStore } from "@/stores/recommendation";
import { useModelsStore } from "@/stores/models";
import { useSdlcRows } from "@/lib/sdlcMapping";
import { GlassCard } from "@/components/ui/GlassCard";
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from "recharts";
import type { RecommendationCategory } from "@/lib/types";

type Filter = "all" | RecommendationCategory;

const TIER_COLOR: Record<RecommendationCategory, string> = {
  recommended: "#22d3ee",
  budget: "#34d399",
  premium: "#c084fc",
};

interface Vendor {
  name: string;
  modelId: string;
  cost: number; // X (higher = more cost efficient)
  capability: number; // Y (0-100)
  stagesWon: number;
  tier: RecommendationCategory;
}

export function VendorQuadrantTab() {
  const rec = useRecommendationStore((s) => s.recommendation);
  const models = useModelsStore((s) => s.models);
  const rows = useSdlcRows();
  const [filter, setFilter] = useState<Filter>("all");

  const vendors: Vendor[] = useMemo(() => {
    if (!rec) return [];
    const acc = new Map<string, Vendor>();
    const tiers: RecommendationCategory[] = ["recommended", "budget", "premium"];

    rows.forEach((r) => {
      tiers.forEach((t) => {
        const pick = r.picks[t];
        if (!pick.modelId) return;
        const existing = acc.get(pick.modelId);
        if (existing) {
          existing.stagesWon += 1;
        } else {
          const catalog = models.find((m) => m.id === pick.modelId);
          const promptCost = pick.pricing?.prompt ?? 5;
          const costEfficiency = Math.max(5, Math.min(95, 100 - promptCost * 5));
          // Capability heuristic from context window + flags
          let capability = 60;
          if (catalog?.supports_reasoning) capability += 15;
          if (catalog?.supports_tool_calling) capability += 8;
          if ((catalog?.context_window ?? 0) >= 200_000) capability += 12;
          else if ((catalog?.context_window ?? 0) >= 100_000) capability += 6;
          if (t === "premium") capability += 5;
          capability = Math.min(98, capability);

          acc.set(pick.modelId, {
            name: catalog?.name ?? pick.modelId,
            modelId: pick.modelId,
            cost: costEfficiency,
            capability,
            stagesWon: 1,
            tier: t,
          });
        }
      });
    });
    return Array.from(acc.values());
  }, [rec, rows, models]);

  const filtered = filter === "all" ? vendors : vendors.filter((v) => v.tier === filter);
  const data = filtered.map((v) => ({ ...v, size: 100 + v.stagesWon * 120 }));

  if (!rec) return null;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-sm font-semibold">Vendor Magic Quadrant</div>
          <div className="text-xs text-muted-foreground">
            Bubble size = number of SDLC stages won. Filter by tier path.
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {(["all", "recommended", "budget", "premium"] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={
                "rounded-full border px-3 py-1.5 text-xs capitalize transition-colors " +
                (filter === f
                  ? "border-cyan-400/40 bg-cyan-400/10 text-cyan-100"
                  : "border-border bg-muted/40 text-muted-foreground hover:text-foreground")
              }
            >
              {f === "all" ? "Show All" : `${f} Path`}
            </button>
          ))}
        </div>
      </div>

      <GlassCard className="p-5">
        <div className="relative h-[520px]">
          {/* Quadrant labels */}
          <div className="pointer-events-none absolute inset-0 z-10 grid grid-cols-2 grid-rows-2 px-12 py-8 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
            <div className="self-start">Visionaries</div>
            <div className="justify-self-end self-start text-primary/80">Leaders</div>
            <div className="self-end">Niche Players</div>
            <div className="justify-self-end self-end">Challengers</div>
          </div>

          <ResponsiveContainer>
            <ScatterChart margin={{ top: 30, right: 30, bottom: 40, left: 40 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
              <XAxis
                type="number"
                dataKey="cost"
                name="Cost Efficiency"
                domain={[0, 100]}
                stroke="var(--muted-foreground)"
                fontSize={11}
                label={{
                  value: "Cost Efficiency →",
                  position: "insideBottom",
                  offset: -10,
                  fill: "var(--muted-foreground)",
                  fontSize: 11,
                }}
              />
              <YAxis
                type="number"
                dataKey="capability"
                name="Capability"
                domain={[0, 100]}
                stroke="var(--muted-foreground)"
                fontSize={11}
                label={{
                  value: "Capability →",
                  angle: -90,
                  position: "insideLeft",
                  fill: "var(--muted-foreground)",
                  fontSize: 11,
                }}
              />
              <ZAxis type="number" dataKey="size" range={[100, 800]} />
              <ReferenceLine x={50} stroke="rgba(255,255,255,0.15)" strokeDasharray="4 4" />
              <ReferenceLine y={50} stroke="rgba(255,255,255,0.15)" strokeDasharray="4 4" />
              <Tooltip
                cursor={{ strokeDasharray: "3 3" }}
                contentStyle={{
                  background: "rgba(20,20,20,0.95)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 8,
                }}
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const p = payload[0].payload as Vendor;
                  return (
                    <div className="rounded-lg border border-border bg-popover text-popover-foreground p-3 text-xs">
                      <div className="font-semibold">{p.name}</div>
                      <div className="text-muted-foreground capitalize">{p.tier} path</div>
                      <div className="mt-1.5">Capability: {p.capability}</div>
                      <div>Cost efficiency: {p.cost}</div>
                      <div>Stages won: {p.stagesWon}</div>
                    </div>
                  );
                }}
              />
              {(["recommended", "budget", "premium"] as RecommendationCategory[]).map((t) => (
                <Scatter
                  key={t}
                  name={t}
                  data={data.filter((d) => d.tier === t)}
                  fill={TIER_COLOR[t]}
                  fillOpacity={0.6}
                  stroke={TIER_COLOR[t]}
                />
              ))}
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        {data.map((v) => (
          <div
            key={v.modelId}
            className="rounded-lg border border-border bg-muted/40 p-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium truncate">{v.name}</span>
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: TIER_COLOR[v.tier] }}
              />
            </div>
            <div className="mt-1 flex items-center justify-between text-[11px] text-muted-foreground">
              <span>Cap {v.capability} · Eff {v.cost}</span>
              <span>{v.stagesWon} stage{v.stagesWon !== 1 ? "s" : ""} won</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

import { Fragment, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useModelsStore } from "@/stores/models";
import { useModelConfigStore, type ModelConfig } from "@/stores/modelConfig";
import { GlassCard } from "@/components/ui/GlassCard";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Eye,
  Wrench,
  Brain,
  Search,
  Loader2,
  AlertCircle,
  ArrowUpDown,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import type { Model } from "@/lib/types";

// ─────────────────────────────────────────────
// Formatting helpers
// ─────────────────────────────────────────────
function fmtCtx(n?: number) {
  if (!n) return "—";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
  return String(n);
}
function fmtPricePerM(n?: number) {
  if (n == null) return "—";
  return `$${n.toFixed(2)}`;
}
function fmtTokens(t: number) {
  if (t >= 1e12) return (t / 1e12).toFixed(1) + "T";
  if (t >= 1e9) return (t / 1e9).toFixed(1) + "B";
  if (t >= 1e6) return (t / 1e6).toFixed(1) + "M";
  if (t >= 1e3) return (t / 1e3).toFixed(1) + "K";
  return t.toFixed(0);
}
function fmtCurrencyShort(a: number) {
  if (a >= 1e9) return "$" + (a / 1e9).toFixed(2) + "B";
  if (a >= 1e6) return "$" + (a / 1e6).toFixed(2) + "M";
  if (a >= 1e3) return "$" + (a / 1e3).toFixed(1) + "K";
  if (a >= 1) return "$" + a.toFixed(2);
  return "$" + a.toFixed(4);
}
function fmtCurrency(a: number) {
  return "$" + a.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

// ─────────────────────────────────────────────
// Cost calc (pricing in $/1M tokens already)
// ─────────────────────────────────────────────
interface CostBreakdown {
  total_requests: number;
  input_tokens: number;
  output_tokens: number;
  reasoning_tokens: number;
  cached_tokens: number;
  input_cost: number;
  output_cost: number;
  cached_cost: number;
  total_cost: number;
  cache_enabled: boolean;
}

function calcCost(m: Model, w: ModelConfig): CostBreakdown {
  const promptPerToken = (m.pricing?.prompt ?? 0) / 1_000_000;
  const outPerToken = (m.pricing?.completion ?? 0) / 1_000_000;
  const cachePerToken = (m.pricing?.input_cache_read ?? 0) / 1_000_000;

  const total_requests = w.project_duration_months * 30 * w.active_users * w.requests_per_user_per_day;
  const input_tokens = total_requests * w.avg_input_tokens;
  const output_tokens = total_requests * w.avg_output_tokens;
  const reasoning_tokens = total_requests * (w.avg_reasoning_tokens || 0);
  const cache_enabled = w.cache_eligible && (w.avg_cached_tokens || 0) > 0 && cachePerToken > 0;
  const cached_tokens = cache_enabled ? total_requests * w.avg_cached_tokens : 0;

  const input_cost = input_tokens * promptPerToken;
  const output_cost = (output_tokens + reasoning_tokens) * outPerToken;
  const cached_cost = cached_tokens * cachePerToken;
  const total_cost = input_cost + output_cost + cached_cost;

  return {
    total_requests,
    input_tokens,
    output_tokens,
    reasoning_tokens,
    cached_tokens,
    input_cost,
    output_cost,
    cached_cost,
    total_cost,
    cache_enabled,
  };
}

type SortKey = "name" | "provider" | "context" | "input" | "output" | "cost";
type SortDir = "asc" | "desc";

export function ModelExplorerTab() {
  const setModels = useModelsStore((s) => s.setModels);
  const cached = useModelsStore((s) => s.models);
  const workload = useModelConfigStore();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["models"],
    queryFn: api.getModels,
    staleTime: 5 * 60_000,
  });

  useEffect(() => {
    if (data && data.length) setModels(data);
  }, [data, setModels]);

  const models = data ?? cached;

  const providers = useMemo(() => {
    const s = new Set<string>();
    models.forEach((m) => m.provider && s.add(m.provider));
    return Array.from(s).sort();
  }, [models]);

  const [query, setQuery] = useState("");
  const [provider, setProvider] = useState<string>("all");
  const [capability, setCapability] = useState<string>("all");
  const [sortKey, setSortKey] = useState<SortKey>("cost");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const enriched = useMemo(
    () => models.map((m) => ({ model: m, cost: calcCost(m, workload) })),
    [models, workload],
  );

  const filtered = useMemo(() => {
    const list = enriched.filter(({ model: m }) => {
      if (provider !== "all" && m.provider !== provider) return false;
      if (
        query &&
        !`${m.name} ${m.id} ${m.provider}`.toLowerCase().includes(query.toLowerCase())
      )
        return false;
      if (capability === "vision" && !m.supports_vision) return false;
      if (capability === "tools" && !m.supports_tool_calling) return false;
      if (capability === "reasoning" && !m.supports_reasoning) return false;
      return true;
    });

    const dir = sortDir === "asc" ? 1 : -1;
    const get = ({ model: m, cost }: typeof list[number]): string | number => {
      switch (sortKey) {
        case "name":
          return (m.name || m.id).toLowerCase();
        case "provider":
          return (m.provider || "").toLowerCase();
        case "context":
          return m.context_window ?? 0;
        case "input":
          return m.pricing?.prompt ?? 0;
        case "output":
          return m.pricing?.completion ?? 0;
        case "cost":
          return cost.total_cost;
      }
    };
    return [...list].sort((a, b) => {
      const av = get(a);
      const bv = get(b);
      if (av < bv) return -1 * dir;
      if (av > bv) return 1 * dir;
      return 0;
    });
  }, [enriched, provider, query, capability, sortKey, sortDir]);

  const toggleSort = (k: SortKey) => {
    if (sortKey === k) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else {
      setSortKey(k);
      setSortDir(k === "name" || k === "provider" ? "asc" : "desc");
    }
  };

  if (isLoading && models.length === 0) {
    return (
      <GlassCard className="flex items-center justify-center gap-2 p-10 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading models from /api/v1/models…
      </GlassCard>
    );
  }

  if (isError && models.length === 0) {
    return (
      <GlassCard className="p-8">
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 h-5 w-5 text-orange-600" />
          <div>
            <div className="text-sm font-medium">Could not load models</div>
            <div className="mt-1 text-xs text-muted-foreground">
              {(error as Error)?.message ?? "Network error"}
            </div>
          </div>
        </div>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-3">
      <GlassCard className="flex flex-wrap items-center gap-3 px-4 py-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search models…"
            className="h-9 pl-8 bg-background/40"
          />
        </div>
        <Select value={provider} onValueChange={setProvider}>
          <SelectTrigger className="h-9 w-[160px] bg-background/40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All providers</SelectItem>
            {providers.map((p) => (
              <SelectItem key={p} value={p}>
                {p}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={capability} onValueChange={setCapability}>
          <SelectTrigger className="h-9 w-[160px] bg-background/40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All capabilities</SelectItem>
            <SelectItem value="vision">Vision</SelectItem>
            <SelectItem value="tools">Tool calling</SelectItem>
            <SelectItem value="reasoning">Reasoning</SelectItem>
          </SelectContent>
        </Select>
        <div className="text-xs text-muted-foreground tabular-nums">
          {filtered.length} / {models.length}
        </div>
      </GlassCard>

      <GlassCard className="px-4 py-2 text-[11px] text-muted-foreground">
        Projected costs use the workload from <span className="text-foreground">Model Configuration</span>:
        {" "}{workload.project_duration_months}mo · {workload.active_users.toLocaleString()} users · {workload.requests_per_user_per_day} req/day · in {workload.avg_input_tokens}/out {workload.avg_output_tokens}/reason {workload.avg_reasoning_tokens}/cache {workload.avg_cached_tokens} tokens · cache {workload.cache_eligible ? "ON" : "OFF"}
      </GlassCard>

      <GlassCard className="p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="w-8" />
              <SortableHead label="Model" active={sortKey === "name"} dir={sortDir} onClick={() => toggleSort("name")} />
              <SortableHead label="Provider" active={sortKey === "provider"} dir={sortDir} onClick={() => toggleSort("provider")} />
              <TableHead className="text-[10px] uppercase tracking-wider">Capabilities</TableHead>
              <SortableHead label="Context" active={sortKey === "context"} dir={sortDir} onClick={() => toggleSort("context")} className="text-right" />
              <SortableHead label="In /1M" active={sortKey === "input"} dir={sortDir} onClick={() => toggleSort("input")} className="text-right" />
              <SortableHead label="Out /1M" active={sortKey === "output"} dir={sortDir} onClick={() => toggleSort("output")} className="text-right" />
              <SortableHead label="Projected Cost" active={sortKey === "cost"} dir={sortDir} onClick={() => toggleSort("cost")} className="text-right" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(({ model: m, cost }) => {
              const isOpen = expandedId === m.id;
              return (
                <Fragment key={m.id}>
                  <TableRow
                    className="border-border hover:bg-muted/40 cursor-pointer"
                    onClick={() => setExpandedId(isOpen ? null : m.id)}
                  >
                    <TableCell className="w-8 text-muted-foreground">
                      {isOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                    </TableCell>
                    <TableCell className="max-w-[300px]">
                      <div className="truncate text-sm font-medium">{m.name || m.id}</div>
                      <div className="truncate text-[11px] text-muted-foreground">{m.id}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-border text-xs text-muted-foreground">
                        {m.provider || "—"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {m.supports_vision && (
                          <Badge variant="outline" className="gap-1 border-primary/30 text-primary text-[10px]">
                            <Eye className="h-3 w-3" /> Vision
                          </Badge>
                        )}
                        {m.supports_tool_calling && (
                          <Badge variant="outline" className="gap-1 border-emerald-400/30 text-emerald-700 text-[10px]">
                            <Wrench className="h-3 w-3" /> Tools
                          </Badge>
                        )}
                        {m.supports_reasoning && (
                          <Badge variant="outline" className="gap-1 border-orange-500/30 text-orange-600 text-[10px]">
                            <Brain className="h-3 w-3" /> Reasoning
                          </Badge>
                        )}
                        {!m.supports_vision && !m.supports_tool_calling && !m.supports_reasoning && (
                          <span className="text-[11px] text-muted-foreground">—</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-xs">{fmtCtx(m.context_window)}</TableCell>
                    <TableCell className="text-right tabular-nums text-xs">{fmtPricePerM(m.pricing?.prompt)}</TableCell>
                    <TableCell className="text-right tabular-nums text-xs">{fmtPricePerM(m.pricing?.completion)}</TableCell>
                    <TableCell className="text-right tabular-nums text-sm font-semibold">
                      {fmtCurrencyShort(cost.total_cost)}
                    </TableCell>
                  </TableRow>
                  {isOpen && (
                    <TableRow className="border-border bg-muted/40 hover:bg-muted/40">
                      <TableCell colSpan={8} className="p-0">
                        <ExpandedDetail model={m} cost={cost} workload={workload} />
                      </TableCell>
                    </TableRow>
                  )}
                </Fragment>
              );
            })}
          </TableBody>
        </Table>

        {filtered.length === 0 && (
          <div className="p-8 text-center text-sm text-muted-foreground">
            No models match the current filters.
          </div>
        )}
      </GlassCard>
    </div>
  );
}

function ExpandedDetail({
  model,
  cost,
  workload,
}: {
  model: Model;
  cost: CostBreakdown;
  workload: ModelConfig;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-3">
      <DetailSection title="Model Information">
        <DetailRow label="Model ID" value={<span className="font-mono text-[11px]">{model.id}</span>} />
        <DetailRow label="Modality" value={(model.capabilities ?? []).join(", ") || "text"} />
        <DetailRow label="Context" value={fmtCtx(model.context_window)} />
        {model.description && (
          <div className="mt-2 text-[11px] leading-relaxed text-muted-foreground line-clamp-4">
            {model.description}
          </div>
        )}
      </DetailSection>

      <DetailSection title="Cost Breakdown">
        <DetailRow label="Input tokens" value={fmtTokens(cost.input_tokens)} sub={fmtCurrency(cost.input_cost)} />
        <DetailRow label="Output tokens" value={fmtTokens(cost.output_tokens)} sub={fmtCurrency(cost.output_cost)} />
        {cost.reasoning_tokens > 0 && (
          <DetailRow label="Reasoning tokens" value={fmtTokens(cost.reasoning_tokens)} />
        )}
        <DetailRow
          label="Cached tokens"
          value={cost.cache_enabled ? fmtTokens(cost.cached_tokens) : "—"}
          sub={cost.cache_enabled ? fmtCurrency(cost.cached_cost) : undefined}
        />
        <div className="mt-2 flex items-center justify-between border-t border-border pt-2">
          <span className="text-[11px] uppercase tracking-wider text-muted-foreground">Project total</span>
          <span className="text-base font-semibold tabular-nums">{fmtCurrencyShort(cost.total_cost)}</span>
        </div>
      </DetailSection>

      <DetailSection title="Project Metrics">
        <DetailRow label="Duration" value={`${workload.project_duration_months} months`} />
        <DetailRow label="Active users" value={workload.active_users.toLocaleString()} />
        <DetailRow label="Requests/user/day" value={String(workload.requests_per_user_per_day)} />
        <DetailRow label="Total requests" value={fmtTokens(cost.total_requests)} />
        <DetailRow label="Avg in / out" value={`${workload.avg_input_tokens} / ${workload.avg_output_tokens}`} />
        <DetailRow label="Cache eligible" value={workload.cache_eligible ? "Yes" : "No"} />
      </DetailSection>
    </div>
  );
}

function DetailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-background/30 p-3">
      <div className="mb-2 text-[10px] uppercase tracking-wider text-muted-foreground">{title}</div>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function DetailRow({
  label,
  value,
  sub,
}: {
  label: string;
  value: React.ReactNode;
  sub?: string;
}) {
  return (
    <div className="flex items-baseline justify-between gap-2 text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right tabular-nums">
        {value}
        {sub && <span className="ml-2 text-[10px] text-muted-foreground">{sub}</span>}
      </span>
    </div>
  );
}

function SortableHead({
  label,
  active,
  dir,
  onClick,
  className,
}: {
  label: string;
  active: boolean;
  dir: SortDir;
  onClick: () => void;
  className?: string;
}) {
  return (
    <TableHead className={`text-[10px] uppercase tracking-wider ${className ?? ""}`}>
      <button
        onClick={onClick}
        className={`inline-flex items-center gap-1 hover:text-foreground transition-colors ${
          active ? "text-foreground" : ""
        } ${className?.includes("text-right") ? "ml-auto" : ""}`}
      >
        {label}
        <ArrowUpDown className={`h-3 w-3 ${active ? "opacity-100" : "opacity-40"}`} />
        {active && <span className="text-[9px]">{dir === "asc" ? "↑" : "↓"}</span>}
      </button>
    </TableHead>
  );
}

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useModelsStore } from "@/stores/models";
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
} from "lucide-react";
import type { Model } from "@/lib/types";

function fmtCtx(n?: number) {
  if (!n) return "—";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
  return String(n);
}

function fmtPrice(n?: number) {
  if (n == null) return "—";
  return `$${n.toFixed(2)}`;
}

type SortKey = "name" | "provider" | "context" | "input" | "output" | "cached";
type SortDir = "asc" | "desc";

export function ModelExplorerTab() {
  const setModels = useModelsStore((s) => s.setModels);
  const cached = useModelsStore((s) => s.models);

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
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const filtered = useMemo(() => {
    const list = models.filter((m) => {
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
    const get = (m: Model): string | number => {
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
        case "cached":
          return m.pricing?.input_cache_read ?? 0;
      }
    };
    return [...list].sort((a, b) => {
      const av = get(a);
      const bv = get(b);
      if (av < bv) return -1 * dir;
      if (av > bv) return 1 * dir;
      return 0;
    });
  }, [models, provider, query, capability, sortKey, sortDir]);

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
          <AlertCircle className="mt-0.5 h-5 w-5 text-amber-400" />
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

      <GlassCard className="p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-white/[0.06] hover:bg-transparent">
              <SortableHead label="Model" active={sortKey === "name"} dir={sortDir} onClick={() => toggleSort("name")} />
              <SortableHead label="Provider" active={sortKey === "provider"} dir={sortDir} onClick={() => toggleSort("provider")} />
              <TableHead className="text-[10px] uppercase tracking-wider">Capabilities</TableHead>
              <SortableHead label="Context" active={sortKey === "context"} dir={sortDir} onClick={() => toggleSort("context")} className="text-right" />
              <SortableHead label="Input /1M" active={sortKey === "input"} dir={sortDir} onClick={() => toggleSort("input")} className="text-right" />
              <SortableHead label="Output /1M" active={sortKey === "output"} dir={sortDir} onClick={() => toggleSort("output")} className="text-right" />
              <SortableHead label="Cached /1M" active={sortKey === "cached"} dir={sortDir} onClick={() => toggleSort("cached")} className="text-right" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((m) => (
              <TableRow key={m.id} className="border-white/[0.04] hover:bg-white/[0.03]">
                <TableCell className="max-w-[320px]">
                  <div className="truncate text-sm font-medium">{m.name || m.id}</div>
                  <div className="truncate text-[11px] text-muted-foreground">{m.id}</div>
                  {m.description && (
                    <div className="mt-0.5 line-clamp-1 text-[11px] text-muted-foreground/80">
                      {m.description}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="border-white/10 text-xs text-muted-foreground">
                    {m.provider || "—"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {m.supports_vision && (
                      <Badge variant="outline" className="gap-1 border-cyan-400/30 text-cyan-200 text-[10px]">
                        <Eye className="h-3 w-3" /> Vision
                      </Badge>
                    )}
                    {m.supports_tool_calling && (
                      <Badge variant="outline" className="gap-1 border-emerald-400/30 text-emerald-200 text-[10px]">
                        <Wrench className="h-3 w-3" /> Tools
                      </Badge>
                    )}
                    {m.supports_reasoning && (
                      <Badge variant="outline" className="gap-1 border-purple-400/30 text-purple-200 text-[10px]">
                        <Brain className="h-3 w-3" /> Reasoning
                      </Badge>
                    )}
                    {!m.supports_vision && !m.supports_tool_calling && !m.supports_reasoning && (
                      <span className="text-[11px] text-muted-foreground">—</span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right tabular-nums text-xs">{fmtCtx(m.context_window)}</TableCell>
                <TableCell className="text-right tabular-nums text-xs">{fmtPrice(m.pricing?.prompt)}</TableCell>
                <TableCell className="text-right tabular-nums text-xs">{fmtPrice(m.pricing?.completion)}</TableCell>
                <TableCell className="text-right tabular-nums text-xs">{fmtPrice(m.pricing?.input_cache_read)}</TableCell>
              </TableRow>
            ))}
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

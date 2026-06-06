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
  Eye,
  Wrench,
  Brain,
  Search,
  Cpu,
  Loader2,
  AlertCircle,
} from "lucide-react";
import type { Model } from "@/lib/types";

function fmtCtx(n?: number) {
  if (!n) return "—";
  if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
  return String(n);
}

function fmtPrice(n?: number) {
  if (n == null) return "—";
  return `$${n.toFixed(2)}`;
}

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

  const filtered = useMemo(() => {
    return models.filter((m) => {
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
  }, [models, provider, query, capability]);

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

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((m) => (
          <ModelCard key={m.id} model={m} />
        ))}
      </div>

      {filtered.length === 0 && (
        <GlassCard className="p-8 text-center text-sm text-muted-foreground">
          No models match the current filters.
        </GlassCard>
      )}
    </div>
  );
}

function ModelCard({ model }: { model: Model }) {
  return (
    <GlassCard className="flex h-full flex-col gap-3 p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            <Cpu className="h-3 w-3" />
            {model.provider || "Unknown"}
          </div>
          <div className="mt-1 truncate text-sm font-semibold">{model.name || model.id}</div>
          <div className="truncate text-[11px] text-muted-foreground">{model.id}</div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] tabular-nums text-muted-foreground">
            {fmtCtx(model.context_window)} ctx
          </span>
        </div>
      </div>

      {model.description && (
        <p className="line-clamp-2 text-xs text-muted-foreground">{model.description}</p>
      )}

      <div className="flex flex-wrap gap-1.5">
        {model.supports_vision && (
          <Badge variant="outline" className="gap-1 border-cyan-400/30 text-cyan-200">
            <Eye className="h-3 w-3" /> Vision
          </Badge>
        )}
        {model.supports_tool_calling && (
          <Badge variant="outline" className="gap-1 border-emerald-400/30 text-emerald-200">
            <Wrench className="h-3 w-3" /> Tools
          </Badge>
        )}
        {model.supports_reasoning && (
          <Badge variant="outline" className="gap-1 border-purple-400/30 text-purple-200">
            <Brain className="h-3 w-3" /> Reasoning
          </Badge>
        )}
        {(model.capabilities ?? []).slice(0, 3).map((c) => (
          <Badge key={c} variant="outline" className="border-white/10 text-muted-foreground">
            {c}
          </Badge>
        ))}
      </div>

      <div className="mt-auto grid grid-cols-3 gap-2 border-t border-white/[0.06] pt-3 text-[11px]">
        <PriceCell label="Input" value={fmtPrice(model.pricing?.prompt)} />
        <PriceCell label="Output" value={fmtPrice(model.pricing?.completion)} />
        <PriceCell label="Cached" value={fmtPrice(model.pricing?.input_cache_read)} />
      </div>
    </GlassCard>
  );
}

function PriceCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-[9px] uppercase tracking-widest text-muted-foreground">{label}</span>
      <span className="text-xs font-semibold tabular-nums">
        {value}
        <span className="ml-0.5 text-[9px] text-muted-foreground">/1M</span>
      </span>
    </div>
  );
}

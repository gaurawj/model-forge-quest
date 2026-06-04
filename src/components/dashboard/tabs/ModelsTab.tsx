import { useMemo, useState } from "react";
import { useModelsStore } from "@/stores/models";
import { useRecommendationStore } from "@/stores/recommendation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Search, Eye, Check, ChevronLeft, ChevronRight, Cpu } from "lucide-react";
import type { Model } from "@/lib/types";
import { formatNumber } from "@/lib/cost";
import { toast } from "sonner";

const PAGE_SIZE = 10;

export function ModelsTab() {
  const models = useModelsStore((s) => s.models);
  const recommendation = useRecommendationStore((s) => s.recommendation);
  const [query, setQuery] = useState("");
  const [provider, setProvider] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [viewing, setViewing] = useState<Model | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const providers = useMemo(() => {
    const set = new Set<string>();
    models.forEach((m) => m.provider && set.add(m.provider));
    return Array.from(set).sort();
  }, [models]);

  const recommendedIds = useMemo(() => {
    const map = new Map<string, string>();
    recommendation?.single_model_recommendations.forEach((r) =>
      map.set(r.model_id, r.category),
    );
    return map;
  }, [recommendation]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return models.filter((m) => {
      if (provider !== "all" && m.provider !== provider) return false;
      if (!q) return true;
      return (
        m.name?.toLowerCase().includes(q) ||
        m.id?.toLowerCase().includes(q) ||
        m.provider?.toLowerCase().includes(q)
      );
    });
  }, [models, query, provider]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageSafe = Math.min(page, totalPages);
  const paged = filtered.slice((pageSafe - 1) * PAGE_SIZE, pageSafe * PAGE_SIZE);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-sm font-medium">Model catalog</h3>
          <p className="text-xs text-muted-foreground">
            {filtered.length} of {models.length} models
          </p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search models…"
              className="h-9 w-[220px] bg-background pl-8"
            />
          </div>
          <Select
            value={provider}
            onValueChange={(v) => {
              setProvider(v);
              setPage(1);
            }}
          >
            <SelectTrigger className="h-9 w-[160px]">
              <SelectValue placeholder="Provider" />
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
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead>Model</TableHead>
              <TableHead>Provider</TableHead>
              <TableHead className="text-right">Context</TableHead>
              <TableHead className="text-right">Input $/1M</TableHead>
              <TableHead className="text-right">Output $/1M</TableHead>
              <TableHead>Capabilities</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paged.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-sm text-muted-foreground">
                  No models match your filters.
                </TableCell>
              </TableRow>
            )}
            {paged.map((m) => {
              const recCat = recommendedIds.get(m.id);
              const isSelected = selectedId === m.id;
              return (
                <TableRow key={m.id} className="border-border">
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary">
                        <Cpu className="h-3.5 w-3.5" />
                      </div>
                      <div>
                        <div className="font-medium">{m.name ?? m.id}</div>
                        <div className="text-[11px] text-muted-foreground">{m.id}</div>
                      </div>
                      {recCat && (
                        <Badge variant="outline" className="ml-1 text-[10px] capitalize">
                          {recCat}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{m.provider ?? "—"}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {m.context_window ? formatNumber(m.context_window) : "—"}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {m.pricing?.prompt != null ? `$${m.pricing.prompt.toFixed(2)}` : "—"}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {m.pricing?.completion != null ? `$${m.pricing.completion.toFixed(2)}` : "—"}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {m.supports_vision && <Badge variant="secondary" className="text-[10px]">Vision</Badge>}
                      {m.supports_tool_calling && <Badge variant="secondary" className="text-[10px]">Tools</Badge>}
                      {m.supports_reasoning && <Badge variant="secondary" className="text-[10px]">Reasoning</Badge>}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button size="sm" variant="ghost" onClick={() => setViewing(m)}>
                        <Eye className="h-3.5 w-3.5" />
                        View
                      </Button>
                      <Button
                        size="sm"
                        variant={isSelected ? "default" : "outline"}
                        onClick={() => {
                          setSelectedId(m.id);
                          toast.success(`Selected ${m.name ?? m.id}`);
                        }}
                      >
                        <Check className="h-3.5 w-3.5" />
                        {isSelected ? "Selected" : "Select"}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div>
          Page {pageSafe} of {totalPages}
        </div>
        <div className="flex gap-1">
          <Button
            size="sm"
            variant="outline"
            disabled={pageSafe <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Prev
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={pageSafe >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Next
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <Dialog open={!!viewing} onOpenChange={(o) => !o && setViewing(null)}>
        <DialogContent className="max-w-lg">
          {viewing && (
            <>
              <DialogHeader>
                <DialogTitle>{viewing.name ?? viewing.id}</DialogTitle>
                <DialogDescription>
                  {viewing.provider} · {viewing.id}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 text-sm">
                {viewing.description && (
                  <p className="text-muted-foreground">{viewing.description}</p>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <KV label="Context window" value={viewing.context_window ? formatNumber(viewing.context_window) : "—"} />
                  <KV label="Input $/1M" value={viewing.pricing?.prompt != null ? `$${viewing.pricing.prompt.toFixed(2)}` : "—"} />
                  <KV label="Output $/1M" value={viewing.pricing?.completion != null ? `$${viewing.pricing.completion.toFixed(2)}` : "—"} />
                  <KV label="Cache read $/1M" value={viewing.pricing?.input_cache_read != null ? `$${viewing.pricing.input_cache_read.toFixed(2)}` : "—"} />
                </div>
                <div>
                  <div className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">
                    Capabilities
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {viewing.supports_vision && <Badge variant="secondary">Vision</Badge>}
                    {viewing.supports_tool_calling && <Badge variant="secondary">Tool calling</Badge>}
                    {viewing.supports_reasoning && <Badge variant="secondary">Reasoning</Badge>}
                    {viewing.capabilities?.map((c) => (
                      <Badge key={c} variant="outline">{c}</Badge>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button
                    onClick={() => {
                      setSelectedId(viewing.id);
                      toast.success(`Selected ${viewing.name ?? viewing.id}`);
                      setViewing(null);
                    }}
                  >
                    <Check className="h-3.5 w-3.5" />
                    Select model
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function KV({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-background/50 p-3">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-1 text-sm font-medium tabular-nums">{value}</div>
    </div>
  );
}

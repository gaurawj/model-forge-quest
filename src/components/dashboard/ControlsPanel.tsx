import { useRecommendationStore } from "@/stores/recommendation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

function NumField({
  label,
  value,
  onChange,
  step = 1,
  min = 0,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  step?: number;
  min?: number;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Input
        type="number"
        value={Number.isFinite(value) ? value : 0}
        min={min}
        step={step}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-9 bg-background tabular-nums"
      />
    </div>
  );
}

export function ControlsPanel() {
  const draft = useRecommendationStore((s) => s.draft);
  const updateDraft = useRecommendationStore((s) => s.updateDraft);
  if (!draft) return null;

  return (
    <aside className="sticky top-6 h-fit space-y-5 rounded-lg border border-border bg-card p-5">
      <div>
        <div className="text-xs uppercase tracking-widest text-muted-foreground">Controls</div>
        <h3 className="mt-0.5 text-sm font-semibold">Workload assumptions</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Adjust to recalculate the entire dashboard.
        </p>
      </div>

      <NumField
        label="Project duration (months)"
        value={draft.project_duration_months}
        onChange={(v) => updateDraft({ project_duration_months: Math.max(1, v) })}
      />
      <NumField
        label="Active users"
        value={draft.active_users}
        onChange={(v) => updateDraft({ active_users: v })}
      />
      <NumField
        label="Requests / user / day"
        value={draft.requests_per_user_per_day}
        onChange={(v) => updateDraft({ requests_per_user_per_day: v })}
      />

      <Separator />

      <div className="grid grid-cols-2 gap-3">
        <NumField
          label="Avg input tokens"
          value={draft.avg_input_tokens}
          onChange={(v) => updateDraft({ avg_input_tokens: v })}
        />
        <NumField
          label="Avg output tokens"
          value={draft.avg_output_tokens}
          onChange={(v) => updateDraft({ avg_output_tokens: v })}
        />
        <NumField
          label="Avg reasoning tokens"
          value={draft.avg_reasoning_tokens}
          onChange={(v) => updateDraft({ avg_reasoning_tokens: v })}
        />
        <NumField
          label="Avg cached tokens"
          value={draft.avg_cached_tokens}
          onChange={(v) => updateDraft({ avg_cached_tokens: v })}
        />
      </div>

      <Separator />

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm">Cache eligible</Label>
          <Switch
            checked={draft.cache_eligible}
            onCheckedChange={(c) => updateDraft({ cache_eligible: c })}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label className="text-sm">Batch eligible</Label>
          <Switch
            checked={draft.batch_eligible}
            onCheckedChange={(c) => updateDraft({ batch_eligible: c })}
          />
        </div>
      </div>

      <Separator />

      <div className="space-y-2">
        <div className="text-xs uppercase tracking-widest text-muted-foreground">Context</div>
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Min window</span>
          <span className="tabular-nums">{draft.min_context_window?.toLocaleString() ?? "—"}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Recommended</span>
          <span className="tabular-nums">{draft.recommended_context_window?.toLocaleString() ?? "—"}</span>
        </div>
        <div className="flex flex-wrap gap-1.5 pt-2">
          {draft.complexity && (
            <Badge variant="outline" className="text-xs">
              Complexity: {draft.complexity}
            </Badge>
          )}
          {draft.latency_requirement && (
            <Badge variant="outline" className="text-xs">
              Latency: {draft.latency_requirement}
            </Badge>
          )}
        </div>
      </div>
    </aside>
  );
}

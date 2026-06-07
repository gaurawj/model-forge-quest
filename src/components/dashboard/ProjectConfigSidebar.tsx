import { useState } from "react";
import { useProjectConfigStore, USE_CASES, type ModelStrategy } from "@/stores/projectConfig";
import { useModelConfigStore } from "@/stores/modelConfig";
import { useRecommendationStore } from "@/stores/recommendation";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Play,
  Save,
  Share2,
  FileDown,
  Settings2,
  Cpu,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const STRATEGIES: { value: ModelStrategy; label: string }[] = [
  { value: "best-per-stage", label: "Best per Stage" },
  { value: "claude-only", label: "Claude Only" },
  { value: "gpt-only", label: "GPT Only" },
  { value: "gemini-only", label: "Gemini Only" },
  { value: "self-hosted", label: "Self Hosted" },
];

function complexityLabel(n: number): string {
  if (n <= 3) return "Low";
  if (n <= 7) return "Medium";
  return "High";
}

export function ProjectConfigSidebar() {
  const cfg = useProjectConfigStore();
  const updateDraft = useRecommendationStore((s) => s.updateDraft);
  const [projectOpen, setProjectOpen] = useState(true);
  const [modelOpen, setModelOpen] = useState(false);

  const onAnalyze = () => {
    updateDraft({
      project_duration_months: cfg.durationMonths,
      complexity: complexityLabel(cfg.complexity),
    });
    toast.success("Toolchain re-analyzed with updated assumptions");
  };

  return (
    <aside className="hidden lg:flex flex-col w-[340px] shrink-0 border-l border-white/[0.06] bg-white/[0.02] backdrop-blur-sm sticky top-0 h-screen overflow-y-auto">
      <div className="flex items-center gap-2 border-b border-white/[0.06] px-5 py-4">
        <Settings2 className="h-4 w-4 text-cyan-300" />
        <div>
          <div className="text-sm font-semibold">Configuration</div>
          <div className="text-[11px] text-muted-foreground">
            Tailor the recommendation
          </div>
        </div>
      </div>

      <div className="flex-1 px-3 py-3">
        <SectionGroup
          open={projectOpen}
          onOpenChange={setProjectOpen}
          icon={<Settings2 className="h-3.5 w-3.5 text-cyan-300" />}
          title="Project Configuration"
        >
          <div className="space-y-5 px-2 py-3">
            <Field label="Use Case">
              <Select value={cfg.useCase} onValueChange={(v) => cfg.update({ useCase: v })}>
                <SelectTrigger className="bg-background/40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {USE_CASES.map((u) => (
                    <SelectItem key={u.value} value={u.value}>
                      {u.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <SubSection title="Project Characteristics">
              <SliderField
                label="Complexity"
                value={cfg.complexity}
                onChange={(v) => cfg.update({ complexity: v })}
                minLabel="Simple"
                maxLabel="Complex"
              />
              <SliderField
                label="Codebase Size"
                value={cfg.codebaseSize}
                onChange={(v) => cfg.update({ codebaseSize: v })}
                minLabel="Small"
                maxLabel="Monorepo"
              />
              <SliderField
                label="Project Duration"
                value={cfg.durationMonths}
                onChange={(v) => cfg.update({ durationMonths: v })}
                min={1}
                max={36}
                unit="mo"
              />
            </SubSection>

            <Field label="Project Description">
              <Textarea
                value={cfg.description}
                onChange={(e) => cfg.update({ description: e.target.value })}
                placeholder="Brief context: goals, scale, constraints…"
                className="min-h-[88px] bg-background/40 text-xs"
              />
            </Field>

            <SubSection title="Compliance">
              <div className="grid grid-cols-1 gap-2">
                <ComplianceToggle k="soc2" label="SOC 2" />
                <ComplianceToggle k="hipaa" label="HIPAA" />
                <ComplianceToggle k="onPremise" label="On-Premise" />
                <ComplianceToggle k="zeroDataRetention" label="Zero Data Retention" />
              </div>
            </SubSection>

            <SubSection title="Model Strategy">
              <div className="flex flex-wrap gap-1.5">
                {STRATEGIES.map((s) => {
                  const active = cfg.strategy === s.value;
                  return (
                    <button
                      key={s.value}
                      onClick={() => cfg.update({ strategy: s.value })}
                      className={
                        "rounded-full border px-3 py-1.5 text-xs transition-colors " +
                        (active
                          ? "border-cyan-400/40 bg-cyan-400/10 text-cyan-100"
                          : "border-white/10 bg-white/[0.03] text-muted-foreground hover:text-foreground")
                      }
                    >
                      {s.label}
                    </button>
                  );
                })}
              </div>
            </SubSection>
          </div>
        </SectionGroup>

        <SectionGroup
          open={modelOpen}
          onOpenChange={setModelOpen}
          icon={<Cpu className="h-3.5 w-3.5 text-purple-300" />}
          title="Model Configuration"
        >
          <ModelConfigSection />
        </SectionGroup>
      </div>

      <div className="space-y-2 border-t border-white/[0.06] px-5 py-4">
        <Button
          size="sm"
          className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:opacity-90 text-white"
          onClick={onAnalyze}
        >
          <Play className="mr-1.5 h-3.5 w-3.5" /> Analyze Toolchain
        </Button>
        <div className="grid grid-cols-3 gap-2">
          <Button size="sm" variant="ghost" onClick={() => toast.info("Scenario saved")}>
            <Save className="mr-1 h-3.5 w-3.5" /> Save
          </Button>
          <Button size="sm" variant="ghost" onClick={() => toast.info("Export prepared")}>
            <FileDown className="mr-1 h-3.5 w-3.5" /> Export
          </Button>
          <Button size="sm" variant="ghost" onClick={() => toast.info("Share link copied")}>
            <Share2 className="mr-1 h-3.5 w-3.5" /> Share
          </Button>
        </div>
      </div>
    </aside>
  );
}

function ModelConfigSection() {
  const m = useModelConfigStore();
  return (
    <div className="space-y-5 px-2 py-3">
      <SubSection title="Workload">
        <SliderField
          label="Project Duration"
          value={m.project_duration_months}
          onChange={(v) => m.update({ project_duration_months: v })}
          min={1}
          max={36}
          unit="mo"
        />
        <SliderField
          label="Active Users"
          value={m.active_users}
          onChange={(v) => m.update({ active_users: v })}
          min={0}
          max={100000}
          step={100}
        />
        <SliderField
          label="Requests / User / Day"
          value={m.requests_per_user_per_day}
          onChange={(v) => m.update({ requests_per_user_per_day: v })}
          min={0}
          max={100}
          step={1}
        />
      </SubSection>

      <SubSection title="Token Profile">
        <SliderField
          label="Avg Input Tokens"
          value={m.avg_input_tokens}
          onChange={(v) => m.update({ avg_input_tokens: v })}
          min={0}
          max={200000}
          step={500}
        />
        <SliderField
          label="Avg Output Tokens"
          value={m.avg_output_tokens}
          onChange={(v) => m.update({ avg_output_tokens: v })}
          min={0}
          max={32000}
          step={100}
        />
        <SliderField
          label="Avg Reasoning Tokens"
          value={m.avg_reasoning_tokens}
          onChange={(v) => m.update({ avg_reasoning_tokens: v })}
          min={0}
          max={32000}
          step={100}
        />
        <SliderField
          label="Avg Cached Tokens"
          value={m.avg_cached_tokens}
          onChange={(v) => m.update({ avg_cached_tokens: v })}
          min={0}
          max={200000}
          step={500}
        />
        <ToggleRow
          label="Cache Eligible"
          checked={m.cache_eligible}
          onChange={(c) => m.update({ cache_eligible: c })}
        />
      </SubSection>
    </div>
  );
}

function SectionGroup({
  open,
  onOpenChange,
  icon,
  title,
  children,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Collapsible
      open={open}
      onOpenChange={onOpenChange}
      className="rounded-lg border border-white/[0.06] bg-white/[0.02] mb-2"
    >
      <CollapsibleTrigger className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left">
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-xs font-semibold uppercase tracking-wider">
            {title}
          </span>
        </div>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 text-muted-foreground transition-transform",
            open && "rotate-180",
          )}
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="border-t border-white/[0.06]">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </Label>
      {children}
    </div>
  );
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        {title}
      </div>
      {children}
    </div>
  );
}

function SliderField({
  label,
  value,
  onChange,
  min = 1,
  max = 10,
  step = 1,
  unit,
  decimals = 0,
  minLabel,
  maxLabel,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  decimals?: number;
  minLabel?: string;
  maxLabel?: string;
}) {
  const display = decimals > 0 ? value.toFixed(decimals) : String(value);
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between">
        <Label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </Label>
        <span className="text-xs font-semibold tabular-nums">
          {unit === "$" ? "$" : ""}
          {display}
          {unit && unit !== "$" ? ` ${unit}` : ""}
          {!unit ? ` / ${max}` : ""}
        </span>
      </div>
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={(v) => onChange(v[0])}
      />
      {(minLabel || maxLabel) && (
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>{minLabel}</span>
          <span>{maxLabel}</span>
        </div>
      )}
    </div>
  );
}

function ComplianceToggle({
  k,
  label,
}: {
  k: keyof ReturnType<typeof useProjectConfigStore.getState>["compliance"];
  label: string;
}) {
  const v = useProjectConfigStore((s) => s.compliance[k]);
  const set = useProjectConfigStore((s) => s.setCompliance);
  return (
    <ToggleRow label={label} checked={v} onChange={(c) => set(k, c)} />
  );
}

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-md border border-white/[0.06] bg-background/30 px-3 py-2">
      <span className="text-xs">{label}</span>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

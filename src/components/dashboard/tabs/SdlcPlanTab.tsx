import { useSdlcRows } from "@/lib/sdlcMapping";
import { SdlcStageAccordion } from "@/components/dashboard/sdlc/SdlcStageAccordion";
import { GlassCard } from "@/components/ui/GlassCard";

export function SdlcPlanTab() {
  const rows = useSdlcRows();

  if (rows.length === 0) {
    return (
      <GlassCard className="p-10 text-center text-sm text-muted-foreground">
        No SDLC plan available yet — submit the questionnaire to generate one.
      </GlassCard>
    );
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-[1.2fr_1fr_1fr_1fr_auto] gap-4 px-5 pb-2 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
        <span>Stage</span>
        <span>Recommended Model</span>
        <span>Budget Model</span>
        <span>Premium Model</span>
        <span />
      </div>
      <div className="space-y-2">
        {rows.map((r, i) => (
          <SdlcStageAccordion key={r.stage.id} row={r} defaultOpen={i === 0} />
        ))}
      </div>
    </div>
  );
}

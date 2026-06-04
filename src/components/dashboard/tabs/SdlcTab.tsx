import { useRecommendationStore } from "@/stores/recommendation";
import { useModelsStore } from "@/stores/models";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function modelName(id: string | undefined, models: ReturnType<typeof useModelsStore.getState>["models"]) {
  if (!id) return "—";
  return models.find((m) => m.id === id)?.name ?? id;
}

export function SdlcTab() {
  const rec = useRecommendationStore((s) => s.recommendation);
  const models = useModelsStore((s) => s.models);
  if (!rec) return null;
  const arch = rec.architecture ?? {};
  const roles = arch.roles ?? [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <InfoCard label="Pattern" value={arch.pattern ?? "—"} />
        <InfoCard label="Hosting strategy" value={arch.hosting_strategy ?? "—"} />
        <InfoCard label="Framework" value={arch.framework ?? "—"} />
      </div>

      {arch.framework_constraints && arch.framework_constraints.length > 0 && (
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">
            Framework constraints
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {arch.framework_constraints.map((c) => (
              <Badge key={c} variant="outline" className="text-xs">{c}</Badge>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-lg border border-border bg-card">
        <div className="border-b border-border px-4 py-3">
          <div className="text-sm font-medium">Architecture roles</div>
          <div className="text-xs text-muted-foreground">Model assignment per role</div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Role</TableHead>
              <TableHead>Recommended</TableHead>
              <TableHead>Budget</TableHead>
              <TableHead>Premium</TableHead>
              <TableHead>Reason</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {roles.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-sm text-muted-foreground">
                  No roles defined.
                </TableCell>
              </TableRow>
            )}
            {roles.map((r, i) => (
              <TableRow key={`${r.role}-${i}`}>
                <TableCell className="font-medium">{r.role}</TableCell>
                <TableCell className="text-sm">{modelName(r.recommended_model_id, models)}</TableCell>
                <TableCell className="text-sm">{modelName(r.budget_model_id, models)}</TableCell>
                <TableCell className="text-sm">{modelName(r.premium_model_id, models)}</TableCell>
                <TableCell className="max-w-xs text-xs text-muted-foreground">{r.reason ?? "—"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {arch.notes && (
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">Notes</div>
          <p className="mt-2 text-sm text-foreground/90 whitespace-pre-line">{arch.notes}</p>
        </div>
      )}
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-1.5 text-sm font-medium">{value}</div>
    </div>
  );
}
